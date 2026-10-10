import React, { useState } from 'react';
import { usePartShare } from '../context/PartShareContext';
import { PartCategory } from '../types';
import { Layers, X, Plus, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface ListDeadStockModalProps {
  onClose: () => void;
}

const PRESET_IMAGES = [
  { label: 'Kampas & Piringan Rem (Brake Set)', url: '/src/assets/images/brake_rotor_oem_1791643319079.jpg' },
  { label: 'Koil Pengapian & Busi (Ignition)', url: '/src/assets/images/ignition_coil_pack_1791643331216.jpg' },
  { label: 'Headlamp & Lampu Projector (LED)', url: '/src/assets/images/led_headlamp_assembly_1791643343935.jpg' }
];

export const ListDeadStockModal: React.FC<ListDeadStockModalProps> = ({ onClose }) => {
  const { activeStore, addNewDeadStockPart } = usePartShare();

  const [oemNumber, setOemNumber] = useState('17801-0Y040');
  const [title, setTitle] = useState('Filter Udara Engine (Air Filter OEM) Avanza & Veloz Dual VVT-i');
  const [brand, setBrand] = useState('Toyota Genuine Parts (Astra)');
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Avanza & Veloz 1.3 / 1.5');
  const [yearRange, setYearRange] = useState('2015 - 2021');
  const [category, setCategory] = useState<PartCategory>('Engine & Ignition');
  const [condition, setCondition] = useState('Baru Segel OEM');
  const [shelfAgeDays, setShelfAgeDays] = useState(195);
  const [stockQty, setStockQty] = useState(6);
  const [b2bPrice, setB2bPrice] = useState(135000);
  const [suggestedRetailPrice, setSuggestedRetailPrice] = useState(240000);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[1].url);
  const [notes, setNotes] = useState('Stok dead-stock gudang peremajaan toko. Kemasan segel plastik resmi belum pernah dibuka.');

  const marginRp = suggestedRetailPrice - b2bPrice;
  const marginPercent = b2bPrice > 0 ? ((marginRp / b2bPrice) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addNewDeadStockPart({
      oemNumber,
      title,
      brand,
      carMake,
      carModel,
      yearRange,
      category,
      condition,
      shelfAgeDays: Number(shelfAgeDays),
      stockQty: Number(stockQty),
      b2bPrice: Number(b2bPrice),
      suggestedRetailPrice: Number(suggestedRetailPrice),
      sellerStoreId: activeStore.id,
      sellerZone: activeStore.zone,
      imageUrl: selectedImage,
      specs: {
        'Status Segel': 'Pabrik OEM Utuh',
        'Asal Gudang': activeStore.zone
      },
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Likuidasi Dead-Stock ke Blind Pool</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Tambahkan Suku Cadang Macet ke Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identitas toko Anda disamarkan sepenuhnya. Hanya radius wilayah dan margin B2B yang akan terlihat oleh toko pembeli.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: OEM & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor OEM Part *</label>
              <input
                type="text"
                required
                value={oemNumber}
                onChange={(e) => setOemNumber(e.target.value)}
                placeholder="cth: 04465-0K140"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Nama Suku Cadang *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Kampas Rem Depan Hilux Reborn"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          {/* Row 2: Brand & Vehicle Make */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Merek Part *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="cth: Denso / Toyota OEM"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Merek Mobil *</label>
              <select
                value={carMake}
                onChange={(e) => setCarMake(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Daihatsu">Daihatsu</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Nissan">Nissan</option>
                <option value="Hyundai">Hyundai</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Model & Varian *</label>
              <input
                type="text"
                required
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="cth: Innova Reborn / Fortuner"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          {/* Row 3: Year, Category, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tahun Kompatibel *</label>
              <input
                type="text"
                value={yearRange}
                onChange={(e) => setYearRange(e.target.value)}
                placeholder="cth: 2016 - 2023"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori Suku Cadang *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PartCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="Braking">Braking</option>
                <option value="Engine & Ignition">Engine & Ignition</option>
                <option value="Suspension & Steering">Suspension & Steering</option>
                <option value="Drivetrain">Drivetrain</option>
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Body & Accessories">Body & Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kondisi Barang *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="Baru Segel OEM">Baru Segel OEM</option>
                <option value="Aftermarket Grade A">Aftermarket Grade A</option>
                <option value="Lelang Pabrik NOS">Lelang Pabrik NOS</option>
                <option value="Copotan Mulus 95%">Copotan Mulus 95%</option>
              </select>
            </div>
          </div>

          {/* Row 4: Dead-Stock Age & Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lama Mengendap di Rak Gudang (Hari) *
              </label>
              <input
                type="number"
                min={1}
                value={shelfAgeDays}
                onChange={(e) => setShelfAgeDays(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jumlah Stok Fisik *</label>
              <input
                type="number"
                min={1}
                value={stockQty}
                onChange={(e) => setStockQty(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Row 5: Pricing & Margin Calculation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Harga Modal Likuidasi B2B (Rp) *
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={b2bPrice}
                  onChange={(e) => setB2bPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Harga yang akan diterima toko Anda</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Saran Jual Eceran Konsumen / HET (Rp) *
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={suggestedRetailPrice}
                  onChange={(e) => setSuggestedRetailPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Rekomendasi harga jual kasir pembeli</span>
              </div>
            </div>

            {/* Profit Margin Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
              <span className="text-slate-400 font-sans">Margin Keuntungan untuk Kasir Pembeli:</span>
              <span className="text-emerald-400 font-extrabold text-sm tabular-nums">
                +Rp {marginRp.toLocaleString('id-ID')} (+{marginPercent}%)
              </span>
            </div>
          </div>

          {/* Photo Preset Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Foto Suku Cadang</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_IMAGES.map((img) => (
                <div
                  key={img.url}
                  onClick={() => setSelectedImage(img.url)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedImage === img.url
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-16 object-cover rounded mb-1"
                  />
                  <div className="text-[10px] text-slate-300 truncate">{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Kondisi Barang</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publikasikan ke Blind Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
