import React, { useState } from 'react';
import { usePartShare } from '../context/PartShareContext';
import {
  Wallet,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShieldCheck,
  CreditCard,
  Building,
  History,
  AlertCircle
} from 'lucide-react';

export const EscrowWalletView: React.FC = () => {
  const {
    activeStore,
    transactions,
    topUpActiveWallet,
    withdrawActiveWallet,
    showToast
  } = usePartShare();

  const [topUpAmount, setTopUpAmount] = useState<number>(2000000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000000);
  const [bankAccount, setBankAccount] = useState<string>('BCA 8271-9921-00 a/n Bengkel Sentosa Motor');
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);

  // Filter transactions for active store
  const storeTxns = transactions.filter((t) => t.storeId === activeStore.id);

  const handleTopUpConfirm = () => {
    topUpActiveWallet(topUpAmount);
    setShowTopUpModal(false);
  };

  const handleWithdrawConfirm = () => {
    const res = withdrawActiveWallet(withdrawAmount);
    if (res.success) {
      setShowWithdrawModal(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const totalStoreAssets = activeStore.walletBalance + activeStore.escrowLockedBalance;

  return (
    <div className="space-y-6">
      {/* Wallet Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dompet Escrow Terpusat Terverifikasi</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Rekening & Escrow Vault: {activeStore.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zona Wilayah: {activeStore.zone} · Virtual Account Escrow: <strong className="font-mono text-slate-200">VA-8829-{activeStore.id.slice(-4)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Top Up Saldo</span>
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Tarik Saldo</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono tabular-nums">
          {/* Card 1: Available Balance */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans text-slate-400">
              <span>Saldo Siap Pakai (Available)</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              Rp {activeStore.walletBalance.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Dapat dipakai untuk beli spare part atau ditarik ke bank operasional
            </div>
          </div>

          {/* Card 2: Escrow Locked Balance */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans text-slate-400">
              <span>Dana Ditahan di Escrow Vault</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              Rp {activeStore.escrowLockedBalance.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Tertahan dalam pesanan aktif; aman sampai barang diverifikasi
            </div>
          </div>

          {/* Card 3: Total Assets */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans text-slate-400">
              <span>Total Ekuitas Saldo</span>
              <Building className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              Rp {totalStoreAssets.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Akumulasi saldo cair + dana dalam proses kliring B2B
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Buku Kas & Riwayat Mutasi Escrow
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {storeTxns.length} Transaksi Tercatat
          </span>
        </div>

        {storeTxns.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            Belum ada mutasi transaksi pada toko ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 font-semibold">ID Mutasi</th>
                  <th className="py-3 px-3 font-semibold">Waktu</th>
                  <th className="py-3 px-3 font-semibold">Jenis Transaksi</th>
                  <th className="py-3 px-3 font-semibold">Keterangan</th>
                  <th className="py-3 px-3 font-semibold text-right">Nominal (Rp)</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {storeTxns.map((txn) => {
                  const isPositive = txn.amount > 0;
                  const isPenalty = txn.type === 'penalty_fine';

                  return (
                    <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-300">{txn.id}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                        {new Date(txn.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {txn.type === 'deposit' && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Top Up Deposit</span>
                          </span>
                        )}
                        {txn.type === 'escrow_hold' && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kunci Escrow</span>
                          </span>
                        )}
                        {txn.type === 'escrow_release' && (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Pencairan Escrow</span>
                          </span>
                        )}
                        {txn.type === 'penalty_fine' && (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Denda Penalti Stok</span>
                          </span>
                        )}
                        {txn.type === 'withdrawal' && (
                          <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Tarik Saldo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold text-sm ${
                          isPenalty
                            ? 'text-red-400'
                            : isPositive
                            ? 'text-emerald-400'
                            : txn.amount < 0
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {txn.amount > 0 ? `+${txn.amount.toLocaleString('id-ID')}` : txn.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Top Up Saldo Dompet B2B Escrow</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pilih nominal simulasi deposit via BCA / Mandiri Virtual Account Escrow Vault:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[500000, 1000000, 2000000, 5000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    topUpAmount === amt
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleTopUpConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Konfirmasi Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              <span>Tarik Saldo Hasil Likuidasi</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tarik dana dari saldo siap pakai ke rekening bank operasional bengkel:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nominal Penarikan (Rp):</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rekening Tujuan:</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleWithdrawConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Tarik Dana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
