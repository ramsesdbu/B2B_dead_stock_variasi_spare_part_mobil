import React, { useState } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { Order, OrderStatus } from '../types';
import {
  Lock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  EyeOff,
  Clock,
  ArrowRight,
  PackageCheck,
  FileText,
  Search
} from 'lucide-react';

interface OrdersAndFulfillmentProps {
  onOpenLabelModal: (order: Order) => void;
}

export const OrdersAndFulfillment: React.FC<OrdersAndFulfillmentProps> = ({
  onOpenLabelModal
}) => {
  const {
    orders,
    activeStore,
    sellerDispatchOrder,
    courierDeliverOrder,
    buyerVerifyAndReleaseEscrow,
    triggerSellerStockNegligencePenalty,
    setSelectedOrderForLabel
  } = usePartShare();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'pending_inspection' | 'in_transit' | 'completed'>('all');
  const [selectedOrderToVerify, setSelectedOrderToVerify] = useState<Order | null>(null);
  const [verificationNote, setVerificationNote] = useState<string>('Nomor OEM fisik cocok, segel utuh, barang bebas karat & cacat.');
  const [inspectionChecks, setInspectionChecks] = useState({
    oemMatch: true,
    conditionPristine: true,
    quantityAccurate: true
  });

  // Filter orders relevant to active store (either as buyer or seller)
  const myOrders = orders.filter(
    (o) => o.buyerStoreId === activeStore.id || o.sellerStoreId === activeStore.id
  );

  const filteredOrders = myOrders.filter((order) => {
    if (activeTabFilter === 'pending_inspection') {
      return order.status === 'delivered_pending_inspection';
    }
    if (activeTabFilter === 'in_transit') {
      return order.status === 'escrow_locked' || order.status === 'dispatched_courier';
    }
    if (activeTabFilter === 'completed') {
      return order.status === 'verified_released' || order.status === 'disputed_penalty';
    }
    return true;
  });

  const handleVerifySubmit = (orderId: string) => {
    buyerVerifyAndReleaseEscrow(orderId, verificationNote);
    setSelectedOrderToVerify(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'escrow_locked':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Dana Dikunci di Escrow (Menunggu Pengiriman)</span>
          </span>
        );
      case 'dispatched_courier':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold text-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>Blind Courier Dalam Perjalanan</span>
          </span>
        );
      case 'delivered_pending_inspection':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold text-xs animate-pulse">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Tiba di Bengkel (Menunggu Verifikasi Fisik)</span>
          </span>
        );
      case 'verified_released':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dana Escrow Sukses Dicairkan ke Penjual</span>
          </span>
        );
      case 'disputed_penalty':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sengketa / Penalti Kelalaian Diberlakukan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Pesanan & Sistem Escrow Terpusat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dana ditahan di sistem Escrow PartShare hingga pembeli menerima dan memverifikasi fisik barang.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({myOrders.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('pending_inspection')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTabFilter === 'pending_inspection'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Perlu Verifikasi ({myOrders.filter((o) => o.status === 'delivered_pending_inspection').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('in_transit')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTabFilter === 'in_transit'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dalam Proses ({myOrders.filter((o) => o.status === 'escrow_locked' || o.status === 'dispatched_courier').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTabFilter === 'completed'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Selesai ({myOrders.filter((o) => o.status === 'verified_released' || o.status === 'disputed_penalty').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Tidak Ada Pesanan pada Kategori Ini</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Semua pesanan B2B dan transaksi escrow Anda akan tercatat secara transparan di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isBuyer = order.buyerStoreId === activeStore.id;
            const isSeller = order.sellerStoreId === activeStore.id;

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md space-y-4 p-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      {order.id}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Tracking Blind: <strong className="text-slate-200">{order.blindTrackingCode}</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">
                      {new Date(order.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Order Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* Column 1: Part & Car Details */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                        OEM: {order.oemNumber}
                      </span>
                      <span className="text-slate-400">
                        Merek: <strong className="text-slate-200">{order.brand}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {order.partTitle}
                    </h3>

                    <p className="text-slate-400">
                      Kompatibilitas: <strong className="text-slate-300">{order.carCompatibility}</strong>
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{order.courierName}</span>
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">
                        Resi Kurir: {order.courierTrackingCode}
                      </span>
                    </div>

                    {order.verificationNotes && (
                      <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px]">
                        <strong>Catatan Verifikasi:</strong> {order.verificationNotes}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Financial Escrow Vault Ledger */}
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 space-y-2 font-mono text-xs">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-sans font-bold flex items-center justify-between">
                      <span>Rincian Escrow Vault</span>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Modal Suku Cadang:</span>
                      <span className="tabular-nums">Rp {order.itemTotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Ongkos Kirim B2B:</span>
                      <span className="tabular-nums">Rp {order.shippingFee.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Biaya Proteksi Escrow (3%):</span>
                      <span className="tabular-nums">Rp {order.platformEscrowFee.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-sm text-white">
                      <span>Total Dana Escrow:</span>
                      <span className="text-amber-400 tabular-nums">
                        Rp {order.totalPaid.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-sans text-right pt-0.5">
                      {order.status === 'verified_released'
                        ? 'Dana telah dicairkan ke penjual'
                        : 'Dana aman di Platform Escrow'}
                    </div>
                  </div>
                </div>

                {/* Interactive Workflow Actions for Current Store */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="p-1 rounded bg-slate-800 text-slate-300">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <span>
                      {isBuyer ? (
                        <>Toko Penjual: <strong className="text-slate-200">Disamarkan ({order.sellerZone})</strong></>
                      ) : (
                        <>Toko Pembeli: <strong className="text-slate-200">Bengkel Terverifikasi ({order.buyerZone})</strong></>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Print Blind Shipping Label Button */}
                    <button
                      onClick={() => onOpenLabelModal(order)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                      title="Buka atau cetak label resi blind shipping anonim"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cetak Label Resi Blind</span>
                    </button>

                    {/* Simulation Action 1: Seller Dispatches Order */}
                    {order.status === 'escrow_locked' && (
                      <button
                        onClick={() => sellerDispatchOrder(order.id, order.courierTrackingCode)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Panggil Kurir & Kirim Paket</span>
                      </button>
                    )}

                    {/* Simulation Action 2: Courier Delivers to Buyer Workshop */}
                    {order.status === 'dispatched_courier' && (
                      <button
                        onClick={() => courierDeliverOrder(order.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Simulasi Kurir Sampai di Bengkel</span>
                      </button>
                    )}

                    {/* Main Action 3: Buyer Verifies Physical Part & Releases Escrow Funds */}
                    {order.status === 'delivered_pending_inspection' && (
                      <button
                        onClick={() => setSelectedOrderToVerify(order)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verifikasi Fisik & Buka Kunci Dana</span>
                      </button>
                    )}

                    {/* Action 4: Negligence Penalty Trigger (Dispute) */}
                    {(order.status === 'escrow_locked' || order.status === 'delivered_pending_inspection') && (
                      <button
                        onClick={() =>
                          triggerSellerStockNegligencePenalty(
                            order.id,
                            order.sellerStoreId,
                            order.oemNumber,
                            'Kelalaian toko penjual: Penjual membatalkan sepihak / barang tidak sesuai OEM fisik'
                          )
                        }
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Ajukan penalti kelalaian stok (-15 skor reputasi + Rp 25.000 denda)"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification & Fund Release Modal */}
      {selectedOrderToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Verifikasi Fisik Suku Cadang
                </h3>
                <p className="text-xs text-slate-400">
                  Pesanan #{selectedOrderToVerify.id} · OEM: {selectedOrderToVerify.oemNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sebelum melepaskan dana escrow sebesar{' '}
              <strong className="text-emerald-400 font-mono">
                Rp {selectedOrderToVerify.itemTotal.toLocaleString('id-ID')}
              </strong>{' '}
              ke toko penjual, pastikan teknisi Anda telah mengecek fisik suku cadang di meja bengkel:
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={inspectionChecks.oemMatch}
                  onChange={(e) =>
                    setInspectionChecks((p) => ({ ...p, oemMatch: e.target.checked }))
                  }
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>
                  Nomor cetak OEM fisik sesuai: <strong className="font-mono text-amber-400">{selectedOrderToVerify.oemNumber}</strong>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={inspectionChecks.conditionPristine}
                  onChange={(e) =>
                    setInspectionChecks((p) => ({ ...p, conditionPristine: e.target.checked }))
                  }
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Kondisi barang mulus, bebas cacat retak/karat permukaan</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={inspectionChecks.quantityAccurate}
                  onChange={(e) =>
                    setInspectionChecks((p) => ({ ...p, quantityAccurate: e.target.checked }))
                  }
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Jumlah fisik sesuai pesanan ({selectedOrderToVerify.qty} Pcs)</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Pemeriksaan Kasir:
              </label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedOrderToVerify(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerifySubmit(selectedOrderToVerify.id)}
                disabled={!inspectionChecks.oemMatch || !inspectionChecks.conditionPristine || !inspectionChecks.quantityAccurate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Lolos & Cairkan Dana ke Penjual</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
