import React, { useState } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { PartItem, StockHold } from '../types';
import {
  ShieldCheck,
  Truck,
  Lock,
  Wallet,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  Plus
} from 'lucide-react';

interface EscrowCheckoutModalProps {
  item: { type: 'hold'; hold: StockHold } | { type: 'part'; part: PartItem };
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const COURIER_OPTIONS = [
  {
    id: 'lalamove-instant',
    name: 'Lalamove Motorized B2B (Instant 1-2 Jam)',
    fee: 35000,
    eta: '60 - 90 Menit',
    desc: 'Kurir khusus suku cadang dengan tas boks aman & blind tracking'
  },
  {
    id: 'gosend-sameday',
    name: 'GoSend B2B Sameday Dedicated',
    fee: 25000,
    eta: '2 - 4 Jam',
    desc: 'Pengiriman di hari yang sama khusus zona Jabodetabek'
  },
  {
    id: 'cargo-b2b',
    name: 'SiCepat Cargo B2B Heavy Part',
    fee: 45000,
    eta: '1 Hari (Besok Pagi)',
    desc: 'Direkomendasikan untuk part berat (cakram rem, per keong, shockbreaker)'
  }
];

export const EscrowCheckoutModal: React.FC<EscrowCheckoutModalProps> = ({
  item,
  onClose,
  onSuccess
}) => {
  const {
    activeStore,
    checkoutHoldToEscrow,
    directBuyToEscrow,
    topUpActiveWallet,
    showToast
  } = usePartShare();

  const [selectedCourierId, setSelectedCourierId] = useState<string>('lalamove-instant');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCourier =
    COURIER_OPTIONS.find((c) => c.id === selectedCourierId) || COURIER_OPTIONS[0];

  const partTitle = item.type === 'hold' ? item.hold.partTitle : item.part.title;
  const oemNumber = item.type === 'hold' ? item.hold.oemNumber : item.part.oemNumber;
  const b2bUnitPrice = item.type === 'hold' ? item.hold.b2bPrice : item.part.b2bPrice;
  const qty = item.type === 'hold' ? item.hold.qty : 1;

  const itemTotal = b2bUnitPrice * qty;
  const shippingFee = selectedCourier.fee;
  const platformFee = Math.round(itemTotal * 0.03); // 3% escrow protection fee
  const totalAmount = itemTotal + shippingFee + platformFee;

  const hasEnoughBalance = activeStore.walletBalance >= totalAmount;
  const deficit = totalAmount - activeStore.walletBalance;

  const handleCheckout = () => {
    setIsSubmitting(true);
    let result;

    if (item.type === 'hold') {
      result = checkoutHoldToEscrow(item.hold.id, selectedCourier.name, shippingFee);
    } else {
      result = directBuyToEscrow(item.part.id, selectedCourier.name, shippingFee);
    }

    setIsSubmitting(false);

    if (result.success && result.order) {
      onSuccess(result.order.id);
      onClose();
    } else {
      showToast(result.message || 'Gagal memproses pembayaran escrow', 'error');
    }
  };

  const handleQuickTopUp = () => {
    const topUpAmt = Math.max(1000000, Math.ceil(deficit / 500000) * 500000);
    topUpActiveWallet(topUpAmt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Platform Centralized Escrow Vault</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Konfirmasi Kunci Dana Escrow B2B
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dana akan ditahan di rekening penampung resmi PartShare sampai suku cadang fisik diterima & diverifikasi oleh kasir/teknisi bengkel Anda.
          </p>
        </div>

        {/* Part Item Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              OEM: {oemNumber}
            </span>
            <span className="text-slate-400 font-mono">Jumlah: {qty} Pcs</span>
          </div>
          <h3 className="text-sm font-semibold text-white">{partTitle}</h3>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Harga Modal B2B Likuidasi:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              Rp {itemTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Courier Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Pilih Layanan Kurir Blind Logistik B2B</span>
          </label>
          <div className="space-y-2">
            {COURIER_OPTIONS.map((courier) => (
              <label
                key={courier.id}
                className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedCourierId === courier.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="courier"
                    checked={selectedCourierId === courier.id}
                    onChange={() => setSelectedCourierId(courier.id)}
                    className="mt-1 text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold">{courier.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{courier.desc}</div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1">
                      Estimasi: {courier.eta}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-amber-300 whitespace-nowrap ml-3">
                  Rp {courier.fee.toLocaleString('id-ID')}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Breakdown & Escrow Ledger Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal Modal Suku Cadang ({qty} Pcs)</span>
            <span className="font-mono tabular-nums">Rp {itemTotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Ongkir Blind Courier ({selectedCourier.name.split(' ')[0]})</span>
            <span className="font-mono tabular-nums">Rp {shippingFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <span>Proteksi Rekening Escrow Terpusat (3%)</span>
            </span>
            <span className="font-mono tabular-nums">Rp {platformFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
            <span>Total Dana Dikunci di Escrow</span>
            <span className="font-mono text-amber-400 tabular-nums">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Wallet Balance Verification */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Saldo Dompet B2B Toko Anda:</span>
            </div>
            <div className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
              Rp {activeStore.walletBalance.toLocaleString('id-ID')}
            </div>
          </div>

          {!hasEnoughBalance && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  Saldo kurang Rp {deficit.toLocaleString('id-ID')}. Top up instan untuk melanjutkan.
                </span>
              </div>
              <button
                onClick={handleQuickTopUp}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-slate-950 font-bold whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top Up Cepat</span>
              </button>
            </div>
          )}
        </div>

        {/* 3-Point Escrow Protection Guarantee */}
        <div className="space-y-1.5 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Jaminan Anti-Curang Escrow PartShare:</span>
          </div>
          <p className="pl-6">
            1. Dana Anda 100% aman di Escrow Vault platform PartShare (bukan di rekening pribadi penjual).
          </p>
          <p className="pl-6">
            2. Penjual mencetak blind label tanpa mengetahui kontak/nama kasir Anda untuk mencegah transaksi luar sistem.
          </p>
          <p className="pl-6">
            3. Jika ada ketidaksesuaian nomor OEM, Anda berhak klaim retur otomatis dengan penalti denda ke toko penjual.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleCheckout}
            disabled={!hasEnoughBalance || isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Kunci Dana ke Escrow Sekarang (Rp {totalAmount.toLocaleString('id-ID')})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
