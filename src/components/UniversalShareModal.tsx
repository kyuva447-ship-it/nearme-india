'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';
import { useToast } from './Toast';

interface UniversalShareModalProps {
  title: string;
  subtitle?: string;
  shareUrl: string;
  shareText: string;
  onClose: () => void;
}

export default function UniversalShareModal({
  title,
  subtitle,
  shareUrl,
  shareText,
  onClose,
}: UniversalShareModalProps) {
  const [copied, setCopied] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      toast('Share link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy automatically', 'info');
    }
  };

  const handleDownloadQrSvg = () => {
    const svg = qrWrapperRef.current?.querySelector('svg');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nearme-india-qr-pass.svg';
    a.click();
    URL.revokeObjectURL(url);
    toast('QR Pass SVG downloaded!', 'success');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        toast('Proof card shared natively!', 'success');
        return;
      } catch {
        // User cancelled or browser blocked; fall back to copy
      }
    }
    await handleCopy();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl relative text-center space-y-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Share Modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            ISO-18004 Scannable Pass
          </span>
          <h3 className="text-xl font-black text-white mt-1">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        <div
          ref={qrWrapperRef}
          className="inline-flex p-4 bg-white rounded-2xl shadow-lg mx-auto"
        >
          <QRCodeSVG value={shareUrl} size={184} level="H" includeMargin />
        </div>

        <p className="text-xs text-gray-400 break-all bg-gray-950 border border-gray-800 rounded-xl p-3 font-mono">
          {shareUrl}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={handleDownloadQrSvg}
            className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save QR SVG
          </button>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Proof Card (Native / Web Share)
        </button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share via WhatsApp
        </a>
      </div>
    </div>
  );
}
