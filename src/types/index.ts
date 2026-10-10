export type StoreRole = 'buyer' | 'seller' | 'admin';

export type ReputationTier = 'Platinum Partner' | 'Verified Partner' | 'Perhatian Khusus' | 'Suspended';

export interface PenaltyRecord {
  id: string;
  date: string;
  reason: string;
  scoreDelta: number;
  fineAmount: number;
  oemCode?: string;
}

export interface Store {
  id: string;
  name: string;
  displayName: string; // Used internally, masked on marketplace
  zone: string;
  address: string;
  phone: string;
  reputationScore: number;
  reputationTier: ReputationTier;
  walletBalance: number;
  escrowLockedBalance: number;
  activeRole: StoreRole;
  penaltiesCount: number;
  penaltyHistory: PenaltyRecord[];
}

export type PartCategory =
  | 'Braking'
  | 'Engine & Ignition'
  | 'Suspension & Steering'
  | 'Drivetrain'
  | 'Electrical & Lighting'
  | 'Body & Accessories';

export interface PartItem {
  id: string;
  oemNumber: string;
  title: string;
  brand: string;
  carMake: string;
  carModel: string;
  yearRange: string;
  category: PartCategory;
  condition: string;
  shelfAgeDays: number;
  stockQty: number;
  b2bPrice: number; // Harga Modal B2B / Likuidasi Dead-Stock
  suggestedRetailPrice: number; // HET / Rekomendasi Jual ke Konsumen
  sellerStoreId: string;
  sellerZone: string;
  distanceKmApprox: number;
  etaEstimate: string;
  isHeld: boolean;
  heldUntil: number | null; // Timestamp
  heldByStoreId: string | null;
  heldById: string | null;
  imageUrl: string;
  specs: Record<string, string>;
  notes: string;
}

export interface StockHold {
  id: string;
  partId: string;
  buyerStoreId: string;
  createdAt: number;
  expiresAt: number; // 30 minutes
  oemNumber: string;
  partTitle: string;
  b2bPrice: number;
  qty: number;
  status: 'active' | 'expired' | 'checked_out' | 'cancelled';
}

export type OrderStatus =
  | 'escrow_locked'
  | 'dispatched_courier'
  | 'delivered_pending_inspection'
  | 'verified_released'
  | 'disputed_penalty';

export type EscrowVaultStatus =
  | 'FUNDS_LOCKED_IN_ESCROW'
  | 'COURIER_IN_TRANSIT'
  | 'VERIFIED_RELEASED_TO_SELLER'
  | 'REFUNDED_PENALTY_CHARGED';

export interface Order {
  id: string;
  blindTrackingCode: string;
  buyerStoreId: string;
  sellerStoreId: string;
  partId: string;
  oemNumber: string;
  partTitle: string;
  brand: string;
  carCompatibility: string;
  qty: number;
  b2bUnitPrice: number;
  itemTotal: number;
  shippingFee: number;
  platformEscrowFee: number; // 3%
  totalPaid: number;
  status: OrderStatus;
  escrowStatus: EscrowVaultStatus;
  courierName: string;
  courierTrackingCode: string;
  blindLabelGenerated: boolean;
  createdAt: number;
  updatedAt: number;
  sellerZone: string;
  buyerZone: string;
  verificationNotes?: string;
  verificationPassed?: boolean;
}

export interface WalletTransaction {
  id: string;
  storeId: string;
  type: 'deposit' | 'escrow_hold' | 'escrow_release' | 'penalty_fine' | 'withdrawal';
  amount: number;
  timestamp: number;
  description: string;
  referenceOrderId?: string;
  status: 'completed' | 'pending' | 'reversed';
}
