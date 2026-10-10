import React, { useState, useEffect } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { StockHold } from '../types';
import { Clock, Lock, ShieldCheck, AlertCircle, ArrowRight, X, Copy, Check } from 'lucide-react';

interface AtomicHoldModalProps {
  hold: StockHold;
  onProceedToCheckout: (hold: StockHold) => void;
  onClose: () => void;
}

export const AtomicHoldModal: React.FC<AtomicHoldModalProps> = ({
  hold,
  onProceedToCheckout,
  onClose
}) => {
  const { parts, releaseHoldManual, showToast } = usePartShare();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(Math.max(0, hold.expiresAt - Date.now()));
  const [copied, setCopied] = useState<boolean>(false);

  const part = parts.find((p) => p.id === hold.partId);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, hold.expiresAt - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hold.expiresAt]);

  const totalHoldMs = 30 * 60 * 1000;
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / totalHoldMs) * 100));

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);

  const handleCopyQuote = () => {
    const quoteText = `Penawaran Suku Cadang:
OEM: ${hold.oemNumber}
Part: ${hold.partTitle}
Harga Estimasi Konsumen: Rp ${(part?.suggestedRetailPrice || hold.b2bPrice * 1.3).toLocaleString('id-ID')}
Garansi: Segel Baru / Garansi Pemasangan Bengkel
Status: Stok Ready di Gudang B2B (Terkunci)`;
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    showToast('Rincian penawaran disalin ke clipboard untuk pelanggan!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Sistem Kunci Stok Instan (Atomic Hold)
            </div>
            <h2 className="text-lg font-bold text-white">
              Stok OEM {hold.oemNumber} Berhasil Dikunci
            </h2>
          </div>
        </div>

        {/* Big Live Countdown Clock */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="text-xs text-slate-400 uppercase tracking-widest">
            Sisa Waktu Kunci Eksklusif Kasir
          </div>
          <div className="font-mono text-5xl font-black text-amber-400 tabular-nums tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            Selama timer berjalan, tidak ada bengkel lain di jaringan PartShare yang dapat membeli atau mem-booking suku cadang ini.
          </p>
        </div>

        {/* Part Details Summary */}
        <div className="space-y-2 text-xs bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Suku Cadang:</span>
            <span className="font-medium text-white text-right max-w-xs truncate">
              {hold.partTitle}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Nomor OEM:</span>
            <span className="font-mono font-bold text-amber-400">{hold.oemNumber}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Harga Modal B2B:</span>
            <span className="font-mono font-bold text-white">
              Rp {hold.b2bPrice.toLocaleString('id-ID')}
            </span>
          </div>
          {part && (
            <div className="flex justify-between py-1 text-slate-300">
              <span className="text-slate-400">Saran Jual Konsumen:</span>
              <span className="font-mono font-bold text-emerald-400">
                Rp {part.suggestedRetailPrice.toLocaleString('id-ID')} (Margin +Rp{' '}
                {(part.suggestedRetailPrice - hold.b2bPrice).toLocaleString('id-ID')})
              </span>
            </div>
          )}
        </div>

        {/* Security anti-bypass hint */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Identitas toko penjual dirahasiakan sepenuhnya. Jika Anda melanjutkan pembayaran, transaksi dilindungi oleh Rekening Escrow Terpusat PartShare.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopyQuote}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin Penawaran Pelanggan'}</span>
          </button>

          <button
            onClick={() => {
              releaseHoldManual(hold.id);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
          >
            Lepas Kunci (Batal)
          </button>

          <button
            onClick={() => {
              onProceedToCheckout(hold);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <span>Bayar via Escrow</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
