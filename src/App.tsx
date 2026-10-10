import React, { useState } from 'react';
import { PartShareProvider, usePartShare } from './context/PartShareContext';
import { Header } from './components/Header';
import { HoldNotificationBar } from './components/HoldNotificationBar';
import { BlindMarketplace } from './components/BlindMarketplace';
import { OrdersAndFulfillment } from './components/OrdersAndFulfillment';
import { EscrowWalletView } from './components/EscrowWalletView';
import { ReputationPenaltyPanel } from './components/ReputationPenaltyPanel';
import { AtomicHoldModal } from './components/AtomicHoldModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { BlindShippingLabelModal } from './components/BlindShippingLabelModal';
import { ListDeadStockModal } from './components/ListDeadStockModal';
import { PartItem, StockHold, Order } from './types';
import { AlertCircle, CheckCircle, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    selectedHoldForModal,
    setSelectedHoldForModal,
    selectedOrderForLabel,
    setSelectedOrderForLabel,
    toast
  } = usePartShare();

  const [currentTab, setCurrentTab] = useState<'marketplace' | 'orders' | 'wallet' | 'reputation'>('marketplace');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<
    { type: 'hold'; hold: StockHold } | { type: 'part'; part: PartItem } | null
  >(null);

  const handleDirectCheckout = (part: PartItem) => {
    setCheckoutItem({ type: 'part', part });
  };

  const handleProceedFromHold = (hold: StockHold) => {
    setSelectedHoldForModal(null);
    setCheckoutItem({ type: 'hold', hold });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenListModal={() => setIsListModalOpen(true)}
      />

      {/* Floating Atomic Hold Notification Bar (Live 30-Min Countdown) */}
      <HoldNotificationBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'marketplace' && (
          <BlindMarketplace onDirectCheckout={handleDirectCheckout} />
        )}

        {currentTab === 'orders' && (
          <OrdersAndFulfillment
            onOpenLabelModal={(order: Order) => setSelectedOrderForLabel(order)}
          />
        )}

        {currentTab === 'wallet' && <EscrowWalletView />}

        {currentTab === 'reputation' && <ReputationPenaltyPanel />}
      </main>

      {/* Modals */}
      {/* 1. Atomic Hold 30-Minute Manager Modal */}
      {selectedHoldForModal && (
        <AtomicHoldModal
          hold={selectedHoldForModal}
          onProceedToCheckout={handleProceedFromHold}
          onClose={() => setSelectedHoldForModal(null)}
        />
      )}

      {/* 2. Escrow Checkout Modal */}
      {checkoutItem && (
        <EscrowCheckoutModal
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onSuccess={(orderId) => {
            setCurrentTab('orders');
          }}
        />
      )}

      {/* 3. Printable Blind Shipping Label Modal */}
      {selectedOrderForLabel && (
        <BlindShippingLabelModal
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
        />
      )}

      {/* 4. List Dead-Stock Modal */}
      {isListModalOpen && (
        <ListDeadStockModal onClose={() => setIsListModalOpen(false)} />
      )}

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-300 max-w-md">
          <div
            className={`p-4 rounded-xl shadow-2xl border text-xs flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-red-500/50 text-red-200'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/95 border-blue-500/50 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="font-semibold text-white">
                {toast.type === 'success'
                  ? 'Konfirmasi Berhasil'
                  : toast.type === 'error'
                  ? 'Pemberitahuan Sistem / Penalti'
                  : toast.type === 'warning'
                  ? 'Perhatian'
                  : 'Informasi'}
              </div>
              <div className="mt-0.5 text-slate-300 leading-snug">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PartShare B2B</span>
            <span>·</span>
            <span>Jaringan Likuidasi Dead-Stock Suku Cadang & Variasi Mobil</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Blind Marketplace Anti-Bypass</span>
            <span>·</span>
            <span>Atomic Stock Lock 30m</span>
            <span>·</span>
            <span>Centralized Escrow Vault</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PartShareProvider>
      <AppContent />
    </PartShareProvider>
  );
}
