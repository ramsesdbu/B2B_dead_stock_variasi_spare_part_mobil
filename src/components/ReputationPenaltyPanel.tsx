import React, { useState } from 'react';
import { usePartShare } from '../context/PartShareContext';
import {
  Award,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export const ReputationPenaltyPanel: React.FC = () => {
  const {
    activeStore,
    triggerSellerStockNegligencePenalty,
    parts
  } = usePartShare();

  const [simReason, setSimReason] = useState<string>(
    'Stok fisik ternyata sudah laku offline dan kasir lalai update sinkronisasi'
  );
  const [simOem, setSimOem] = useState<string>('04465-0K140');

  const handleSimulatePenalty = () => {
    triggerSellerStockNegligencePenalty(
      `MANUAL-SIM-${Date.now()}`,
      activeStore.id,
      simOem,
      simReason
    );
  };

  const getTierColor = (score: number) => {
    if (score >= 95) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Reputation Score Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Sistem Penalti & Skor Reputasi Otomatis</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Integritas Toko: {activeStore.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Skor reputasi dihitung secara algoritmik dari kecepatan pemrosesan, akurasi stok fisik OEM, dan bebas dari pembatalan sepihak.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${getTierColor(activeStore.reputationScore)}`}>
              <Award className="w-4 h-4" />
              <span>Tier: {activeStore.reputationTier}</span>
            </div>
          </div>
        </div>

        {/* Big Score Visual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono tabular-nums">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center md:text-left">
            <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">
              Skor Reputasi B2B
            </div>
            <div className={`text-4xl font-black ${activeStore.reputationScore >= 90 ? 'text-cyan-400' : activeStore.reputationScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
              {activeStore.reputationScore}
              <span className="text-lg text-slate-500 font-normal"> / 100</span>
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              {activeStore.reputationScore >= 95 ? 'Toko Rekomendasi Utama' : 'Status Aktif Terpercaya'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center md:text-left">
            <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">
              Total Insiden Kelalaian
            </div>
            <div className={`text-4xl font-black ${activeStore.penaltiesCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {activeStore.penaltiesCount}
              <span className="text-lg text-slate-500 font-normal"> Kasus</span>
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Pelanggaran stok fisik tidak sinkron
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center md:text-left">
            <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">
              Fill-Rate Akurasi OEM
            </div>
            <div className="text-4xl font-black text-emerald-400">
              98.4%
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Persentase kecocokan fisik suku cadang
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center md:text-left">
            <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">
              Rata-rata Waktu Dispatch
            </div>
            <div className="text-4xl font-black text-white">
              18 Menit
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Sejak Blind Order masuk ke sistem
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Policy Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Anti-Negligence Policy Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Aturan Penalti Otomatis Kelalaian Stok</span>
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Untuk menjamin integritas Blind Marketplace dan mencegah kasir bengkel pembeli kehilangan pelanggan walk-in, sistem memberlakukan penalti tegas tanpa negosiasi:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-red-400 shrink-0">-15 Poin:</span>
              <span>
                Jika toko membatalkan pesanan konfirmasi karena fisik ternyata sudah terjual offline.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-red-400 shrink-0">Rp 25.000:</span>
              <span>
                Denda pemotongan otomatis dari saldo dompet escrow sebagai kompensasi biaya kurir / waktu kasir pembeli.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-amber-400 shrink-0">Skor &lt; 75:</span>
              <span>
                Akun masuk tier <em>Perhatian Khusus</em>, badge verifikasi dicabut, dan terkena pembatasan kuota listing dead-stock.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-red-500 shrink-0">Skor &lt; 60:</span>
              <span>
                Pembekuan akun otomatis (Suspended) dan audit manual oleh dewan etik PartShare.
              </span>
            </li>
          </ul>
        </div>

        {/* Live Simulator to Trigger Penalty */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Simulasi Uji Sistem Penalti Otomatis</span>
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Gunakan pengujian langsung ini untuk memverifikasi eksekusi penalti: skor berkurang -15 poin dan denda saldo escrow Rp 25.000 dipotong seketika.
          </p>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nomor OEM yang Lalai Diperbarui:</label>
              <select
                value={simOem}
                onChange={(e) => setSimOem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs text-white font-mono"
              >
                {parts.map((p) => (
                  <option key={p.id} value={p.oemNumber}>
                    OEM {p.oemNumber} - {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Alasan Pelanggaran / Kelalaian:</label>
              <input
                type="text"
                value={simReason}
                onChange={(e) => setSimReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs text-white"
              />
            </div>

            <button
              onClick={handleSimulatePenalty}
              className="w-full py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Jalankan Penalti Otomatis (-15 Skor & Denda Rp 25.000)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Penalty Audit History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white">
              Log Riwayat Audit & Penalti Otomatis
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activeStore.penaltyHistory.length} Riwayat Tercatat
          </span>
        </div>

        {activeStore.penaltyHistory.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">
              Rekam Jejak Bersih Tanpa Penalti
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Toko ini belum pernah terkena penalti kelalaian stok. Pertahankan integritas untuk menikmati komisi platform termurah!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeStore.penaltyHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-red-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {rec.id}
                    </span>
                    {rec.oemCode && (
                      <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        OEM: {rec.oemCode}
                      </span>
                    )}
                    <span className="text-slate-500 font-mono text-[11px]">{rec.date}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{rec.reason}</p>
                </div>

                <div className="flex items-center gap-3 font-mono shrink-0">
                  <div className="text-right">
                    <span className="text-red-400 font-bold">{rec.scoreDelta} Poin</span>
                    <div className="text-[10px] text-slate-500">
                      Denda Rp {rec.fineAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
