'use client';

import React, { Suspense, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Store,
  Printer,
  Copy,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { validateGstinMod36 } from '@/lib/seeded-marketplace';
import { useToast } from '@/components/Toast';

function ShopQrCardStudio() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  const [businessName, setBusinessName] = useState(
    searchParams.get('name') || 'Sri Balaji Hardware & Services'
  );
  const [city, setCity] = useState(searchParams.get('city') || 'Bengaluru');
  const [category, setCategory] = useState(
    searchParams.get('category') || 'Local Services & Wholesale'
  );
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [tagline, setTagline] = useState('Fair Wholesale Rates • Razorpay 15/85 Escrow Protected');
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string>(
    searchParams.get('shopSlug') || ''
  );

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const validPhone = /^[6-9]\d{9}$/.test(cleanPhone);
  const gstCheck = useMemo(() => {
    const clean = gstin.trim().toUpperCase();
    if (!clean) return null;
    return validateGstinMod36(clean);
  }, [gstin]);

  const qrTargetUrl = useMemo(() => {
    if (publishedSlug) {
      return `https://www.nearme-india.org/shop/${publishedSlug}`;
    }
    if (validPhone) {
      return `https://www.nearme-india.org/shop/m-${cleanPhone}`;
    }
    return `https://www.nearme-india.org/claim`;
  }, [publishedSlug, validPhone, cleanPhone]);

  const buildWhatsAppCardText = () => {
    const lines = [
      `*${businessName.trim() || 'Verified Local Business'}*`,
      `Category: ${category.trim() || 'Local Services'} | City: ${city.trim() || 'India'}`,
      ...(validPhone ? [`Contact: +91 ${cleanPhone}`] : []),
      ...(gstCheck?.checksumValid ? [`GSTIN Verified: ${gstin.trim().toUpperCase()}`] : []),
      tagline.trim(),
      ``,
      `View Verified Profile, Fair Prices & Safe Escrow:`,
      qrTargetUrl,
      ``,
      `Powered by NearMe India — Get your FREE Shop QR Standee & 2 Free Customer Leads:`,
      `https://www.nearme-india.org/card`,
    ];
    return lines.join('\n');
  };

  const handlePublishFreeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !validPhone) {
      toast('Enter your Shop Name and valid 10-digit Indian mobile number to publish', 'error');
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          phone: cleanPhone,
          city: city.trim() || 'Bengaluru',
          category: category.trim() || 'Local Services',
          gstin: gstin.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.merchant_id) {
        const slugName = businessName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 40);
        const slugCity = (city.trim() || 'india')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        setPublishedSlug(`${slugName}-${slugCity}--${data.merchant_id}`);
        localStorage.setItem('nearme_user_phone', data.phone);
        toast('Shop profile published! Your QR code is live & 2 Free Leads unlocked.', 'success');
      } else {
        toast(data.error || 'Could not publish shop card', 'error');
      }
    } catch {
      toast('Network error while publishing shop profile', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadStandeePng = () => {
    const qrCanvas = qrWrapRef.current?.querySelector('canvas');
    if (!qrCanvas) {
      toast('QR preview not ready yet', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    const width = 900;
    const height = 1260;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background card
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Top emerald/cyan accent bar
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(0.5, '#06b6d4');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 24);

    // Header text
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED ON NEARME INDIA', width / 2, 100);

    // Shop name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    const shopLabel = (businessName.trim() || 'NearMe Partner').slice(0, 28);
    ctx.fillText(shopLabel, width / 2, 175);

    // Category + City
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 28px sans-serif';
    ctx.fillText(`${category.trim() || 'Local Services'}  •  ${city.trim() || 'India'}`, width / 2, 228);

    // GST badge if valid
    if (gstCheck?.checksumValid) {
      ctx.fillStyle = '#065f46';
      ctx.fillRect(width / 2 - 220, 255, 440, 48);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`GSTIN VERIFIED: ${gstin.trim().toUpperCase()}`, width / 2, 287);
    }

    // White QR container
    const qrBoxSize = 460;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 340;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.drawImage(qrCanvas, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

    // Scan CTA
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('SCAN FOR FAIR PRICES & SAFE ESCROW', width / 2, 870);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText((tagline.trim() || 'Razorpay 15/85 Escrow • 6-Digit Delivery OTP').slice(0, 56), width / 2, 922);

    if (validPhone) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 34px monospace';
      ctx.fillText(`WhatsApp / Call: +91 ${cleanPhone}`, width / 2, 995);
    }

    // Viral Footer Banner (Pulls Other Shop Owners to NearMe India)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(48, 1065, width - 96, 145);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 1065, width - 96, 145);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('OWN A SHOP OR SERVICE BUSINESS?', width / 2, 1118);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Get Your FREE Shop QR & 2 Free Leads:', width / 2, 1158);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('https://www.nearme-india.org/card', width / 2, 1195);

    const link = document.createElement('a');
    link.download = `${(businessName.trim() || 'nearme-shop').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr-standee.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Downloaded Counter QR Standee PNG!', 'success');
  };

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppCardText());
      toast('Copied WhatsApp Business Card!', 'success');
    } catch {
      toast('Could not copy automatically', 'error');
    }
  };

  const waShareHref = `https://wa.me/?text=${encodeURIComponent(buildWhatsAppCardText())}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            100% Free Tool for Indian Shops &amp; Service Pros
          </p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Free Verified Shop QR Standee &amp; WhatsApp Business Card
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create a printable counter QR standee and shareable WhatsApp business card in 15 seconds. Show customers your GSTIN verification, build instant trust, and unlock 2 free customer leads on NearMe India.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Shop Details Form */}
          <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                Enter Your Shop Details
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ₹0 FREE FOREVER
              </span>
            </div>

            <form onSubmit={handlePublishFreeProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Shop / Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sri Vasavi Diagnostic Lab"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Madanapalle"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    10-Digit WhatsApp Mobile
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Business Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Plumber, Hardware, Diagnostic Lab, Garage"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional 15-Char GSTIN (Adds Instant Verified Seal)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="29AABCS1429B1ZQ"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono uppercase text-white outline-none"
                />
                {gstCheck && (
                  <p
                    className={`text-[11px] mt-1 font-semibold ${
                      gstCheck.checksumValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {gstCheck.checksumValid
                      ? 'Valid 15-Char GSTIN (Mod-36 Verified) — Verified Seal Added!'
                      : 'Check GSTIN format (15 characters)'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tagline / Offer on Standee
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Fair Wholesale Rates • Razorpay Escrow Protected"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-black flex items-center justify-center gap-2 transition-colors"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Publish Live Shop Page &amp; Unlock 2 Free Leads
              </button>
            </form>

            {publishedSlug && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 text-xs space-y-1.5">
                <p className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Your Live Shop Page is Published!
                </p>
                <Link
                  href={`/shop/${publishedSlug}`}
                  className="text-cyan-300 underline break-all font-mono"
                >
                  https://www.nearme-india.org/shop/{publishedSlug}
                </Link>
              </div>
            )}
          </section>

          {/* Right: Live Printable Standee & Shareable WhatsApp Card Preview */}
          <section className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400" />
              <div className="p-6 sm:p-8 text-center space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Verified on NearMe India
                </p>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {businessName.trim() || 'Your Shop Name'}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold">
                    {category.trim() || 'Local Services'} · {city.trim() || 'India'}
                  </p>
                </div>

                {gstCheck?.checksumValid && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    GSTIN VERIFIED: {gstin.trim().toUpperCase()}
                  </div>
                )}

                <div className="flex justify-center py-2">
                  <div
                    ref={qrWrapRef}
                    className="p-4 bg-white rounded-2xl shadow-lg inline-block"
                  >
                    <QRCodeCanvas
                      value={qrTargetUrl}
                      size={196}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-white">
                    Scan for Fair Prices, Reviews &amp; Safe Escrow
                  </p>
                  <p className="text-xs text-slate-400">{tagline}</p>
                  {validPhone && (
                    <p className="text-xs font-mono font-bold text-cyan-300 pt-1">
                      WhatsApp / Call: +91 {cleanPhone}
                    </p>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300">
                  Own a shop? Create your free Verified QR Standee at{' '}
                  <span className="text-emerald-300 font-bold">nearme-india.org/card</span>
                </div>
              </div>
            </div>

            {/* Download / Print / Share Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadStandeePng}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <a
                href={waShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Share WhatsApp
              </a>
              <button
                type="button"
                onClick={handleCopyCard}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy Card
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="hover:text-white flex items-center gap-1.5 font-semibold"
              >
                <Printer className="w-3.5 h-3.5" /> Print Counter Standee
              </button>
              <Link href="/shops" className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Browse All Indexed Shops
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function FreeShopCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Loading Shop QR Generator...
        </div>
      }
    >
      <ShopQrCardStudio />
    </Suspense>
  );
}
