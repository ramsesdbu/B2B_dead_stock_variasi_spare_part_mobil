import React from 'react';
import { usePartShare } from '../context/PartShareContext';
import { ShieldCheck, Lock, Wallet, Award, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: 'marketplace' | 'orders' | 'wallet' | 'reputation';
  setCurrentTab: (tab: 'marketplace' | 'orders' | 'wallet' | 'reputation') => void;
  onOpenListModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenListModal
}) => {
  const { activeStore, stores, setActiveStoreId, activeHolds, orders } = usePartShare();

  const myActiveHoldsCount = activeHolds.filter((h) => h.buyerStoreId === activeStore.id).length;
  const pendingInspectionCount = orders.filter(
    (o) => o.buyerStoreId === activeStore.id && o.status === 'delivered_pending_inspection'
  ).length;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1, 2, 3 contract: Brand — 4-5 Nav links — 1 primary action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#marketplace"
            onClick={(e) => {
              e.preventDefault();
              setCurrentTab('marketplace');
            }}
            className="flex items-center gap-2.5 text-slate-100 font-bold tracking-tight text-xl whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-inner">
              P
            </div>
            <span>PartShare</span>
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              B2B Blind
            </span>
          </a>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('marketplace')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              currentTab === 'marketplace'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Katalog Blind
          </button>

          <button
            onClick={() => setCurrentTab('orders')}
            className={`whitespace-nowrap pb-0.5 transition-colors relative ${
              currentTab === 'orders'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span>Pesanan Escrow</span>
            {pendingInspectionCount > 0 && (
              <span className="ml-1.5 text-xs font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                {pendingInspectionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('wallet')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              currentTab === 'wallet'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Dompet Terpusat
          </button>

          <button
            onClick={() => setCurrentTab('reputation')}
            className={`whitespace-nowrap pb-0.5 transition-colors ${
              currentTab === 'reputation'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Skor Reputasi
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenListModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Likuidasi Dead-Stock</span>
          </button>
        </div>
      </div>

      {/* Workshop Role & Store Context Toolbar */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Toko Aktif:</span>
            <select
              value={activeStore.id}
              onChange={(e) => setActiveStoreId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-amber-400"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.zone})
                </option>
              ))}
            </select>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Peran: <strong className="text-slate-200">{activeStore.activeRole === 'buyer' ? 'Bengkel Kasir (Buyer)' : 'Gudang Penjual (Seller)'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono tabular-nums">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saldo Dompet:</span>
              <span className="text-emerald-400 font-bold">
                Rp {activeStore.walletBalance.toLocaleString('id-ID')}
              </span>
            </div>
            {activeStore.escrowLockedBalance > 0 && (
              <div className="flex items-center gap-1.5 text-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Tertahan Escrow:</span>
                <span className="font-bold">
                  Rp {activeStore.escrowLockedBalance.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reputasi:</span>
              <span
                className={`font-bold ${
                  activeStore.reputationScore >= 90
                    ? 'text-cyan-400'
                    : activeStore.reputationScore >= 75
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {activeStore.reputationScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
