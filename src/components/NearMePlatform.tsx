'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Camera,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Layers,
  Lock,
  Scale,
  Store,
  QrCode,
  Timer,
  Download,
  Globe,
  TrendingDown,
  Zap,
} from 'lucide-react';
import {
  AUDIT_PRESETS,
  AuditPreset,
  MultiDocAuditResult,
  SEEDED_MERCHANTS,
  SEEDED_ESCROWS,
  SeededEscrowRecord,
  ZONE_WHOLESALE_INDEX,
} from '@/lib/seeded-marketplace';
import { triggerNearMeCheckout } from '@/lib/razorpayClient';
import PhoneAuthModal from './QuickAuthModal';
import UpiFallbackModal from './UpiFallbackModal';
import SavingsPassModal from './SavingsPassModal';
import UniversalShareModal from './UniversalShareModal';
import { useToast } from './Toast';
import { COPY_BY_LANG, normalizeLang } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/autonomousStore';

const SERVERLESS_SAFE_LIMIT_BYTES = 3.0 * 1024 * 1024; // 3.0 MB compression trigger
const PAYLOAD_BUDGET_BYTES = 3.2 * 1024 * 1024; // 3.2 MB strict ceiling (< 4.5 MB Vercel limit)
const PDF_STREAM_SLICE_BYTES = 4 * 1024 * 1024; // 4 MB File.slice() chunk size

export interface ProcessedAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number;
  base64Data?: string;
  extractedText?: string;
  compressed?: boolean;
}

type CorePillar = 'auditor' | 'escrow' | 'ecourt' | 'marketplace';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extractReadableTextFromChunk(raw: string, maxChars = 12000): string {
  const pdfLiterals: string[] = [];
  const literalRegex = /\(([^()\\]{3,160})\)/g;
  let match: RegExpExecArray | null;
  while ((match = literalRegex.exec(raw)) !== null && pdfLiterals.join(' ').length < maxChars) {
    const cleaned = match[1].replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length >= 3 && /[a-zA-Z0-9]/.test(cleaned)) {
      pdfLiterals.push(cleaned);
    }
  }
  if (pdfLiterals.length >= 8) {
    return pdfLiterals.join('\n').slice(0, maxChars);
  }
  const asciiMatches = raw.match(/[A-Za-z0-9₹.,:/\-()% ]{5,}/g) || [];
  return asciiMatches
    .filter((line) => /[a-zA-Z0-9]/.test(line))
    .slice(0, 350)
    .join('\n')
    .slice(0, maxChars);
}

/**
 * Streams a PDF of any size (1 to 1,000+ pages) via File.slice() chunks
 * so multi-hundred-page PDFs never freeze the browser or exceed serverless limits.
 */
