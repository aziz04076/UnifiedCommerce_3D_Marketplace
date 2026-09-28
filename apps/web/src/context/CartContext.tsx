'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User } from '@unified-commerce/types';
import { getAllProducts, getProductById } from '@unified-commerce/database';

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type ShippingTier = 'standard' | 'express' | 'drone';

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  freeShipping?: boolean;
  description: string;
}

export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface GiftCard {
  code: string;
  initialBalance: number;
  remainingBalance: number;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'CARD' | 'UPI';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  upiId?: string;
  isDefault: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  savedForLater: CartItem[];
  wishlistIds: string[];
  appliedCoupon: Coupon | null;
  shippingTier: ShippingTier;
  shippingAddress: ShippingAddress;
  orders: Order[];
  subtotal: number;
  discountAmount: number;
  membershipTier: MembershipTier;
  setMembershipTier: (tier: MembershipTier) => void;
  vipDiscountPercent: number;
  vipDiscountAmount: number;
  storeCreditBalance: number;
  useStoreCredit: boolean;
  setUseStoreCredit: (use: boolean) => void;
  storeCreditApplied: number;
  appliedGiftCard: GiftCard | null;
  giftCardDiscountAmount: number;
  applyGiftCard: (code: string) => { success: boolean; message: string };
  removeGiftCard: () => void;
  savedPaymentMethods: SavedPaymentMethod[];
  addPaymentMethod: (method: Omit<SavedPaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  shippingFee: number;
  taxAmount: number;
  total: number;
  freeShippingThreshold: number;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSpec?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedForLater: (id: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setShippingTier: (tier: ShippingTier) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  clearCart: () => void;
  createOrder: (paymentMethod: 'STRIPE' | 'RAZORPAY' | 'WALLET' | 'CRYPTO' | 'COD') => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  requestOrderReturn: (orderId: string, reason: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const AVAILABLE_COUPONS: Record<string, Coupon> = {
  CYBER2026: {
    code: 'CYBER2026',
    discountPercent: 15,
    description: '15% Off Neural & Hardware Catalog',
  },
  NEURAL100: {
    code: 'NEURAL100',
    discountFixed: 100,
    description: '$100 Instant Lab Rebate',
  },
  FREESHIP: {
    code: 'FREESHIP',
    freeShipping: true,
    description: 'Free Global Teleport Shipping',
  },
};

const AVAILABLE_GIFT_CARDS: Record<string, number> = {
  'GIFT-100': 100,
  'GIFT-250': 250,
  'GIFT-500': 500,
  'VIP-CYBER-1000': 1000,
};

const DEFAULT_SAVED_PAYMENTS: SavedPaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'CARD',
    brand: 'Visa Signature Neural',
    last4: '4242',
    expMonth: 9,
    expYear: 2028,
    isDefault: true,
  },
  {
    id: 'pm-002',
    type: 'CARD',
    brand: 'Mastercard Obsidian',
    last4: '8831',
    expMonth: 4,
    expYear: 2029,
    isDefault: false,
  },
  {
    id: 'pm-003',
    type: 'UPI',
    upiId: 'alex.vance@okquantum',
    isDefault: false,
  },
];

const DEFAULT_ADDRESS: ShippingAddress = {
  fullName: 'Alex Vance',
  street: '742 Evergreen Terrace, Sector 4',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94107',
  country: 'United States',
  phone: '+1 (555) 234-8900',
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-001', 'prod-011', 'prod-021', 'prod-041']);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingTier, setShippingTier] = useState<ShippingTier>('standard');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(DEFAULT_ADDRESS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('GOLD');
  const [storeCreditBalance, setStoreCreditBalance] = useState<number>(150);
  const [useStoreCredit, setUseStoreCredit] = useState<boolean>(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>(DEFAULT_SAVED_PAYMENTS);

  // Initialize from default seed items & localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('uc_cart');
      const savedWishlist = localStorage.getItem('uc_wishlist');
      const savedOrders = localStorage.getItem('uc_orders');
      const savedTier = localStorage.getItem('uc_tier') as MembershipTier | null;
      const savedPayments = localStorage.getItem('uc_saved_payments');

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        // Initial realistic cart seed
        const p1 = getProductById('prod-001'); // Aether Apex
        const p2 = getProductById('prod-011'); // SonicForge Elysium
        const initialCart: CartItem[] = [];
        if (p1) initialCart.push({ id: 'cart-init-1', productId: p1.id, product: p1, quantity: 1, selectedColor: 'Obsidian Stealth' });
        if (p2) initialCart.push({ id: 'cart-init-2', productId: p2.id, product: p2, quantity: 1, selectedColor: 'Cyber Titanium' });
        setCartItems(initialCart);
      }

      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }

      if (savedTier) {
        setMembershipTier(savedTier);
      }

      if (savedPayments) {
        setSavedPaymentMethods(JSON.parse(savedPayments));
      }

      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        // Initial seed order
        const p1 = getProductById('prod-021'); // Vortex LiDAR Drone
        if (p1) {
          const sampleOrder: Order = {
            id: 'ord-seed-8942',
            orderNumber: 'UC-2026-8942X',
            userId: 'user-001',
            items: [
              {
                id: 'item-seed-1',
                productId: p1.id,
                productName: p1.name,
                productImage: p1.images[0],
                vendorId: p1.vendorId,
                quantity: 1,
                unitPrice: p1.price,
              },
            ],
            subtotal: p1.price,
            platformFee: Math.round(p1.price * 0.08),
            shippingFee: 0,
            tax: Math.round(p1.price * 0.07),
            total: Math.round(p1.price * 1.07),
            currency: 'USD',
            status: 'OUT_FOR_DELIVERY',
            paymentStatus: 'PAID',
            paymentMethod: 'STRIPE',
            shippingAddress: DEFAULT_ADDRESS,
            tracking: {
              carrier: 'Quantum Suborbital Air Express',
              trackingCode: 'QSA-9941-TK',
              estimatedDelivery: 'Today by 5:00 PM',
              currentLocation: {
                lat: 37.7749,
                lng: -122.4194,
                name: 'San Francisco Bay Hub Station',
              },
            },
            createdAt: '2026-09-27T10:14:00Z',
          };
          setOrders([sampleOrder]);
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('uc_cart', JSON.stringify(cartItems));
      localStorage.setItem('uc_wishlist', JSON.stringify(wishlistIds));
      localStorage.setItem('uc_orders', JSON.stringify(orders));
      localStorage.setItem('uc_tier', membershipTier);
      localStorage.setItem('uc_saved_payments', JSON.stringify(savedPaymentMethods));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [cartItems, wishlistIds, orders, membershipTier, savedPaymentMethods, mounted]);

  // Financial Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1000;

  // VIP discount calculation
  const vipDiscountPercent =
    membershipTier === 'PLATINUM' ? 10 : membershipTier === 'GOLD' ? 5 : membershipTier === 'SILVER' ? 2 : 0;
  const vipDiscountAmount = Math.round((subtotal * vipDiscountPercent) / 100);

  let calculatedShipping = 0;
  if (cartItems.length > 0) {
    if (
      appliedCoupon?.freeShipping ||
      (shippingTier === 'standard' && subtotal >= freeShippingThreshold) ||
      membershipTier === 'PLATINUM' ||
      (membershipTier === 'GOLD' && shippingTier !== 'drone')
    ) {
      calculatedShipping = 0;
    } else if (shippingTier === 'drone') {
      calculatedShipping = 120;
    } else if (shippingTier === 'express') {
      calculatedShipping = 65;
    } else {
      calculatedShipping = 25;
    }
  }

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountFixed) {
      discountAmount = Math.min(subtotal, appliedCoupon.discountFixed);
    }
  }

  const basePriceAfterDiscounts = Math.max(0, subtotal - discountAmount - vipDiscountAmount);

  // Gift Card deduction
  let giftCardDiscountAmount = 0;
  if (appliedGiftCard) {
    giftCardDiscountAmount = Math.min(basePriceAfterDiscounts, appliedGiftCard.remainingBalance);
  }

  const priceAfterGiftCard = Math.max(0, basePriceAfterDiscounts - giftCardDiscountAmount);

  // Store Credit deduction
  let storeCreditApplied = 0;
  if (useStoreCredit && storeCreditBalance > 0) {
    storeCreditApplied = Math.min(priceAfterGiftCard, storeCreditBalance);
  }

  const taxableAmount = Math.max(0, priceAfterGiftCard - storeCreditApplied);
  const taxAmount = Math.round(taxableAmount * 0.065); // 6.5% average tax
  const total = Math.max(0, taxableAmount + calculatedShipping + (taxableAmount > 0 ? taxAmount : 0));

  // Cart Mutators
  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSpec?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.selectedColor === selectedColor
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: product.id,
          product,
          quantity,
          selectedColor,
          selectedSpec,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const saveForLater = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    setSavedForLater((prev) => [...prev, item]);
  };

  const moveToCart = (id: string) => {
    const item = savedForLater.find((i) => i.id === id);
    if (!item) return;
    setSavedForLater((prev) => prev.filter((i) => i.id !== id));
    setCartItems((prev) => [...prev, item]);
  };

  const removeSavedForLater = (id: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[normalized];
    if (coupon) {
      setAppliedCoupon(coupon);
      return { success: true, message: `Applied: ${coupon.description}` };
    }
    return { success: false, message: 'Invalid protocol coupon code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const applyGiftCard = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const balance = AVAILABLE_GIFT_CARDS[normalized];
    if (balance !== undefined) {
      setAppliedGiftCard({
        code: normalized,
        initialBalance: balance,
        remainingBalance: balance,
      });
      return { success: true, message: `Applied $${balance} Gift Card balance!` };
    }
    return { success: false, message: 'Invalid or expired Gift Card code' };
  };

  const removeGiftCard = () => {
    setAppliedGiftCard(null);
  };

  const addPaymentMethod = (method: Omit<SavedPaymentMethod, 'id'>) => {
    const newId = `pm-${Date.now()}`;
    setSavedPaymentMethods((prev) => {
      const updated = method.isDefault ? prev.map((m) => ({ ...m, isDefault: false })) : prev;
      return [...updated, { ...method, id: newId }];
    });
  };

  const deletePaymentMethod = (id: string) => {
    setSavedPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setSavedPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setAppliedGiftCard(null);
  };

  const createOrder = (paymentMethod: 'STRIPE' | 'RAZORPAY' | 'WALLET' | 'CRYPTO' | 'COD'): Order => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `UC-2026-${randomCode}X`,
      userId: 'user-001',
      items: cartItems.map((c) => ({
        id: `item-${Date.now()}-${c.productId}`,
        productId: c.productId,
        productName: c.product.name,
        productImage: c.product.images[0],
        vendorId: c.product.vendorId,
        quantity: c.quantity,
        unitPrice: c.product.price,
      })),
      subtotal,
      platformFee: Math.round(subtotal * 0.08),
      shippingFee: calculatedShipping,
      tax: taxAmount,
      total,
      currency: 'USD',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod,
      shippingAddress,
      tracking: {
        carrier:
          shippingTier === 'drone'
            ? 'Unified Autonomous Drone Grid'
            : shippingTier === 'express'
            ? 'Hyper-Suborbital Transit'
            : 'Standard Quantum Freight',
        trackingCode: `TRK-2026-${randomCode}-${shippingTier.toUpperCase()}`,
        estimatedDelivery:
          shippingTier === 'drone'
            ? 'Within 4 Hours'
            : shippingTier === 'express'
            ? 'Tomorrow by 12:00 PM'
            : '2-3 Business Days',
        currentLocation: {
          lat: 35.6762,
          lng: 139.6503,
          name: 'Tokyo Advanced Assembly Node',
        },
      },
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o))
    );
  };

  const requestOrderReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? {
              ...o,
              status: 'CANCELLED',
              tracking: {
                ...o.tracking,
                carrier: `Return Initiated: ${reason}`,
              },
            }
          : o
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLater,
        wishlistIds,
        appliedCoupon,
        shippingTier,
        shippingAddress,
        orders,
        subtotal,
        discountAmount,
        membershipTier,
        setMembershipTier,
        vipDiscountPercent,
        vipDiscountAmount,
        storeCreditBalance,
        useStoreCredit,
        setUseStoreCredit,
        storeCreditApplied,
        appliedGiftCard,
        giftCardDiscountAmount,
        applyGiftCard,
        removeGiftCard,
        savedPaymentMethods,
        addPaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        shippingFee: calculatedShipping,
        taxAmount,
        total,
        freeShippingThreshold,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCart,
        removeSavedForLater,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        setShippingTier,
        setShippingAddress,
        clearCart,
        createOrder,
        getOrderById,
        updateOrderStatus,
        requestOrderReturn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
