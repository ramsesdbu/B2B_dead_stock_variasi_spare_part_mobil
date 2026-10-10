import React, { useState, useEffect } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { StockHold } from '../types';
import { Clock, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface HoldCountdownItemProps {
  hold: StockHold;
  onOpenHoldModal: (hold: StockHold) => void;
  onRelease: (holdId: string) => void;
}

const HoldCountdownItem: React.FC<HoldCountdownItemProps> = ({
  hold,
  onOpenHoldModal,
  onRelease
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(Math.max(0, hold.expiresAt - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, hold.expiresAt - Date.now());
      setTimeLeftMs(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [hold.expiresAt]);

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const isUrgent = minutes < 5;

  return (
    <div className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md ${isUrgent ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-300">{hold.oemNumber}</span>
            <span className="text-slate-400 truncate max-w-xs">{hold.partTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Atomic Lock B2B · Anti Double-Booking Aktif
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sisa Waktu</div>
          <div className={`font-mono font-bold text-sm tabular-nums ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <button
          onClick={() => onOpenHoldModal(hold)}
          className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <span>Bayar Escrow</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onRelease(hold.id)}
          title="Lepas kunci stok sekarang"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const HoldNotificationBar: React.FC = () => {
  const { activeHolds, activeStore, setSelectedHoldForModal, releaseHoldManual } = usePartShare();

  const myHolds = activeHolds.filter(
    (h) => h.buyerStoreId === activeStore.id && h.status === 'active'
  );

  if (myHolds.length === 0) return null;

  return (
    <div className="bg-slate-900/95 border-b border-amber-500/40 px-4 sm:px-6 lg:px-8 py-2.5 shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>KUNCI STOK INSTAN (ATOMIC HOLD) 30 MENIT AKTIF</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {myHolds.length} barang sedang dikunci khusus untuk kasir Anda
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {myHolds.map((hold) => (
            <HoldCountdownItem
              key={hold.id}
              hold={hold}
              onOpenHoldModal={(h) => setSelectedHoldForModal(h)}
              onRelease={(id) => releaseHoldManual(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
