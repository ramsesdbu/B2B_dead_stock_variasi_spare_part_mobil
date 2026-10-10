import React, { useState, useMemo } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { PartItem, PartCategory } from '../types';
import {
  Search,
  Lock,
  EyeOff,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

interface BlindMarketplaceProps {
  onDirectCheckout: (part: PartItem) => void;
}

export const BlindMarketplace: React.FC<BlindMarketplaceProps> = ({ onDirectCheckout }) => {
  const { parts, lockStockAtomic, activeStore, triggerSellerStockNegligencePenalty } = usePartShare();

  // Search & Filter State
  const [searchOemOrKeyword, setSearchOemOrKeyword] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRadiusZone, setSelectedRadiusZone] = useState<string>('all');
  const [deadStockOnly, setDeadStockOnly] = useState<boolean>(false);

  // Dynamic Margin Simulation for Cashier (quotes)
  const [customQuotes, setCustomQuotes] = useState<Record<string, number>>({});

  // Distinct Filter Options
  const carMakes = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((p) => set.add(p.carMake));
    return Array.from(set).sort();
  }, [parts]);

  const carModels = useMemo(() => {
    const set = new Set<string>();
    parts
      .filter((p) => selectedMake === 'all' || p.carMake === selectedMake)
      .forEach((p) => set.add(p.carModel));
    return Array.from(set).sort();
  }, [parts, selectedMake]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // Search term matches OEM, title, brand, or notes
      if (searchOemOrKeyword.trim()) {
        const query = searchOemOrKeyword.toLowerCase().trim();
        const matchesOem = part.oemNumber.toLowerCase().includes(query);
        const matchesTitle = part.title.toLowerCase().includes(query);
        const matchesBrand = part.brand.toLowerCase().includes(query);
        const matchesModel = part.carModel.toLowerCase().includes(query);
        if (!matchesOem && !matchesTitle && !matchesBrand && !matchesModel) {
          return false;
        }
      }

      if (selectedMake !== 'all' && part.carMake !== selectedMake) {
        return false;
      }

      if (selectedModel !== 'all' && part.carModel !== selectedModel) {
        return false;
      }

      if (selectedCategory !== 'all' && part.category !== selectedCategory) {
        return false;
      }

      if (selectedRadiusZone !== 'all') {
        if (selectedRadiusZone === 'dekat' && part.distanceKmApprox > 15) return false;
        if (selectedRadiusZone === 'sedang' && (part.distanceKmApprox <= 15 || part.distanceKmApprox > 30)) return false;
        if (selectedRadiusZone === 'jauh' && part.distanceKmApprox <= 30) return false;
      }

      if (deadStockOnly && part.shelfAgeDays < 180) {
        return false;
      }

      return true;
    });
  }, [parts, searchOemOrKeyword, selectedMake, selectedModel, selectedCategory, selectedRadiusZone, deadStockOnly]);

  const handleCustomQuoteChange = (partId: string, val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10) || 0;
    setCustomQuotes((prev) => ({ ...prev, [partId]: num }));
  };

  const handleResetFilters = () => {
    setSearchOemOrKeyword('');
    setSelectedMake('all');
    setSelectedModel('all');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSelectedRadiusZone('all');
    setDeadStockOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner / Value Proposition */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="/src/assets/images/hero_auto_warehouse_1791643305966.jpg"
            alt="PartShare B2B Automotive Logistics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Blind Marketplace Anti-Curang Antar Toko</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cari Dead-Stock Suku Cadang Instan Tanpa Bocor Identitas Penjual
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Kasir dapat mengecek stok silang antar-bengkel, mengunci inventori selama 30 menit (atomic hold) agar tidak di-booking pihak lain, dan meraih margin maksimal dengan keamanan pembayaran rekening escrow terpusat.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Bypass Identitas Terenkripsi</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Kunci Stok Atomik 30 Menit</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Margin Modal vs Saran Jual Transparan</span>
            </span>
          </div>
        </div>
      </div>

      {/* Cashier Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main OEM / Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchOemOrKeyword}
              onChange={(e) => setSearchOemOrKeyword(e.target.value)}
              placeholder="Ketik Nomor OEM (cth: 04465-0K140), Nama Part, atau Model Mobil..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
            {searchOemOrKeyword && (
              <button
                onClick={() => setSearchOemOrKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Quick OEM Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 text-xs text-slate-400">
            <span className="shrink-0 text-slate-500">Contoh OEM:</span>
            {['04465-0K140', '90919-02239', '555-SL-3640', '43512-0D160'].map((sample) => (
              <button
                key={sample}
                onClick={() => setSearchOemOrKeyword(sample)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors shrink-0"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          {/* Car Make Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Merek Mobil</label>
            <select
              value={selectedMake}
              onChange={(e) => {
                setSelectedMake(e.target.value);
                setSelectedModel('all');
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Merek</option>
              {carMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Car Model Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Model / Varian</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Model</option>
              {carModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Kategori Suku Cadang</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Kategori</option>
              <option value="Braking">Braking (Pengereman)</option>
              <option value="Engine & Ignition">Engine & Pengapian</option>
              <option value="Suspension & Steering">Kaki-kaki & Suspensi</option>
              <option value="Electrical & Lighting">Elektrikal & Lampu</option>
              <option value="Body & Accessories">Variasi & Bodi</option>
            </select>
          </div>

          {/* Radius Zone Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Radius Zona Pengiriman</label>
            <select
              value={selectedRadiusZone}
              onChange={(e) => setSelectedRadiusZone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Radius</option>
              <option value="dekat">Radius Dekat (&lt; 15 km / Instant)</option>
              <option value="sedang">Radius Sedang (15-30 km / SameDay)</option>
              <option value="jauh">Luar Kota (&gt; 30 km / Cargo)</option>
            </select>
          </div>

          {/* Dead-Stock Checkbox & Reset */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2 h-8">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={deadStockOnly}
                  onChange={(e) => setDeadStockOnly(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="whitespace-nowrap">Dead-stock (&gt;180 hr)</span>
              </label>

              {(searchOemOrKeyword || selectedMake !== 'all' || selectedCategory !== 'all' || selectedRadiusZone !== 'all' || deadStockOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="ml-auto text-slate-400 hover:text-white p-1 rounded"
                  title="Reset Filter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Ditemukan <strong className="text-white font-mono tabular-nums">{filteredParts.length}</strong> suku cadang aktif dalam pool likuidasi B2B
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>Blind Protocol: Identitas toko disamarkan 100%</span>
        </div>
      </div>

      {/* Parts Grid */}
      {filteredParts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <Search className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">
            Suku Cadang Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tidak ada inventori dead-stock yang cocok dengan nomor OEM atau kriteria pencarian saat ini. Coba ubah nomor OEM atau reset filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredParts.map((part) => {
            const isMyStoreItem = part.sellerStoreId === activeStore.id;
            const currentQuotedPrice =
              customQuotes[part.id] !== undefined
                ? customQuotes[part.id]
                : part.suggestedRetailPrice;

            const marginRp = currentQuotedPrice - part.b2bPrice;
            const marginPercent = ((marginRp / part.b2bPrice) * 100).toFixed(1);

            return (
              <div
                key={part.id}
                className={`rounded-xl border transition-all duration-200 bg-slate-900/90 flex flex-col justify-between overflow-hidden shadow-lg ${
                  part.isHeld
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top: Blind Shield & Zone */}
                <div className="px-5 pt-4 pb-3 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-800 text-slate-300">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <span className="text-slate-300 font-medium">
                      Penjual Disamarkan: <strong className="text-slate-100 font-mono">NODE-{part.sellerStoreId.replace('store-', '').toUpperCase()}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{part.sellerZone}</span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex gap-4">
                    {/* Part Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      <img
                        src={part.imageUrl}
                        alt={part.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Part Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          OEM: {part.oemNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Stok Tersedia: <strong className="text-white">{part.stockQty} Pcs</strong>
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-semibold text-white leading-snug">
                        {part.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 truncate">
                        {part.brand} · {part.carMake} {part.carModel} ({part.yearRange})
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-slate-300">{part.condition}</span>
                        <span>·</span>
                        <span className="text-amber-300 font-medium">
                          Dead-Stock {part.shelfAgeDays} Hari
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400">{part.etaEstimate}</span>
                      </div>
                    </div>
                  </div>

                  {/* B2B Price & Margin Calculator Box */}
                  <div className="rounded-lg bg-slate-950/80 border border-slate-800/90 p-3.5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800 text-xs">
                      {/* B2B Cost */}
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                          Harga Modal B2B (Likuidasi)
                        </div>
                        <div className="text-base font-extrabold text-amber-400 font-mono tabular-nums mt-0.5">
                          Rp {part.b2bPrice.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-500">Harga beli antar toko</div>
                      </div>

                      {/* Suggested Retail / HET */}
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                          Saran Jual Konsumen (HET)
                        </div>
                        <div className="text-base font-bold text-slate-200 font-mono tabular-nums mt-0.5">
                          Rp {part.suggestedRetailPrice.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-500">Standar harga eceran bengkel</div>
                      </div>
                    </div>

                    {/* Interactive Margin Preview for Cashier */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-400 whitespace-nowrap">
                          Simulasi Tawar ke Pelanggan:
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-mono">
                            Rp
                          </span>
                          <input
                            type="text"
                            value={currentQuotedPrice.toLocaleString('id-ID')}
                            onChange={(e) => handleCustomQuoteChange(part.id, e.target.value)}
                            className="w-32 pl-7 pr-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-[11px] text-slate-400">Potensi Margin:</span>
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            marginRp > 0
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          +Rp {marginRp.toLocaleString('id-ID')} (+{marginPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hold Status Flag if currently locked */}
                  {part.isHeld && (
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-300">
                        <Clock className="w-4 h-4 animate-spin text-amber-400" />
                        <span>
                          {part.heldByStoreId === activeStore.id
                            ? 'Barang sedang Anda kunci (Atomic Hold 30 Menit aktif)'
                            : 'Barang sedang dikunci oleh bengkel lain (Mencegah double-booking)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  {isMyStoreItem ? (
                    <div className="text-slate-400 text-xs italic">
                      Item ini adalah inventori milik toko Anda sendiri
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {/* Atomic Hold Button */}
                        <button
                          onClick={() => lockStockAtomic(part.id)}
                          disabled={part.isHeld || part.stockQty <= 0}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          title="Kunci stok selama 30 menit agar tidak dibeli toko lain saat kasir negosiasi dengan pelanggan"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kunci Stok 30 Menit</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Direct Buy via Escrow */}
                        <button
                          onClick={() => onDirectCheckout(part)}
                          disabled={part.stockQty <= 0}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <span>Beli via Escrow</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Test Button: Simulate Seller Negligence Penalty */}
                        <button
                          onClick={() =>
                            triggerSellerStockNegligencePenalty(
                              part.id,
                              part.sellerStoreId,
                              part.oemNumber,
                              'Kelalaian sinkronisasi: Stok fisik toko penjual kosong padahal tertera di Blind Marketplace'
                            )
                          }
                          title="Simulasi jika penjual lalai (misal stok fisik ternyata sudah laku offline): memicu penalti -15 poin & denda Rp 25.000 otomatis"
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
