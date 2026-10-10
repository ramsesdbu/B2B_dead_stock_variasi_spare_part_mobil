import React, { useRef } from 'react';
import { Order } from '../types';
import { usePartShare } from '../context/PartShareContext';
import { Printer, X, ShieldAlert, QrCode, ArrowDown, CheckCircle2, Box } from 'lucide-react';

interface BlindShippingLabelModalProps {
  order: Order;
  onClose: () => void;
}

export const BlindShippingLabelModal: React.FC<BlindShippingLabelModalProps> = ({
  order,
  onClose
}) => {
  const { stores, sellerDispatchOrder } = usePartShare();
  const labelRef = useRef<HTMLDivElement>(null);

  const buyerStore = stores.find((s) => s.id === order.buyerStoreId);
  const sellerStore = stores.find((s) => s.id === order.sellerStoreId);

  const handlePrint = () => {
    window.print();
    if (order.status === 'escrow_locked') {
      sellerDispatchOrder(order.id, order.courierTrackingCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[95vh] overflow-y-auto">
        {/* Top Controls (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <span>Generator Label Resi Blind Shipping (Thermal / A5)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identitas penjual disamarkan untuk kurir & penerima guna mencegah transaksi di luar sistem (anti-bypass).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label Resi</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Physical Shipping Docket Container */}
        <div
          ref={labelRef}
          className="print-label-container bg-white text-slate-950 p-6 rounded-xl border-2 border-dashed border-slate-300 font-sans shadow-inner space-y-5"
        >
          {/* Header of Label */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black text-white font-extrabold text-sm px-2 py-0.5 tracking-wider">
                  PARTSHARE
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  BLIND B2B LOGISTICS
                </span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1 uppercase font-mono">
                ESCROW VERIFIED · DIRECT SECURE TRANSIT
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase text-slate-800">
                LAYANAN: {order.courierName.split(' ')[0]}
              </div>
              <div className="font-mono text-sm font-extrabold text-slate-900">
                RESI: {order.courierTrackingCode}
              </div>
            </div>
          </div>

          {/* Barcode Simulation Graphic */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded text-center space-y-1">
            <div className="font-mono text-xs font-extrabold tracking-widest text-slate-900">
              *{order.blindTrackingCode}*
            </div>
            {/* SVG Barcode generator */}
            <div className="flex justify-center items-center h-12 gap-[3px] py-1 overflow-hidden">
              {[4, 2, 6, 3, 2, 8, 4, 2, 5, 3, 6, 2, 4, 7, 2, 5, 3, 4, 6, 2, 8, 3, 5, 2, 6, 4, 3, 2, 7, 3, 5, 2, 6, 4].map((w, idx) => (
                <div
                  key={idx}
                  className={`bg-black h-full ${idx % 2 === 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              PARTSHARE ESCROW SEAL ID: #ESC-VAULT-{order.id}
            </div>
          </div>

          {/* Sender & Receiver Routing Table */}
          <div className="grid grid-cols-2 gap-4 border-2 border-black p-3 text-xs">
            {/* Masked Sender (Disguised completely) */}
            <div className="border-r border-slate-300 pr-3 space-y-1">
              <div className="font-mono text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span>[PENGIRIM - TERENKRIPSI]</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                PartShare Gateway Hub Sektor 04
              </div>
              <div className="text-slate-700 text-[11px] leading-tight">
                Node Penjual: <strong>ID #{order.sellerStoreId.replace('store-', '').toUpperCase()}</strong>
              </div>
              <div className="text-slate-600 text-[11px]">
                Zona Asal: {order.sellerZone}
              </div>
              <div className="text-[10px] bg-slate-100 p-1 rounded font-mono text-slate-700 mt-1">
                Kontak Penjual: Disamarkan oleh Sistem Escrow (Anti-Bypass Protocol)
              </div>
            </div>

            {/* Buyer Workshop (Clear for courier drop-off) */}
            <div className="pl-1 space-y-1">
              <div className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                [TUJUAN PENERIMA - MEJA KASIR BENGKEL]
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {buyerStore?.name || 'Bengkel Pembeli PartShare'}
              </div>
              <div className="text-slate-800 text-[11px] leading-tight">
                {buyerStore?.address || 'Area Bengkel Kasir'}
              </div>
              <div className="text-slate-700 text-[11px] font-mono">
                PIC Kasir / Kontak: {buyerStore?.phone || 'Kasir Standby'}
              </div>
              <div className="text-[10px] bg-amber-50 text-amber-900 p-1 rounded font-semibold mt-1">
                Instruksi Kurir: Serahkan langsung ke Kasir Meja Depan Bengkel
              </div>
            </div>
          </div>

          {/* Package & Inspection Guide */}
          <div className="border border-slate-400 p-3 rounded space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-slate-700" />
                <span>Manifest Fisik: Suku Cadang Otomotif Presisi</span>
              </span>
              <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                OEM: {order.oemNumber}
              </span>
            </div>
            <div className="text-slate-700 text-[11px]">
              Deskripsi Barang: <strong>{order.partTitle}</strong> ({order.carCompatibility})
            </div>
            <div className="text-[10px] text-slate-600">
              Berat Estimasi: ~1.8 Kg · Penanganan: Fragile / Komponen Presisi
            </div>
          </div>

          {/* Anti-Cheating & Escrow Warning Box */}
          <div className="border-2 border-red-600 bg-red-50 p-2.5 rounded text-[11px] text-red-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 uppercase text-[10px] text-red-800">
              <ShieldAlert className="w-4 h-4" />
              <span>PERINGATAN INTEGRITAS BLIND MARKETPLACE ANTI-CURANG</span>
            </div>
            <p className="text-[10px] leading-tight text-red-950">
              1. DILARANG KERAS menyelipkan kartu nama, nota manual toko, nomor HP/WA toko penjual ke dalam kemasan barang.
              <br />
              2. Pelanggaran upaya transaksi di luar sistem (bypass) akan memicu <strong>pembekuan akun permanen</strong> dan <strong>denda penalti saldo escrow Rp 500.000</strong>.
              <br />
              3. Pembeli wajib memeriksa nomor OEM sebelum mengonfirmasi pelepasan dana escrow.
            </p>
          </div>

          {/* Footer signature line */}
          <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <div>DICETAK OTOMATIS OLEH ENGINE PARTSHARE B2B v1.4</div>
            <div>VERIFIED ESCROW PROTECTION GUARANTEED</div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="no-print flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resi Pengiriman Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
