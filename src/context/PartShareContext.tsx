import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Store,
  PartItem,
  StockHold,
  Order,
  WalletTransaction,
  StoreRole,
  ReputationTier
} from '../types';
import {
  INITIAL_STORES,
  INITIAL_PARTS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS
} from '../data/mockData';

const HOLD_DURATION_MS = 30 * 60 * 1000; // 30 minutes atomic lock

interface PartShareContextType {
  stores: Store[];
  activeStore: Store;
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  parts: PartItem[];
  activeHolds: StockHold[];
  orders: Order[];
  transactions: WalletTransaction[];
  selectedHoldForModal: StockHold | null;
  setSelectedHoldForModal: (hold: StockHold | null) => void;
  selectedOrderForLabel: Order | null;
  setSelectedOrderForLabel: (order: Order | null) => void;
  // Hold functions
  lockStockAtomic: (partId: string) => { success: boolean; message: string; hold?: StockHold };
  releaseHoldManual: (holdId: string, reason?: string) => void;
  // Escrow & Order functions
  checkoutHoldToEscrow: (
    holdId: string,
    courierName: string,
    shippingFee: number
  ) => { success: boolean; message: string; order?: Order };
  directBuyToEscrow: (
    partId: string,
    courierName: string,
    shippingFee: number
  ) => { success: boolean; message: string; order?: Order };
  sellerDispatchOrder: (orderId: string, trackingCode: string) => void;
  courierDeliverOrder: (orderId: string) => void;
  buyerVerifyAndReleaseEscrow: (orderId: string, notes?: string) => { success: boolean; message: string };
  triggerSellerStockNegligencePenalty: (
    orderIdOrPartId: string,
    sellerStoreId: string,
    oemCode: string,
    reason: string
  ) => void;
  // Inventory Listing
  addNewDeadStockPart: (
    part: Omit<PartItem, 'id' | 'isHeld' | 'heldUntil' | 'heldByStoreId' | 'heldById' | 'distanceKmApprox' | 'etaEstimate'>
  ) => void;
  // Wallet
  topUpActiveWallet: (amount: number) => void;
  withdrawActiveWallet: (amount: number) => { success: boolean; message: string };
  // UI Notification Toast
  toast: { message: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const PartShareContext = createContext<PartShareContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'partshare_b2b_v1_';

export const PartShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stores`);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [activeStoreId, setActiveStoreId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activeStoreId`);
    return saved || 'store-bengkel-sentosa';
  });

  const [parts, setParts] = useState<PartItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}parts`);
    return saved ? JSON.parse(saved) : INITIAL_PARTS;
  });

  const [activeHolds, setActiveHolds] = useState<StockHold[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}holds`);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [selectedHoldForModal, setSelectedHoldForModal] = useState<StockHold | null>(null);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stores`, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activeStoreId`, activeStoreId);
  }, [activeStoreId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}parts`, JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}holds`, JSON.stringify(activeHolds));
  }, [activeHolds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0];

  // Helper to calculate tier
  const calculateTier = (score: number): ReputationTier => {
    if (score >= 95) return 'Platinum Partner';
    if (score >= 90) return 'Verified Partner';
    if (score >= 75) return 'Perhatian Khusus';
    return 'Suspended';
  };

  // Timer loop for auto-expiring holds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      setActiveHolds((prevHolds) => {
        const remaining: StockHold[] = [];
        const expiredIds: string[] = [];

        prevHolds.forEach((hold) => {
          if (hold.status === 'active' && hold.expiresAt <= now) {
            hasChanges = true;
            expiredIds.push(hold.partId);
          } else {
            remaining.push(hold);
          }
        });

        if (hasChanges && expiredIds.length > 0) {
          // Release parts back to available pool
          setParts((prevParts) =>
            prevParts.map((part) => {
              if (expiredIds.includes(part.id)) {
                return {
                  ...part,
                  isHeld: false,
                  heldUntil: null,
                  heldByStoreId: null,
                  heldById: null
                };
              }
              return part;
            })
          );
          showToast('Kunci stok 30 menit kedaluwarsa. Barang otomatis dikembalikan ke katalog pasar.', 'warning');
        }

        return remaining;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [showToast]);

  // Atomic Stock Hold 30 Menit
  const lockStockAtomic = useCallback(
    (partId: string) => {
      const part = parts.find((p) => p.id === partId);
      if (!part) {
        return { success: false, message: 'Barang tidak ditemukan' };
      }

      if (part.isHeld && part.heldUntil && part.heldUntil > Date.now()) {
        const remainingMinutes = Math.ceil((part.heldUntil - Date.now()) / 60000);
        return {
          success: false,
          message: `Stok sedang dikunci oleh toko lain (${remainingMinutes} menit tersisa). Atomic lock mencegah double-booking.`
        };
      }

      if (part.stockQty <= 0) {
        return { success: false, message: 'Stok barang sudah habis' };
      }

      if (part.sellerStoreId === activeStore.id) {
        return { success: false, message: 'Tidak dapat mengunci stok milik toko sendiri' };
      }

      const now = Date.now();
      const expiresAt = now + HOLD_DURATION_MS;
      const holdId = `HOLD-${Math.floor(10000 + Math.random() * 90000)}`;

      const newHold: StockHold = {
        id: holdId,
        partId: part.id,
        buyerStoreId: activeStore.id,
        createdAt: now,
        expiresAt,
        oemNumber: part.oemNumber,
        partTitle: part.title,
        b2bPrice: part.b2bPrice,
        qty: 1,
        status: 'active'
      };

      // Atomic lock part
      setParts((prev) =>
        prev.map((p) =>
          p.id === partId
            ? {
                ...p,
                isHeld: true,
                heldUntil: expiresAt,
                heldByStoreId: activeStore.id,
                heldById: holdId
              }
            : p
        )
      );

      setActiveHolds((prev) => [newHold, ...prev.filter((h) => h.partId !== partId)]);
      setSelectedHoldForModal(newHold);

      showToast(
        `Kunci Stok Berhasil! OEM ${part.oemNumber} ditahan selama 30 menit khusus untuk kasir Anda.`,
        'success'
      );

      return { success: true, message: 'Berhasil mengunci stok 30 menit', hold: newHold };
    },
    [parts, activeStore, showToast]
  );

  // Release Hold Manually
  const releaseHoldManual = useCallback(
    (holdId: string, reason?: string) => {
      const hold = activeHolds.find((h) => h.id === holdId);
      if (!hold) return;

      // Update part
      setParts((prev) =>
        prev.map((p) =>
          p.id === hold.partId
            ? {
                ...p,
                isHeld: false,
                heldUntil: null,
                heldByStoreId: null,
                heldById: null
              }
            : p
        )
      );

      // Remove from active holds
      setActiveHolds((prev) => prev.filter((h) => h.id !== holdId));
      if (selectedHoldForModal?.id === holdId) {
        setSelectedHoldForModal(null);
      }

      showToast(reason || `Kunci stok OEM ${hold.oemNumber} telah dilepas kembali ke pool B2B.`, 'info');
    },
    [activeHolds, selectedHoldForModal, showToast]
  );

  // Escrow Checkout from Hold
  const checkoutHoldToEscrow = useCallback(
    (holdId: string, courierName: string, shippingFee: number) => {
      const hold = activeHolds.find((h) => h.id === holdId);
      if (!hold) return { success: false, message: 'Data Hold tidak ditemukan' };

      const part = parts.find((p) => p.id === hold.partId);
      if (!part) return { success: false, message: 'Barang tidak ditemukan' };

      const itemTotal = part.b2bPrice * hold.qty;
      const platformFee = Math.round(itemTotal * 0.03); // 3% escrow fee
      const totalAmount = itemTotal + shippingFee + platformFee;

      if (activeStore.walletBalance < totalAmount) {
        return {
          success: false,
          message: `Saldo dompet tidak mencukupi (Perlu Rp ${totalAmount.toLocaleString('id-ID')}, Saldo: Rp ${activeStore.walletBalance.toLocaleString('id-ID')}). Silakan top up dompet terlebih dahulu.`
        };
      }

      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const orderId = `PS-B2B-${orderNumber}`;
      const blindTrackingCode = `PS-B2B-${orderNumber}-BLIND`;

      const newOrder: Order = {
        id: orderId,
        blindTrackingCode,
        buyerStoreId: activeStore.id,
        sellerStoreId: part.sellerStoreId,
        partId: part.id,
        oemNumber: part.oemNumber,
        partTitle: part.title,
        brand: part.brand,
        carCompatibility: `${part.carMake} ${part.carModel} (${part.yearRange})`,
        qty: hold.qty,
        b2bUnitPrice: part.b2bPrice,
        itemTotal,
        shippingFee,
        platformEscrowFee: platformFee,
        totalPaid: totalAmount,
        status: 'escrow_locked',
        escrowStatus: 'FUNDS_LOCKED_IN_ESCROW',
        courierName,
        courierTrackingCode: `EXP-B2B-${Math.floor(100000 + Math.random() * 900000)}`,
        blindLabelGenerated: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sellerZone: part.sellerZone,
        buyerZone: activeStore.zone
      };

      // 1. Deduct wallet & add to escrowLockedBalance of buyer
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === activeStore.id) {
            return {
              ...s,
              walletBalance: s.walletBalance - totalAmount,
              escrowLockedBalance: s.escrowLockedBalance + totalAmount
            };
          }
          return s;
        })
      );

      // 2. Reduce part inventory and clear hold
      setParts((prev) =>
        prev.map((p) => {
          if (p.id === part.id) {
            const newQty = Math.max(0, p.stockQty - hold.qty);
            return {
              ...p,
              stockQty: newQty,
              isHeld: false,
              heldUntil: null,
              heldByStoreId: null,
              heldById: null
            };
          }
          return p;
        })
      );

      // 3. Remove hold
      setActiveHolds((prev) => prev.filter((h) => h.id !== holdId));
      if (selectedHoldForModal?.id === holdId) {
        setSelectedHoldForModal(null);
      }

      // 4. Create Order
      setOrders((prev) => [newOrder, ...prev]);

      // 5. Create Transaction Record
      const newTxn: WalletTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        storeId: activeStore.id,
        type: 'escrow_hold',
        amount: -totalAmount,
        timestamp: Date.now(),
        description: `Kunci Saldo Escrow Pesanan ${orderId} (OEM ${part.oemNumber})`,
        referenceOrderId: orderId,
        status: 'completed'
      };
      setTransactions((prev) => [newTxn, ...prev]);

      showToast(
        `Pembayaran Berhasil! Dana Rp ${totalAmount.toLocaleString('id-ID')} tersimpan aman di Platform Escrow Vault. Seller telah diberitahu untuk memproses Blind Shipping.`,
        'success'
      );

      return { success: true, message: 'Pesanan tersimpan dalam Escrow', order: newOrder };
    },
    [activeHolds, parts, activeStore, selectedHoldForModal, showToast]
  );

  // Direct buy without prior hold
  const directBuyToEscrow = useCallback(
    (partId: string, courierName: string, shippingFee: number) => {
      const lockRes = lockStockAtomic(partId);
      if (!lockRes.success || !lockRes.hold) {
        return { success: false, message: lockRes.message };
      }
      return checkoutHoldToEscrow(lockRes.hold.id, courierName, shippingFee);
    },
    [lockStockAtomic, checkoutHoldToEscrow]
  );

  // Seller dispatches courier & prints blind label
  const sellerDispatchOrder = useCallback(
    (orderId: string, trackingCode: string) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: 'dispatched_courier',
              escrowStatus: 'COURIER_IN_TRANSIT',
              courierTrackingCode: trackingCode || o.courierTrackingCode,
              blindLabelGenerated: true,
              updatedAt: Date.now()
            };
          }
          return o;
        })
      );
      showToast('Pesanan diserahkan ke kurir anonim B2B! Resi pengiriman aktif.', 'success');
    },
    [showToast]
  );

  // Courier delivers to buyer workshop
  const courierDeliverOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: 'delivered_pending_inspection',
              updatedAt: Date.now()
            };
          }
          return o;
        })
      );
      showToast('Kurir telah menyerahkan paket di meja bengkel pembeli. Silakan verifikasi fisik barang sebelum rilis escrow.', 'info');
    },
    [showToast]
  );

  // Buyer verifies physical OEM and releases funds to seller
  const buyerVerifyAndReleaseEscrow = useCallback(
    (orderId: string, notes?: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { success: false, message: 'Pesanan tidak ditemukan' };

      if (order.status === 'verified_released') {
        return { success: false, message: 'Pesanan sudah selesai diverifikasi' };
      }

      const payoutToSeller = order.itemTotal; // seller gets item total; platform keeps platformFee, courier gets shipping fee
      const buyerEscrowLocked = order.totalPaid;

      // 1. Update buyer and seller stores
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === order.buyerStoreId) {
            return {
              ...s,
              escrowLockedBalance: Math.max(0, s.escrowLockedBalance - buyerEscrowLocked)
            };
          }
          if (s.id === order.sellerStoreId) {
            return {
              ...s,
              walletBalance: s.walletBalance + payoutToSeller,
              reputationScore: Math.min(100, s.reputationScore + 1), // positive transaction boost
              reputationTier: calculateTier(Math.min(100, s.reputationScore + 1))
            };
          }
          return s;
        })
      );

      // 2. Update order status
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: 'verified_released',
              escrowStatus: 'VERIFIED_RELEASED_TO_SELLER',
              verificationPassed: true,
              verificationNotes: notes || 'Fisik suku cadang telah dicek dan terverifikasi sesuai OEM.',
              updatedAt: Date.now()
            };
          }
          return o;
        })
      );

      // 3. Transactions log
      const releaseTxn: WalletTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        storeId: order.sellerStoreId,
        type: 'escrow_release',
        amount: payoutToSeller,
        timestamp: Date.now(),
        description: `Pencairan Dana Escrow Pesanan ${orderId} (OEM ${order.oemNumber})`,
        referenceOrderId: orderId,
        status: 'completed'
      };
      setTransactions((prev) => [releaseTxn, ...prev]);

      showToast(
        `Verifikasi Sukses! Dana Escrow Rp ${payoutToSeller.toLocaleString('id-ID')} telah diteruskan ke penjual. Reputasi transaksi tercatat sempurna.`,
        'success'
      );

      return { success: true, message: 'Dana Escrow berhasil dicairkan ke penjual' };
    },
    [orders, showToast]
  );

  // Automated Penalty for Stock Negligence
  const triggerSellerStockNegligencePenalty = useCallback(
    (orderIdOrPartId: string, sellerStoreId: string, oemCode: string, reason: string) => {
      const fineAmount = 25000; // Rp 25.000 denda penalti
      const scoreDelta = -15; // -15 poin reputasi

      setStores((prev) =>
        prev.map((s) => {
          if (s.id === sellerStoreId) {
            const newScore = Math.max(0, s.reputationScore + scoreDelta);
            const penaltyRec = {
              id: `PEN-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reason,
              scoreDelta,
              fineAmount,
              oemCode
            };
            return {
              ...s,
              reputationScore: newScore,
              reputationTier: calculateTier(newScore),
              walletBalance: Math.max(0, s.walletBalance - fineAmount),
              penaltiesCount: s.penaltiesCount + 1,
              penaltyHistory: [penaltyRec, ...s.penaltyHistory]
            };
          }
          return s;
        })
      );

      // Add penalty transaction
      const fineTxn: WalletTransaction = {
        id: `TXN-FINE-${Math.floor(1000 + Math.random() * 9000)}`,
        storeId: sellerStoreId,
        type: 'penalty_fine',
        amount: -fineAmount,
        timestamp: Date.now(),
        description: `Denda Penalti Otomatis: ${reason} (OEM ${oemCode})`,
        status: 'completed'
      };
      setTransactions((prev) => [fineTxn, ...prev]);

      // If tied to order, update status to disputed
      if (orderIdOrPartId.startsWith('PS-B2B-')) {
        const order = orders.find((o) => o.id === orderIdOrPartId);
        if (order) {
          // Refund buyer
          setStores((prev) =>
            prev.map((s) => {
              if (s.id === order.buyerStoreId) {
                return {
                  ...s,
                  walletBalance: s.walletBalance + order.totalPaid,
                  escrowLockedBalance: Math.max(0, s.escrowLockedBalance - order.totalPaid)
                };
              }
              return s;
            })
          );

          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderIdOrPartId
                ? {
                    ...o,
                    status: 'disputed_penalty',
                    escrowStatus: 'REFUNDED_PENALTY_CHARGED',
                    verificationNotes: `Dibatalkan otomatis dengan penalti: ${reason}`,
                    updatedAt: Date.now()
                  }
                : o
            )
          );
        }
      }

      showToast(
        `Penalti Otomatis Diberlakukan! Toko pemilik stok dikenakan penalti -15 skor reputasi dan denda Rp 25.000 atas kelalaian sinkronisasi stok.`,
        'error'
      );
    },
    [orders, showToast]
  );

  // Add new dead-stock item
  const addNewDeadStockPart = useCallback(
    (partData: Omit<PartItem, 'id' | 'isHeld' | 'heldUntil' | 'heldByStoreId' | 'heldById' | 'distanceKmApprox' | 'etaEstimate'>) => {
      const newPart: PartItem = {
        ...partData,
        id: `part-${Date.now()}`,
        isHeld: false,
        heldUntil: null,
        heldByStoreId: null,
        heldById: null,
        distanceKmApprox: 12.5,
        etaEstimate: 'Instant B2B: 60-90 Menit'
      };

      setParts((prev) => [newPart, ...prev]);
      showToast(`Suku cadang dead-stock OEM ${newPart.oemNumber} berhasil dilikuidasi ke Blind Marketplace!`, 'success');
    },
    [showToast]
  );

  // Top Up Wallet
  const topUpActiveWallet = useCallback(
    (amount: number) => {
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === activeStore.id) {
            return {
              ...s,
              walletBalance: s.walletBalance + amount
            };
          }
          return s;
        })
      );

      const txn: WalletTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        storeId: activeStore.id,
        type: 'deposit',
        amount: amount,
        timestamp: Date.now(),
        description: `Top-Up Saldo Escrow via B2B Virtual Account VA-BCA (${activeStore.name})`,
        status: 'completed'
      };
      setTransactions((prev) => [txn, ...prev]);

      showToast(`Deposit Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan ke saldo dompet!`, 'success');
    },
    [activeStore, showToast]
  );

  // Withdraw Wallet
  const withdrawActiveWallet = useCallback(
    (amount: number) => {
      if (activeStore.walletBalance < amount) {
        return { success: false, message: 'Saldo tidak mencukupi untuk penarikan' };
      }

      setStores((prev) =>
        prev.map((s) => {
          if (s.id === activeStore.id) {
            return {
              ...s,
              walletBalance: s.walletBalance - amount
            };
          }
          return s;
        })
      );

      const txn: WalletTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        storeId: activeStore.id,
        type: 'withdrawal',
        amount: -amount,
        timestamp: Date.now(),
        description: `Penarikan Dana Hasil Likuidasi Suku Cadang ke Rekening Bank Operasional`,
        status: 'completed'
      };
      setTransactions((prev) => [txn, ...prev]);

      showToast(`Penarikan dana Rp ${amount.toLocaleString('id-ID')} diproses ke rekening bank toko.`, 'success');
      return { success: true, message: 'Penarikan sukses' };
    },
    [activeStore, showToast]
  );

  return (
    <PartShareContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId,
        parts,
        activeHolds,
        orders,
        transactions,
        selectedHoldForModal,
        setSelectedHoldForModal,
        selectedOrderForLabel,
        setSelectedOrderForLabel,
        lockStockAtomic,
        releaseHoldManual,
        checkoutHoldToEscrow,
        directBuyToEscrow,
        sellerDispatchOrder,
        courierDeliverOrder,
        buyerVerifyAndReleaseEscrow,
        triggerSellerStockNegligencePenalty,
        addNewDeadStockPart,
        topUpActiveWallet,
        withdrawActiveWallet,
        toast,
        showToast
      }}
    >
      {children}
    </PartShareContext.Provider>
  );
};

export const usePartShare = () => {
  const context = useContext(PartShareContext);
  if (!context) {
    throw new Error('usePartShare must be used within a PartShareProvider');
  }
  return context;
};