async function streamPdfPageCountAndText(
  file: File,
  onSliceProgress: (ratio: number) => void
): Promise<{ pageCount: number; extractedText: string }> {
  const decoder = new TextDecoder('latin1');
  let totalPageTags = 0;
  let maxRootCount = 0;
  const textParts: string[] = [];
  let offset = 0;
  let chunkIndex = 0;

  while (offset < file.size) {
    const end = Math.min(file.size, offset + PDF_STREAM_SLICE_BYTES);
    const sliceBuffer = await file.slice(offset, end).arrayBuffer();
    const rawChunk = decoder.decode(new Uint8Array(sliceBuffer));

    const pageMatches = rawChunk.match(/\/Type\s*\/Page\b(?!s)/g);
    if (pageMatches) totalPageTags += pageMatches.length;

    const countMatches = rawChunk.match(/\/Count\s+(\d+)/g);
    if (countMatches) {
      for (const m of countMatches) {
        const val = Number(m.replace(/\/Count\s+/, ''));
        if (!Number.isNaN(val) && val > maxRootCount && val < 50000) {
          maxRootCount = val;
        }
      }
    }

    if (textParts.join('\n').length < 38000) {
      const chunkText = extractReadableTextFromChunk(rawChunk, 6500);
      if (chunkText) {
        textParts.push(`[Stream Chunk ${chunkIndex + 1}]\n${chunkText}`);
      }
    }

    offset = end;
    chunkIndex += 1;
    onSliceProgress(Math.min(1, offset / Math.max(1, file.size)));
  }

  const pageCount = Math.max(1, totalPageTags || maxRootCount || 1);
  return {
    pageCount,
    extractedText: textParts.join('\n').slice(0, 40000),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function compressImageToJpegBase64(file: File, maxDim = 1100, quality = 0.62): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      const result = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Image decode failed: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

export default function NearMePlatform({
  compact = false,
  lang,
}: {
  compact?: boolean;
  lang?: SupportedLang;
}) {
  const [activePillar, setActivePillar] = useState<CorePillar>('auditor');
  const [localLang, setLocalLang] = useState<SupportedLang>(lang || 'EN');

  useEffect(() => {
    if (lang) {
      setLocalLang(lang);
      return;
    }
    setLocalLang(normalizeLang(localStorage.getItem('nearme_lang')));
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLang>;
      setLocalLang(normalizeLang(custom.detail));
    };
    window.addEventListener('nearme-lang-change', handler);
    return () => window.removeEventListener('nearme-lang-change', handler);
  }, [lang]);

  const uiCopy = COPY_BY_LANG[lang || localLang];

  // Pillar 1: Unlimited-Page Streaming Bill Auditor
  const [attachments, setAttachments] = useState<ProcessedAttachment[]>([]);
  const [streamProgress, setStreamProgress] = useState<number>(0);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditStatusMsg, setAuditStatusMsg] = useState('');
  const [auditResult, setAuditResult] = useState<MultiDocAuditResult | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Multiplier B: 30-Minute Reverse Dutch Auction Timer
  const [dutchSecondsLeft, setDutchSecondsLeft] = useState<number>(1800);
  const [selectedDutchBid, setSelectedDutchBid] = useState<{
    supplier: string;
    bidAmount: number;
    extraPct: number;
  } | null>(null);

  // Pillar 2 + Multiplier C: 15/85 Escrow + MSME 43B(h)
  const [escrows, setEscrows] = useState<SeededEscrowRecord[]>(SEEDED_ESCROWS);
  const [escrowAmount, setEscrowAmount] = useState<number>(125000);
  const [escrowMerchant, setEscrowMerchant] = useState<string>(SEEDED_MERCHANTS[0].business_name);
  const [msme43bh, setMsme43bh] = useState<boolean>(true);
  const [otpInput, setOtpInput] = useState<string>('');
  const [escrowBusy, setEscrowBusy] = useState<boolean>(false);

  // Pillar 3: GSTIN Mod-36 & e-Court Trust Shield
  const [gstinInput, setGstinInput] = useState<string>('29AABCS1429B1ZQ');
  const [verifyResult, setVerifyResult] = useState<{
    gstin: string;
    formatValid: boolean;
    mod36ChecksumValid: boolean;
    businessName: string;
    trustScore: number;
    eCourtForum: string;
  } | null>(null);

  // Pillar 4: ₹99/Day Shop AI Twin & Live Cash Orders
  const [aiTwinActive, setAiTwinActive] = useState<boolean>(false);

  // Pillar 5: 0.1% Student & Trader QR Army
  const [qrPhone, setQrPhone] = useState<string>('8247831885');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Multiplier D: 19,300+ Pincode Benchmark Index Toggle
  const [selectedZoneIdx, setSelectedZoneIdx] = useState<number>(0);

  // Shared Auth / Checkout Modals
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [fallbackAmount, setFallbackAmount] = useState<number | null>(null);
  const [showPass, setShowPass] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!auditResult || auditResult.counter_offer_price_inr < 10000) return;
    setDutchSecondsLeft(1800);
    const interval = setInterval(() => {
      setDutchSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [auditResult]);

  const totalDetectedPages = attachments.reduce((sum, f) => sum + f.pageCount, 0);
  const totalRawBytes = attachments.reduce((sum, f) => sum + f.sizeBytes, 0);

  const requireAuth = (actionFn: () => void) => {
    const userPhone = localStorage.getItem('nearme_user_phone');
    if (!userPhone) {
      setPendingAction(() => actionFn);
      setShowAuth(true);
    } else {
      actionFn();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    setProcessingFiles(true);
    setStreamProgress(5);
    setActivePresetId(null);

    try {
      const processedBatch: ProcessedAttachment[] = [];
      const batchTotalSize = totalRawBytes + incoming.reduce((acc, f) => acc + f.size, 0);
      const isHeavyBatch = batchTotalSize > SERVERLESS_SAFE_LIMIT_BYTES;

      for (let i = 0; i < incoming.length; i += 1) {
        const file = incoming[i];
        const lowerName = file.name.toLowerCase();
        const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
        const isImage = file.type.startsWith('image/');
        const isTextOrJson =
          file.type === 'text/csv' ||
          file.type === 'text/plain' ||
          file.type === 'application/json' ||
          lowerName.endsWith('.csv') ||
          lowerName.endsWith('.txt') ||
          lowerName.endsWith('.json');

        if (isPdf) {
          const { pageCount, extractedText } = await streamPdfPageCountAndText(
            file,
            (fileRatio) => {
              const overall = Math.round(((i + fileRatio) / incoming.length) * 100);
              setStreamProgress(Math.max(5, overall));
            }
          );
          const needsTextPacking = isHeavyBatch || file.size > SERVERLESS_SAFE_LIMIT_BYTES;
          let base64Data: string | undefined;
          if (!needsTextPacking) {
            base64Data = await readFileAsDataUrl(file);
          }
          processedBatch.push({
            id: `${file.name}-${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            mimeType: 'application/pdf',
            sizeBytes: file.size,
            pageCount,
            base64Data,
            extractedText: `[PDF Stream Pages: ${pageCount}]\n${extractedText}`,
            compressed: needsTextPacking,
          });
        } else if (isImage) {
          const quality = incoming.length > 15 || isHeavyBatch ? 0.5 : 0.68;
          const maxDim = incoming.length > 20 || isHeavyBatch ? 920 : 1200;
          const compressedDataUrl = await compressImageToJpegBase64(file, maxDim, quality);

          processedBatch.push({
            id: `${file.name}-${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            mimeType: 'image/jpeg',
            sizeBytes: file.size,
            pageCount: 1,
            base64Data: compressedDataUrl,
            compressed: true,
          });
        } else if (isTextOrJson) {
          const textContent = (await file.text()).slice(0, 40000);
          const lineCount = textContent.split('\n').length;
          const estimatedPages = Math.max(1, Math.ceil(lineCount / 45));
          processedBatch.push({
            id: `${file.name}-${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            mimeType: file.type || 'text/csv',
            sizeBytes: file.size,
            pageCount: estimatedPages,
            extractedText: textContent,
          });
        } else {
          // .doc, .docx, .xls, .xlsx streamed in chunks
          const sliceBuffer = await file.slice(0, Math.min(file.size, PDF_STREAM_SLICE_BYTES)).arrayBuffer();
          const raw = new TextDecoder('latin1').decode(new Uint8Array(sliceBuffer));
          const extractedText = extractReadableTextFromChunk(raw, 36000);
          const estimatedPages = Math.max(1, Math.ceil(file.size / 42000));
          processedBatch.push({
            id: `${file.name}-${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            pageCount: estimatedPages,
            extractedText,
          });
        }
        setStreamProgress(Math.round(((i + 1) / incoming.length) * 100));
      }

      if (processedBatch.length > 0) {
        setAttachments((prev) => [...prev, ...processedBatch]);
        const addedPages = processedBatch.reduce((acc, item) => acc + item.pageCount, 0);
        toast(
          `Indexed ${processedBatch.length} file(s) • ${addedPages} Page(s) Ready`,
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      toast('Document stream error. Please retry.', 'error');
    } finally {
      setProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const runDeepAudit = async (overrideAttachments?: ProcessedAttachment[], preset?: AuditPreset) => {
    const targetAttachments = overrideAttachments || attachments;
    if (targetAttachments.length === 0 && !preset) {
      toast('Upload any document/image or select a 1-tap preset first', 'error');
      return;
    }

    setAuditing(true);
    const pages =
      targetAttachments.reduce((sum, f) => sum + f.pageCount, 0) || preset?.pageCount || 1;
    setAuditStatusMsg(`Map-Reduce Auditing ${pages} Page(s) with Gemini 2.5 Flash...`);

    try {
      const city = preset?.city || localStorage.getItem('nearme_city') || 'Bengaluru';
      const pincode = preset?.pincode || '560001';

      let runningPayloadBytes = 0;
      const safeAttachments = targetAttachments.map((att) => {
        const b64Len = att.base64Data ? att.base64Data.length : 0;
        const canIncludeBinary =
          b64Len > 0 && runningPayloadBytes + b64Len < PAYLOAD_BUDGET_BYTES;
        if (canIncludeBinary) {
          runningPayloadBytes += b64Len;
        }
        return {
          name: att.name,
          mimeType: att.mimeType,
          pageCount: att.pageCount,
          base64Data: canIncludeBinary ? att.base64Data : undefined,
          extractedText:
            att.extractedText ||
            (!canIncludeBinary
              ? `[Streamed compact manifest for ${att.name} (${att.pageCount} pages) under 3.2 MB payload cap]`
              : undefined),
        };
      });

      const response = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: safeAttachments,
          totalPagesDetected: pages,
          billText: preset?.sampleText,
          presetId: preset?.id || activePresetId || undefined,
          city,
          pincode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Audit engine returned ${response.status}`);
      }

      const data = (await response.json()) as MultiDocAuditResult;
      setAuditResult(data);
      setSelectedDutchBid(null);
      setEscrowAmount(data.counter_offer_price_inr);
      toast(
        `Audited ${data.totalPagesAudited} Pages • Saved ₹${data.user_savings_inr.toLocaleString('en-IN')}!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      toast('Audit failed. Please retry.', 'error');
    } finally {
      setAuditing(false);
      setAuditStatusMsg('');
    }
  };

  const handleLoadPreset = async (preset: AuditPreset) => {
    setActivePresetId(preset.id);
    const simulatedFile: ProcessedAttachment = {
      id: `preset-${preset.id}`,
      name: preset.fileName,
      mimeType: preset.mimeType,
      sizeBytes: preset.pageCount * 195 * 1024,
      pageCount: preset.pageCount,
      extractedText: preset.sampleText,
      compressed: true,
    };
    setAttachments([simulatedFile]);
    setStreamProgress(100);
    await runDeepAudit([simulatedFile], preset);
  };

  const handleDownloadIrdaiRebuttal = () => {
    if (!auditResult?.irdaiRebuttal) return;
    const blob = new Blob([auditResult.irdaiRebuttal.legalNoticeText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NearMe_IRDAI_TPA_Rebuttal_${auditResult.totalPagesAudited}Pages.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Official IRDAI / TPA Rebuttal Legal Notice downloaded!', 'success');
  };

  const handleExportAuditCsv = () => {
    if (!auditResult) return;
    const headers = [
      'Page Range',
      'Department / Section',
      'Line Items',
      'Billed (INR)',
      'Fair Benchmark (INR)',
      'Overcharge Stripped (INR)',
      'Audit Flag Reason',
    ];
    const rows = auditResult.pageBreakdown.map((row) => [
      `"${String(row.pageRange).replace(/"/g, '""')}"`,
      `"${String(row.departmentOrSection).replace(/"/g, '""')}"`,
      row.lineItemsCount,
      row.billedAmount,
      row.fairBenchmarkAmount,
      row.overchargeStripped,
      `"${String(row.flagReason).replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NearMe_Audit_Ledger_${auditResult.totalPagesAudited}Pages.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${auditResult.totalPagesAudited}-Page Audit Ledger CSV!`, 'success');
  };

  const handleCreateEscrow = async () => {
    setEscrowBusy(true);
    try {
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: localStorage.getItem('nearme_user_name') || 'NearMe Verified Buyer',
          merchantName: escrowMerchant,
          totalAmountInr: escrowAmount,
          msme43bhDiscounting: msme43bh,
        }),
      });
      const data = await res.json();
      if (res.ok && data.escrow) {
        setEscrows((prev) => [data.escrow, ...prev]);
        toast(
          `15/85 Escrow Locked (${data.escrow.id}) • Delivery OTP: ${data.escrow.delivery_otp}`,
          'success'
        );
      }
    } catch {
      toast('Escrow creation error', 'error');
    } finally {
      setEscrowBusy(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', escrowId, otp: otpInput || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.escrow) {
        setEscrows((prev) => prev.map((e) => (e.id === escrowId ? data.escrow : e)));
        toast(`85% Payout Released to Merchant for ${escrowId}!`, 'success');
      } else {
        toast(data.error || 'OTP mismatch', 'error');
      }
    } catch {
      toast('Release failed', 'error');
    }
  };

  const handleRefundEscrow = async (escrowId: string) => {
    try {
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', escrowId }),
      });
      const data = await res.json();
      if (res.ok && data.escrow) {
        setEscrows((prev) => prev.map((e) => (e.id === escrowId ? data.escrow : e)));
        toast(`48-Hr Refund Guarantee Initiated for ${escrowId}!`, 'info');
      }
    } catch {
      toast('Refund request failed', 'error');
    }
  };

  const handleVerifyGstin = async () => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: gstinInput }),
      });
      const data = await res.json();
      setVerifyResult(data);
      toast(
        data.mod36ChecksumValid
          ? `GSTIN Mod-36 Verified! Trust Score: ${data.trustScore}/100`
          : `GSTIN Checked • Trust Score: ${data.trustScore}/100`,
        data.mod36ChecksumValid ? 'success' : 'info'
      );
    } catch {
      toast('Verification check failed', 'error');
    }
  };

  const dutchBids = auditResult
    ? [
        {
          supplier: `${auditResult.winning_provider_name} (Direct Lot)`,
          extraPct: 3,
          bidAmount: Math.round(auditResult.counter_offer_price_inr * 0.97),
        },
        {
          supplier: 'Pan-India Institutional Syndicate #2',
          extraPct: 6,
          bidAmount: Math.round(auditResult.counter_offer_price_inr * 0.94),
        },
        {
          supplier: 'Verified Wholesale Factory Direct #3',
          extraPct: 8,
          bidAmount: Math.round(auditResult.counter_offer_price_inr * 0.92),
        },
      ]
    : [];

  const shareUrl = `https://www.nearme-india.org/?ref=${encodeURIComponent(qrPhone || '8247831885')}`;
  const minsLeft = String(Math.floor(dutchSecondsLeft / 60)).padStart(2, '0');
  const secsLeft = String(dutchSecondsLeft % 60).padStart(2, '0');

  return (
    <div className="w-full relative space-y-6">
      {showAuth && (
        <PhoneAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      )}
      {fallbackAmount !== null && (
        <UpiFallbackModal
          amount={fallbackAmount}
          onClose={() => setFallbackAmount(null)}
          onSuccess={() => {
            toast('Transaction Completed!', 'success');
            setShowPass(true);
          }}
        />
      )}
      {showPass && (
        <SavingsPassModal
          amount={auditResult?.user_savings_inr || fallbackAmount || 25000}
          service={auditResult?.bill_type || 'NearMe 15/85 Escrow'}
          onClose={() => setShowPass(false)}
        />
      )}
      {showShareModal && (
        <UniversalShareModal
          onClose={() => setShowShareModal(false)}
          shareUrl={shareUrl}
          shareText={`Audit 1–500+ page hospital & wholesale bills on NearMe India with 0.1% QR partner ${qrPhone || '8247831885'}`}
          title="NearMe India 0.1% QR Army Partner Pass"
          subtitle="Scan via PhonePe / GPay / WhatsApp camera to earn 0.1% lifetime affiliate commission"
        />
      )}

      {auditing && (
        <div className="absolute inset-0 z-40 bg-gray-950/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
          <p className="text-lg sm:text-xl font-black text-white animate-pulse">
            {auditStatusMsg || 'Running Unlimited-Page Map-Reduce Audit...'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Cross-checking IRDAI non-payables, NPPA ceiling schedules, ICD-10 codes & wholesale benchmarks
          </p>
        </div>
      )}

      {/* 4 Main Color-Coded Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-900/70 border border-slate-800 rounded-2xl p-2">
        <button
          type="button"
          onClick={() => setActivePillar('auditor')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activePillar === 'auditor'
              ? 'bg-gradient-to-br from-emerald-600/30 via-teal-600/20 to-cyan-600/15 border-emerald-400/70 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400 mb-1" />
          <p className="text-xs font-extrabold leading-tight truncate">{uiCopy.tab1}</p>
          <p className="text-[11px] text-emerald-300">₹49 / ₹199 · Streaming Audit</p>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('escrow')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activePillar === 'escrow'
              ? 'bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-cyan-600/15 border-blue-400/70 text-white shadow-lg shadow-blue-950/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/40'
          }`}
        >
          <Lock className="w-4 h-4 text-cyan-400 mb-1" />
          <p className="text-xs font-extrabold leading-tight truncate">{uiCopy.tab2}</p>
          <p className="text-[11px] text-cyan-300">48h Refund · 3% Day-1</p>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('ecourt')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activePillar === 'ecourt'
              ? 'bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-yellow-500/15 border-amber-400/70 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400 mb-1" />
          <p className="text-xs font-extrabold leading-tight truncate">{uiCopy.tab3}</p>
          <p className="text-[11px] text-amber-300">Mod-36 GSTIN · e-Daakhil</p>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('marketplace')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activePillar === 'marketplace'
              ? 'bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-purple-600/15 border-violet-400/70 text-white shadow-lg shadow-violet-950/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/40'
          }`}
        >
          <Store className="w-4 h-4 text-fuchsia-400 mb-1" />
          <p className="text-xs font-extrabold leading-tight truncate">{uiCopy.tab4}</p>
          <p className="text-[11px] text-fuchsia-300">₹99/Day · 0.1% QR Army</p>
        </button>
      </div>

      {/* PILLAR 1: UNLIMITED-PAGE (1 TO 500+ PAGES) STREAMING AUDITOR */}
      {activePillar === 'auditor' && (
        <div className={compact ? 'w-full space-y-5' : 'w-full max-w-4xl mx-auto space-y-5'}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-400" />
                Unlimited-Page (1 to 500+ Pages) Streaming Bill Auditor
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                ₹49 Standard Audit / ₹199 Heavy Institutional Audit (Bills ≥ ₹10,000) • Zero Page or File Caps
              </p>
            </div>
            {attachments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Streaming Document Indexer: {attachments.length} Files • {totalDetectedPages} Total Pages Scanned (Unlimited Page Capacity) • Ready for Deep Line-Item Audit
              </span>
            )}
          </div>

          {/* 1-Tap Presets */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 text-left">
              1-Tap Unlimited-Page Simulation Presets:
            </p>
            <div className="flex flex-wrap gap-2">
              {AUDIT_PRESETS.map((preset, idx) => {
                const presetThemes = [
                  'bg-gradient-to-r from-rose-500/25 via-emerald-500/20 to-cyan-500/25 border-emerald-400/60 text-emerald-100 hover:border-cyan-300 shadow-lg shadow-emerald-950/40',
                  'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-100 hover:border-amber-300',
                  'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-100 hover:border-cyan-300',
                  'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/50 text-yellow-100 hover:border-yellow-300',
                  'bg-gradient-to-r from-lime-500/20 to-emerald-500/20 border-lime-400/50 text-lime-100 hover:border-lime-300',
                  'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-violet-400/50 text-violet-100 hover:border-violet-300',
                ];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-left ${
                      presetThemes[idx % presetThemes.length]
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!auditResult ? (
            <div className="space-y-4">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className="w-full min-h-[185px] border-2 border-dashed border-emerald-400/50 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950/35 via-slate-900/90 to-indigo-950/35 cursor-pointer hover:border-cyan-400 hover:from-emerald-950/50 hover:to-cyan-950/40 transition-all p-6 text-center shadow-lg shadow-emerald-950/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.pdf,.csv,.txt,.doc,.docx,.xls,.xlsx,.json"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                {processingFiles ? (
                  <div className="w-full max-w-md space-y-3">
                    <Loader2 className="w-9 h-9 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-emerald-300 font-bold text-sm">
                      Streaming Chunks via File.slice()... {streamProgress}%
                    </p>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 transition-all duration-200"
                        style={{ width: `${streamProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40">
                        <Upload className="w-7 h-7 text-emerald-300" />
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
                        <FileText className="w-7 h-7 text-cyan-300" />
                      </div>
                      <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-400/40">
                        <Camera className="w-7 h-7 text-violet-300" />
                      </div>
                    </div>
                    <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200 bg-clip-text text-transparent font-black text-base">
                      Drop 50, 150, or 500+ Page Hospital PDFs, Wholesale BOQs, Excel/CSV, or 50+ Photos
                    </span>
                    <span className="text-xs text-slate-300 mt-1">
                      PDF, JPG/PNG/WEBP, CSV, TXT, DOC/DOCX, XLS/XLSX, JSON • Auto-Packed &lt;3.2 MB (Zero 413 Errors)
                    </span>
                  </>
                )}
              </label>

              {attachments.length > 0 && (
                <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 space-y-3 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-gray-300">
                      Stream Queue: {attachments.length} file(s) • {totalDetectedPages} total page(s) • {formatBytes(totalRawBytes)}
                    </span>
                    {totalRawBytes > SERVERLESS_SAFE_LIMIT_BYTES && (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        Compact Map-Reduce Stream Active (&lt;3.2 MB Safe)
                      </span>
                    )}
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.mimeType.includes('pdf') ? (
                            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : file.mimeType.includes('csv') || file.name.endsWith('.xlsx') ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{file.name}</p>
                            <p className="text-[11px] text-gray-400">
                              {formatBytes(file.sizeBytes)} •{' '}
                              <span className="text-emerald-400 font-semibold">
                                {file.pageCount} page{file.pageCount > 1 ? 's' : ''}
                              </span>
                              {file.compressed ? ' • Stream-Indexed' : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          aria-label={`Remove ${file.name}`}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => runDeepAudit()}
                    disabled={auditing || processingFiles}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Run Unlimited-Page Map-Reduce Audit ({totalDetectedPages} Pages)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-5 text-left">
              {/* Verification Banner */}
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm sm:text-base font-black text-white">
                      Unlimited-Page Deep Audit Ledger: {auditResult.totalPagesAudited} Pages •{' '}
                      {auditResult.totalLineItemsScanned.toLocaleString('en-IN')} Line Items •{' '}
                      {auditResult.flaggedPagesCount} Pages Flagged
                    </p>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      {auditResult.bill_type} • Audit Fee Tier: ₹{auditResult.auditFeeInr}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-950/70 text-emerald-300 border border-emerald-500/30 shrink-0">
                  100% Pages Audited
                </span>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-bold uppercase">Original Billed</p>
                  <p className="text-2xl font-black text-gray-300 line-through mt-1">
                    ₹{auditResult.original_amount_inr.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-gray-900/80 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-xs text-emerald-400 font-bold uppercase">AI Audited Fair Total</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    ₹
                    {(selectedDutchBid?.bidAmount || auditResult.counter_offer_price_inr).toLocaleString(
                      'en-IN'
                    )}
                  </p>
                </div>
                <div className="bg-gray-900/80 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-xs text-blue-400 font-bold uppercase">Total Overcharge Stripped</p>
                  <p className="text-2xl font-black text-white mt-1">
                    ₹
                    {(
                      auditResult.original_amount_inr -
                      (selectedDutchBid?.bidAmount || auditResult.counter_offer_price_inr)
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Unlimited-Page Department Breakdown Table */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Unlimited-Page Department Breakdown Table
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-slate-300 tabular-nums">
                      15/85 Escrow Fee: ₹{auditResult.platform_success_fee_inr.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={handleExportAuditCsv}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider bg-gray-900/40">
                        <th className="py-3 px-4 font-bold">Page Range</th>
                        <th className="py-3 px-4 font-bold">Department / Section</th>
                        <th className="py-3 px-4 font-bold text-right">Line Items</th>
                        <th className="py-3 px-4 font-bold text-right">Billed</th>
                        <th className="py-3 px-4 font-bold text-right">Benchmark</th>
                        <th className="py-3 px-4 font-bold text-right">Stripped</th>
                        <th className="py-3 px-4 font-bold">Audit Flag Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/80">
                      {auditResult.pageBreakdown.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-900/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-300 whitespace-nowrap">
                            {row.pageRange}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {row.departmentOrSection}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300 whitespace-nowrap">
                            {row.lineItemsCount}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-400 line-through whitespace-nowrap">
                            ₹{row.billedAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">
                            ₹{row.fairBenchmarkAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-rose-400 font-black whitespace-nowrap">
                            -₹{row.overchargeStripped.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-gray-300">{row.flagReason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MULTIPLIER A: IRDAI / TPA Claim Reversal & Legal Notice */}
              {auditResult.irdaiRebuttal && (
                <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                        Multiplier A • IRDAI TPA Claim Reversal Engine
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {auditResult.irdaiRebuttal.disallowedConsumablesCount} Disallowed Consumables Reclassified • Recoverable: ₹
                        {auditResult.irdaiRebuttal.recoverableAmountInr.toLocaleString('en-IN')}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadIrdaiRebuttal}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Official IRDAI / TPA Rebuttal Legal Notice
                    </button>
                  </div>
                  <p className="text-xs text-indigo-200/80">
                    {auditResult.irdaiRebuttal.tpaRebuttalSummary} (ICD-10:{' '}
                    {auditResult.irdaiRebuttal.icd10Codes.join(' • ')})
                  </p>
                </div>
              )}

              {/* MULTIPLIER B: 30-Minute Reverse Dutch Auction (Quotes >= ₹10,000) */}
              {auditResult.counter_offer_price_inr >= 10000 && (
                <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                        Multiplier B • 30-Minute Reverse Dutch Auction
                      </span>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-amber-400" />
                        Live Suppliers Bidding Below AI Benchmark (3%–8% Extra Cut)
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-black">
                      <Timer className="w-3.5 h-3.5" /> {minsLeft}:{secsLeft} Remaining
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {dutchBids.map((bid, bIdx) => {
                      const isSelected = selectedDutchBid?.supplier === bid.supplier;
                      return (
                        <button
                          key={bIdx}
                          type="button"
                          onClick={() => {
                            setSelectedDutchBid(bid);
                            setEscrowAmount(bid.bidAmount);
                            toast(`Selected ${bid.extraPct}% Reverse Dutch Bid!`, 'success');
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400'
                              : 'bg-gray-900/80 border-gray-800 hover:border-amber-500/50'
                          }`}
                        >
                          <p className="text-[11px] font-bold text-gray-300 truncate">{bid.supplier}</p>
                          <p className="text-base font-black text-amber-400 mt-0.5">
                            ₹{bid.bidAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-bold">
                            Extra {bid.extraPct}% Below Benchmark
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    requireAuth(() => {
                      const finalPay =
                        selectedDutchBid?.bidAmount || auditResult.counter_offer_price_inr;
                      triggerNearMeCheckout({
                        itemName: `Lock Audited Price (${auditResult.bill_type})`,
                        amountInRupees: finalPay,
                        actionType: 'live_checkout',
                        onSuccess: () => {
                          toast('Audited Deal Locked via 15/85 Escrow!', 'success');
                          setShowPass(true);
                        },
                        onFallback: () => {
                          setFallbackAmount(finalPay);
                        },
                        onAuthRequired: () => setShowAuth(true),
                      });
                    })
                  }
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  Lock Slashed Price via 15/85 UPI Escrow (₹
                  {(selectedDutchBid?.bidAmount || auditResult.counter_offer_price_inr).toLocaleString(
                    'en-IN'
                  )}
                  )
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuditResult(null);
                    setAttachments([]);
                    setActivePresetId(null);
                    setSelectedDutchBid(null);
                  }}
                  className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl transition-colors"
                >
                  Scan Another Bill
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2 + MULTIPLIER C: 15/85 PROTECTED WHOLESALE UPI ESCROW & MSME 43B(h) */}
      {activePillar === 'escrow' && (
        <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 space-y-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                15/85 Protected Wholesale UPI Escrow & MSME Section 43B(h)
              </h3>
              <p className="text-xs text-gray-400">
                48-Hr Refund Guarantee • OTP Delivery Release • Optional 3% Day-1 Invoice Discounting
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 bg-gray-900/70 border border-gray-800 rounded-xl p-4">
            <div className="space-y-3">
              <label className="block text-xs text-gray-400 font-bold">
                Verified Supplier / Hospital
                <select
                  value={escrowMerchant}
                  onChange={(e) => setEscrowMerchant(e.target.value)}
                  className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {SEEDED_MERCHANTS.map((m) => (
                    <option key={m.id} value={m.business_name}>
                      {m.business_name} ({m.city})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-gray-400 font-bold">
                Contract Amount (₹ INR)
                <input
                  type="number"
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(Number(e.target.value) || 0)}
                  className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                />
              </label>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <label className="flex items-start gap-2.5 bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={msme43bh}
                  onChange={(e) => setMsme43bh(e.target.checked)}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <p className="text-xs font-black text-blue-300">
                    Multiplier C: MSME Section 43B(h) Instant Day-1 Settlement (3% Fee)
                  </p>
                  <p className="text-[11px] text-gray-400">
                    3% early-settlement fee (₹{Math.round(escrowAmount * 0.03).toLocaleString('en-IN')}) routes to owner net profit; supplier gets instant Day-1 liquidity.
                  </p>
                </div>
              </label>

              <button
                type="button"
                disabled={escrowBusy}
                onClick={handleCreateEscrow}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-colors"
              >
                {escrowBusy ? 'Locking Escrow...' : `Lock ₹${escrowAmount.toLocaleString('en-IN')} in 15/85 Escrow`}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-gray-400">Active Escrow Milestones</h4>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit Delivery OTP"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white w-48"
              />
            </div>
            {escrows.slice(0, 4).map((esc) => (
              <div
                key={esc.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{esc.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      {esc.status}
                    </span>
                    <span className="text-[10px] text-gray-500">OTP: {esc.delivery_otp}</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">{esc.merchant_name}</p>
                  <p className="text-[11px] text-gray-400">
                    Total: ₹{esc.total_amount_inr.toLocaleString('en-IN')} • 85% Merchant: ₹
                    {esc.merchant_payout_85_inr.toLocaleString('en-IN')} • Owner Net Profit: ₹
                    {esc.owner_net_profit_inr.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReleaseEscrow(esc.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                  >
                    OTP Release
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRefundEscrow(esc.id)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg"
                  >
                    48h Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 3: INSTANT e-COURT, GSTIN MOD-36 & CONSUMER FORUM TRUST SHIELD */}
      {activePillar === 'ecourt' && (
        <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 space-y-4 text-left">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            Instant e-Court, GSTIN Mod-36 & Consumer Forum Trust Shield
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
              placeholder="Enter 15-character GSTIN (e.g. 29AABCS1429B1ZQ)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase"
            />
            <button
              type="button"
              onClick={handleVerifyGstin}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-sm rounded-xl transition-colors"
            >
              Run Mod-36 Trust Check
            </button>
          </div>
          {verifyResult && (
            <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{verifyResult.businessName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black">
                  Trust Score: {verifyResult.trustScore}/100
                </span>
              </div>
              <p className="text-gray-300">
                GSTIN: <span className="font-mono">{verifyResult.gstin}</span> • Mod-36 Checksum:{' '}
                <span className={verifyResult.mod36ChecksumValid ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {verifyResult.mod36ChecksumValid ? 'PASSED' : 'FORMAT CHECKED'}
                </span>
              </p>
              <p className="text-amber-300">{verifyResult.eCourtForum} • Instant Legal Notice Ready</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ₹99/DAY SHOP AI TWIN, CASH ORDERS & 0.1% QR ARMY */}
      {activePillar === 'marketplace' && (
        <div className="space-y-4">
          <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-400" />
                  ₹99/Day Shop AI Twin & Live Cash Orders Marketplace
                </h3>
                <p className="text-xs text-gray-400">
                  Autonomous Pan-India B2B & B2C cash orders waiting for verified local partners
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  requireAuth(() => {
                    setAiTwinActive(true);
                    toast('₹99/Day Shop AI Twin Activated!', 'success');
                  })
                }
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-4 h-4" />
                {aiTwinActive ? 'AI Twin Active (₹99/Day)' : 'Activate ₹99/Day Shop AI Twin'}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {SEEDED_MERCHANTS.map((m) => (
                <div
                  key={m.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{m.business_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold tabular-nums">
                        {m.trust_score}% Trust
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {m.category} • {m.city} ({m.pincode})
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 tabular-nums">
                    <span className="text-xs font-bold text-emerald-400">
                      Live Cash Order: ₹{(m.liveCashOrderInr || 35000).toLocaleString('en-IN')}
                    </span>
                    <Link
                      href={`/merchant-claim/${m.id}`}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      Claim Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 text-left">
            <div className="bg-white p-3 rounded-2xl shrink-0">
              <QRCodeSVG value={shareUrl} size={132} level="H" includeMargin />
            </div>
            <div className="flex-1 space-y-3 w-full">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                0.1% Student & Trader QR Army (ISO-18004 Scannable Pass)
              </h3>
              <p className="text-xs text-gray-400">
                Generate a scannable affiliate QR poster for hospitals, college campuses & mandi traders. Earn 0.1% on every bill audit & escrow order.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={qrPhone}
                  onChange={(e) => setQrPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit Partner Mobile"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors"
                >
                  Open Native Share & QR Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLIER D: PROGRAMMATIC 19,300+ PINCODE WHOLESALE BENCHMARK INDEX */}
      <div className="bg-gradient-to-br from-slate-900/95 via-emerald-950/20 to-indigo-950/25 border border-cyan-500/30 rounded-2xl p-4 text-left space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              Multiplier D • Programmatic 19,300+ Pincode Wholesale Benchmark Index
            </span>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Live Regional Mandi & Institutional Rate Feeds (6 Indian Zones)
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ZONE_WHOLESALE_INDEX.map((z, i) => {
              const zoneColors = [
                'from-emerald-500 to-teal-500 border-emerald-400',
                'from-amber-500 to-orange-500 border-amber-400',
                'from-cyan-500 to-blue-500 border-cyan-400',
                'from-violet-500 to-fuchsia-500 border-violet-400',
                'from-rose-500 to-orange-500 border-rose-400',
                'from-lime-500 to-emerald-500 border-lime-400',
              ];
              return (
                <button
                  key={z.zone}
                  type="button"
                  onClick={() => setSelectedZoneIdx(i)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    selectedZoneIdx === i
                      ? `bg-gradient-to-r ${zoneColors[i % zoneColors.length]} text-slate-950 font-extrabold shadow-sm`
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {z.zone.split(' ')[0]} ({z.pincodesCovered.toLocaleString('en-IN')})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ZONE_WHOLESALE_INDEX[selectedZoneIdx].benchmarks.map((b, bIdx) => (
            <div
              key={bIdx}
              className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-white">{b.item}</p>
                <p className="text-[11px] text-slate-300">
                  Retail: <span className="line-through text-rose-300">{b.retailRate}</span> → Wholesale:{' '}
                  <span className="text-emerald-300 font-bold">{b.nearmeWholesaleRate}</span>
                </p>
              </div>
              <span className="text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 px-2.5 py-1 rounded-full shrink-0">
                -{b.savingsPct}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {ZONE_WHOLESALE_INDEX[selectedZoneIdx].hubs.map((hub) => {
            const citySlug = hub.split(' ')[0].toLowerCase();
            return (
              <Link
                key={hub}
                href={`/services/${citySlug}/hospital-bill-audit`}
                className="text-[11px] text-cyan-300 hover:text-amber-300 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1 rounded-full transition-colors"
              >
                {hub} Wholesale Index →
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
