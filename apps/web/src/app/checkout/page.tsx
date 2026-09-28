'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  QrCode,
  Coins,
  Wallet,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  KeyRound,
  FileText,
  Printer,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useCart, ShippingAddress, ShippingTier } from '../../context/CartContext';
import { Navbar, Footer, Badge, Button, formatPrice } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { AddressBookManager } from '../../components/AddressBookManager';
import { SavedAddress } from '@unified-commerce/types';
import { TrustBadges, CheckoutTrustNote } from '../../components/TrustBadges';

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    appliedCoupon,
    membershipTier,
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
    shippingTier,
    setShippingTier,
    shippingAddress,
    setShippingAddress,
    createOrder,
  } = useCart();

  const [giftCardInput, setGiftCardInput] = useState('');
  const [giftCardMessage, setGiftCardMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const categories = getAllCategories();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address mode: saved address book or manual/guest form
  const [addressTab, setAddressTab] = useState<'SAVED' | 'MANUAL'>('SAVED');
  const [selectedSavedId, setSelectedSavedId] = useState<string>('addr-001');
  const [addressForm, setAddressForm] = useState<ShippingAddress>(shippingAddress);

  // Payment form state
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'RAZORPAY' | 'CRYPTO' | 'WALLET' | 'COD'>('RAZORPAY');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(shippingAddress.fullName || 'Alex Vance');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [upiId, setUpiId] = useState('alex.vance@okaxis');
  const [cryptoToken, setCryptoToken] = useState<'USDC' | 'ETH' | 'SOL'>('USDC');

  // Security & 3DS state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('Initializing security verification...');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [threeDsOtp, setThreeDsOtp] = useState('');
  const [threeDsError, setThreeDsError] = useState<string | null>(null);
  const [threeDsVerifying, setThreeDsVerifying] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Handle address book selection
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedId(addr.id);
    const converted: ShippingAddress = {
      fullName: addr.fullName,
      street: addr.street + (addr.landmark ? `, Landmark: ${addr.landmark}` : ''),
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
    };
    setAddressForm(converted);
    setShippingAddress(converted);
    setCardHolder(addr.fullName);
  };

  const handleNextToShipping = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShippingAddress(addressForm);
    setCurrentStep(2);
  };

  // Complete checkout with backend security enforcement
  const handlePlaceOrder = async () => {
    if (!policyAccepted) {
      setPolicyError(true);
      setErrorNotice('Please review and agree to the store terms and policies before placing an order.');
      return;
    }

    setIsProcessing(true);
    setErrorNotice(null);
    setProcessingStatusText('Executing zero-trust DB price recalculation...');

    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 1. Call Backend Create-Intent (Server-side price verification + fraud velocity)
      const intentRes = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          clientSubtotal: subtotal,
          clientTotal: total,
          shippingTier,
          couponCode: appliedCoupon?.code,
          paymentMethod: paymentProvider,
          shippingCountry: shippingAddress.country || 'India',
          billingCountry: shippingAddress.country || 'India',
        }),
      });

      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        setIsProcessing(false);
        setErrorNotice(
          intentData.message ||
            (intentData.error === 'PRICE_TAMPERING_DETECTED'
              ? 'Security check failed: DB price discrepancy detected.'
              : 'Transaction flagged by security velocity shield.')
        );
        return;
      }

      setPendingIntent(intentData);

      // 2. Check if 3D Secure / SCA step-up challenge is required (e.g. Card payment or fraud trigger)
      if (paymentProvider === 'STRIPE' || intentData.requires3DSecure) {
        setIsProcessing(false);
        setShow3DSModal(true);
        return;
      }

      // 3. For UPI / Crypto / Wallet, proceed directly to confirmation
      await finalizeOrderConfirmation(intentData, true);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorNotice(err.message || 'Payment engine encountered a network error.');
    }
  };

  // Verify 3DS OTP challenge
  const handleVerify3DS = async (e: React.FormEvent) => {
    e.preventDefault();
    setThreeDsVerifying(true);
    setThreeDsError(null);

    // Accept demo OTP '771928' or standard 6-digit pin
    if (threeDsOtp.trim() !== '771928' && !/^\d{6}$/.test(threeDsOtp)) {
      setThreeDsError('Invalid OTP authentication code. Use demo code: 771928');
      setThreeDsVerifying(false);
      return;
    }

    setTimeout(async () => {
      try {
        await finalizeOrderConfirmation(pendingIntent, true);
        setShow3DSModal(false);
      } catch (err: any) {
        setThreeDsError(err.message || 'Failed to authenticate 3D Secure challenge.');
      } finally {
        setThreeDsVerifying(false);
      }
    }, 1200);
  };

  // Finalize order confirmation call with AES-256 PII encryption at rest
  const finalizeOrderConfirmation = async (intent: any, threeDSecurePassed = true) => {
    setIsProcessing(true);
    setProcessingStatusText('Encrypting PII with AES-256-GCM and locking escrow...');

    const confirmRes = await fetch('/api/checkout/confirm-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: intent.orderId,
        clientSecret: intent.clientSecret,
        amount: intent.verifiedTotal,
        paymentMethod: paymentProvider,
        threeDSecurePassed,
        shippingAddress: {
          fullName: shippingAddress.fullName || 'Alex Vance',
          phone: shippingAddress.phone || '+91 98765 43210',
          street: shippingAddress.street || 'Penthouse 42B, Neo-Bandra Heights',
          city: shippingAddress.city || 'Mumbai',
          state: shippingAddress.state || 'Maharashtra',
          postalCode: shippingAddress.postalCode || '400050',
          country: shippingAddress.country || 'India',
        },
      }),
    });

    const confirmData = await confirmRes.json();

    if (!confirmRes.ok) {
      throw new Error(confirmData.message || 'Payment confirmation failed.');
    }

    // Mutate frontend CartContext order state
    const created = createOrder(paymentProvider);
    const enrichedOrder = {
      ...created,
      dataProtection: confirmData.dataProtection,
      auditReference: confirmData.auditReference,
      deliverySnapshot: { ...shippingAddress },
    };

    setPlacedOrder(enrichedOrder);
    setIsProcessing(false);
    setCurrentStep(4);
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <Navbar categories={categories} cartCount={cartItems.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Step Indicator Header */}
        <div className="pb-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500 -z-0"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%',
              }}
            />

            {[
              { num: 1, label: 'Address & Recipient', icon: MapPin },
              { num: 2, label: 'Logistics Tier', icon: Truck },
              { num: 3, label: 'Security & Payment', icon: CreditCard },
              { num: 4, label: 'Audit & Confirmation', icon: CheckCircle2 },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <div key={step.num} className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-cyan-400 text-slate-950 shadow-neon-cyan'
                        : isActive
                        ? 'bg-slate-900 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                        : 'bg-slate-900 border border-white/10 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-mono hidden sm:inline ${
                      isActive ? 'text-white font-bold' : isPassed ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {errorNotice && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Security Notice: </span>
              {errorNotice}
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-xs text-rose-400 hover:text-white underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Checkout Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Active Step (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* STEP 1: Address Book & Recipient */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div>
                      <h2 className="text-xl font-bold text-white">Shipping Address & Recipient</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Select a saved address or enter custom coordinates for multi-vendor lab dispatch.
                      </p>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-white/10 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setAddressTab('SAVED')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          addressTab === 'SAVED'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Saved Book
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressTab('MANUAL')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          addressTab === 'MANUAL'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Guest Entry
                      </button>
                    </div>
                  </div>

                  {addressTab === 'SAVED' ? (
                    <div className="space-y-6">
                      <AddressBookManager
                        selectedAddressId={selectedSavedId}
                        onSelectAddress={handleSelectSavedAddress}
                        allowSelection={true}
                      />

                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Delivering to: <strong className="text-white">{addressForm.fullName}</strong> ({addressForm.city})</span>
                        </div>
                        <Button onClick={() => handleNextToShipping()} variant="primary" size="md">
                          <span>Continue to Logistics Tier</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleNextToShipping} className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">State / Province</label>
                          <input
                            type="text"
                            required
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Postal Code (Pincode)</label>
                          <input
                            type="text"
                            required
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Country</label>
                          <input
                            type="text"
                            required
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Contact Telemetry (Phone)</label>
                        <input
                          type="text"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button type="submit" variant="primary" size="md">
                          <span>Continue to Logistics Tier</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* STEP 2: Shipping Tier */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl"
                >
                  <div className="pb-4 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Select Logistics & Dispatch Tier</h2>
                    <p className="text-xs text-slate-400 mt-1">Multi-vendor fulfillment network with end-to-end GPS telemetry.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        tier: 'standard' as ShippingTier,
                        name: 'Standard Quantum Freight',
                        desc: 'Climate-controlled insured ground/air freight across global nodes.',
                        price: subtotal >= 1000 ? 0 : 25,
                        time: '3–5 Business Days',
                        icon: Truck,
                      },
                      {
                        tier: 'express' as ShippingTier,
                        name: 'Hyper-Suborbital Air Transit',
                        desc: 'Priority suborbital routing with expedited customs clearance.',
                        price: 65,
                        time: '1–2 Business Days',
                        icon: Sparkles,
                      },
                      {
                        tier: 'drone' as ShippingTier,
                        name: 'Autonomous Drone Teleport',
                        desc: 'Last-mile automated quadcopter delivery from local micro-fulfillment hubs.',
                        price: 120,
                        time: 'Within 4 Hours (Metropolitan)',
                        icon: Zap,
                      },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = shippingTier === opt.tier;
                      return (
                        <div
                          key={opt.tier}
                          onClick={() => setShippingTier(opt.tier)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-400 shadow-neon-cyan'
                              : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{opt.name}</h4>
                                {opt.price === 0 && (
                                  <Badge variant="emerald" size="sm">FREE</Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{opt.time}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-bold font-mono text-white">
                              {opt.price === 0 ? 'FREE' : formatPrice(opt.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Destination
                    </button>
                    <Button onClick={() => setCurrentStep(3)} variant="primary" size="md">
                      <span>Continue to Security & Payment</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Security & Payment Engine */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl"
                >
                  <div className="pb-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Bank-Grade Payment Protocol</h2>
                      <p className="text-xs text-slate-400 mt-1">PCI-DSS SAQ-A compliant tokenization with zero server card storage.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>AES-256 Escrow Vault</span>
                    </div>
                  </div>

                  {/* Saved Payment Methods Quick Selector */}
                  {savedPaymentMethods.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Saved Tokenized Payment Methods</span>
                        <span className="text-[11px] text-cyan-400 font-mono">PCI-DSS Token Vault</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {savedPaymentMethods.map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => {
                              if (pm.type === 'CARD') {
                                setPaymentProvider('STRIPE');
                                setCardNumber(`•••• •••• •••• ${pm.last4}`);
                                setCardExpiry(`${pm.expMonth?.toString().padStart(2, '0')}/${pm.expYear?.toString().slice(-2)}`);
                              } else {
                                setPaymentProvider('RAZORPAY');
                                if (pm.upiId) setUpiId(pm.upiId);
                              }
                            }}
                            className="p-3 rounded-xl border border-white/10 bg-slate-800/40 hover:border-cyan-400/50 text-left text-xs transition-colors flex items-center gap-3"
                          >
                            <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white truncate">
                                {pm.type === 'CARD' ? `${pm.brand || 'Card'} •••• ${pm.last4}` : pm.upiId}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {pm.isDefault ? 'Default Method' : 'Saved'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Provider Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'RAZORPAY' as const, label: 'Razorpay UPI / Card', icon: QrCode },
                      { id: 'COD' as const, label: 'Cash on Delivery', icon: Truck },
                      { id: 'STRIPE' as const, label: 'Stripe Card (3DS)', icon: CreditCard },
                      { id: 'CRYPTO' as const, label: 'Web3 Escrow', icon: Coins },
                      { id: 'WALLET' as const, label: 'UC Wallet', icon: Wallet },
                    ].map((p) => {
                      const Icon = p.icon;
                      const isSelected = paymentProvider === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaymentProvider(p.id)}
                          className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan'
                              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Provider 1: Stripe Card Simulator */}
                  {paymentProvider === 'STRIPE' && (
                    <div className="space-y-6 pt-2">
                      <div className="perspective-1000">
                        <motion.div
                          animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6 }}
                          style={{ transformStyle: 'preserve-3d' }}
                          className="w-full max-w-sm mx-auto h-48 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-700 to-purple-800 p-6 text-white shadow-2xl relative select-none"
                        >
                          {!isCardFlipped ? (
                            <div className="h-full flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono tracking-widest text-cyan-200">
                                  UNIFIED ESCROW CHIP
                                </span>
                                <Sparkles className="w-5 h-5 text-amber-300" />
                              </div>
                              <div className="font-mono text-lg tracking-wider text-white">
                                {cardNumber}
                              </div>
                              <div className="flex items-end justify-between text-xs">
                                <div>
                                  <div className="text-[10px] text-cyan-200 uppercase font-mono">Cardholder</div>
                                  <div className="font-bold tracking-wide">{cardHolder}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-cyan-200 uppercase font-mono">Expires</div>
                                  <div className="font-mono">{cardExpiry}</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{ transform: 'rotateY(180deg)' }}
                              className="h-full flex flex-col justify-between"
                            >
                              <div className="h-8 bg-black -mx-6 mt-2" />
                              <div className="bg-slate-900/80 p-2 rounded text-right font-mono text-xs">
                                CVC: <strong className="text-cyan-300">{cardCvc}</strong>
                              </div>
                              <div className="text-[9px] text-slate-300 text-center">
                                Strong Customer Authentication (SCA / 3DS 2.2) Required
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-slate-400 block mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Expires (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1 flex items-center justify-between">
                            <span>Security Code (CVC)</span>
                            <button
                              type="button"
                              onClick={() => setIsCardFlipped(!isCardFlipped)}
                              className="text-[10px] text-cyan-400 hover:underline"
                            >
                              {isCardFlipped ? 'Show Front' : 'Show CVC'}
                            </button>
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Provider 2: Razorpay UPI */}
                  {paymentProvider === 'RAZORPAY' && (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-4">
                      <div className="w-36 h-36 mx-auto rounded-xl bg-white p-3 shadow-xl flex items-center justify-center">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v4h-4v-4zm2-2h2v2h-2v-2z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white">Scan with PhonePe, Google Pay, or Paytm</div>
                        <div className="text-[11px] text-slate-400">Total payable: <strong className="text-cyan-300 font-mono">{formatPrice(total)}</strong></div>
                      </div>
                      <div className="max-w-xs mx-auto">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="operator@okhdfcbank"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-center text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Provider 3: Web3 Crypto Escrow */}
                  {paymentProvider === 'CRYPTO' && (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Select Network / Token:</span>
                        <div className="flex gap-1.5 font-mono">
                          {(['USDC', 'SOL', 'ETH'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setCryptoToken(t)}
                              className={`px-2.5 py-1 rounded-lg border text-xs ${
                                cryptoToken === t
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                                  : 'border-white/10 text-slate-400'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Escrow Contract:</span>
                          <span className="text-cyan-300">0x71c...8942</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Gas Telemetry:</span>
                          <span className="text-emerald-400">&lt; $0.002 (Solana Turbo)</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Smart Lock Condition:</span>
                          <span>Release on Carrier Delivery Sign</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Provider 4: UC Store Credits */}
                  {paymentProvider === 'WALLET' && (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Available Platform Credits:</span>
                        <span className="text-xl font-bold font-mono text-cyan-300">$5,000.00</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Instant deduction with zero payment processing latency. Balance after transaction: {formatPrice(5000 - total)}.
                      </p>
                    </div>
                  )}

                  {/* Provider 5: Cash on Delivery (COD) */}
                  {paymentProvider === 'COD' && (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
                          <p className="text-xs text-slate-400">Pay with cash or UPI at your doorstep upon package arrival.</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Payable upon Delivery:</span>
                          <strong className="text-emerald-400 font-mono text-sm">{formatPrice(total)}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Exact cash or UPI scan is accepted by the courier delivery agent. Zero upfront card commitment required.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Honest Trust Badges & Indicators */}
                  <div className="pt-2 border-t border-white/10">
                    <TrustBadges />
                    <CheckoutTrustNote />
                  </div>

                  {/* Mandatory Store Policy Acceptance */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="policy-consent-checkbox"
                        checked={policyAccepted}
                        onChange={(e) => {
                          setPolicyAccepted(e.target.checked);
                          if (e.target.checked) setPolicyError(false);
                        }}
                        className="mt-1 w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-400 bg-slate-800"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I agree to the store's{' '}
                        <a href="/terms" target="_blank" className="text-cyan-400 underline">Terms of Service</a>,{' '}
                        <a href="/privacy" target="_blank" className="text-cyan-400 underline">Privacy Policy</a>, and{' '}
                        <a href="/returns" target="_blank" className="text-cyan-400 underline">Return & Refund Policy</a>.
                        I understand prices are inclusive of taxes and delivery is calculated transparently before purchase.
                      </span>
                    </label>
                    {policyError && (
                      <p className="text-[11px] text-rose-400 font-semibold pl-7">
                        ⚠️ You must review and agree to the store policies before placing an order.
                      </p>
                    )}
                  </div>

                  {/* Security Notice Footer */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Idempotent order token generated. Server recalculates all catalog items to prevent client tampering.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Logistics
                    </button>

                    <Button
                      onClick={handlePlaceOrder}
                      isLoading={isProcessing}
                      variant="primary"
                      size="lg"
                    >
                      <span>
                        {isProcessing
                          ? processingStatusText
                          : `Authorize & Place Order (${formatPrice(total)})`}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Confirmation & Security Certificate */}
              {currentStep === 4 && placedOrder && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-3xl bg-slate-950/80 border border-cyan-400/40 backdrop-blur-2xl space-y-6 shadow-2xl text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center mx-auto shadow-neon-cyan">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <Badge variant="cyan" size="sm" withDot>TRANSACTION CONFIRMED & AUDITED</Badge>
                    <h2 className="text-3xl font-extrabold text-white mt-2">
                      Order Successfully Dispatched!
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-vendor allocation verified. Escrow locked in secure vault.
                    </p>
                  </div>

                  {/* Order Specs */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-white/5 space-y-2 text-xs font-mono max-w-md mx-auto text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Number:</span>
                      <strong className="text-cyan-300 font-bold">{placedOrder.orderNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tracking Code:</span>
                      <span className="text-white">{placedOrder.tracking?.trackingCode || 'TRK-UC-8942-GLOBAL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Delivery:</span>
                      <span className="text-emerald-400 font-semibold">{placedOrder.tracking?.estimatedDelivery || 'Tomorrow'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Rail:</span>
                      <span className="text-purple-400">{placedOrder.paymentMethod} (CAPTURED)</span>
                    </div>
                  </div>

                  {/* Delivery Address Snapshot */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-left max-w-md mx-auto text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono pb-1 border-b border-white/5">
                      <span>VERIFIED DELIVERY SNAPSHOT</span>
                      <span className="text-emerald-400">IMMUTABLE</span>
                    </div>
                    <div className="text-white font-bold">{shippingAddress.fullName}</div>
                    <div className="text-slate-300">{shippingAddress.street}</div>
                    <div className="text-slate-400">
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                    </div>
                    {shippingAddress.phone && (
                      <div className="text-slate-500 font-mono text-[11px]">Phone: {shippingAddress.phone}</div>
                    )}
                  </div>

                  {/* Bank-Grade Encryption Certificate Badge */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left max-w-md mx-auto text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>AES-256-GCM Cryptographic Storage Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      PII fields (street address & phone number) were securely encrypted at rest using Galois/Counter Mode authenticated cipher with 128-bit authentication tag before database insertion.
                    </p>
                    {placedOrder.dataProtection?.cipherTokens && (
                      <div className="p-2 rounded-lg bg-black/40 font-mono text-[10px] text-emerald-300 space-y-0.5">
                        <div>Cipher token (addr): {placedOrder.dataProtection.cipherTokens.streetToken}</div>
                        <div>Cipher token (phone): {placedOrder.dataProtection.cipherTokens.phoneToken}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a href={`/orders/${placedOrder.id}`}>
                      <Button variant="primary" size="md">
                        <span>Track Live Telemetry</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </a>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>Print GST Invoice</span>
                    </button>
                    <a href="/products">
                      <Button variant="outline" size="md">
                        Return to Catalog
                      </Button>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Summary Receipt (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-28">
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white tracking-tight">Order Manifest</h3>
                <span className="text-xs font-mono text-cyan-400">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>

              {/* VIP Membership Banner */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-300">VIP {membershipTier} Protocol</div>
                    <div className="text-[10px] text-slate-400">
                      {membershipTier === 'PLATINUM' ? '10% off + Free Drone Logistics' :
                       membershipTier === 'GOLD' ? '5% off + Free Express Logistics' :
                       membershipTier === 'SILVER' ? '2% off all orders' : 'Standard Member'}
                    </div>
                  </div>
                </div>
                <Badge variant="amber">{vipDiscountPercent}% OFF</Badge>
              </div>

              {/* Items Preview */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{item.product.name}</h4>
                      <div className="text-[11px] text-slate-400">
                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPrice(subtotal)}</span>
                </div>

                {vipDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <span>VIP {membershipTier} Discount ({vipDiscountPercent}%)</span>
                    <span className="font-mono">-{formatPrice(vipDiscountAmount)}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-purple-400 font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {/* Gift Card Display / Entry */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  {appliedGiftCard ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Gift Card ({appliedGiftCard.code})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-300 font-bold">-{formatPrice(giftCardDiscountAmount)}</span>
                        <button
                          type="button"
                          onClick={removeGiftCard}
                          className="text-[10px] text-red-400 hover:text-red-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Gift Card (GIFT-250)"
                        value={giftCardInput}
                        onChange={(e) => setGiftCardInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!giftCardInput.trim()) return;
                          const res = applyGiftCard(giftCardInput);
                          setGiftCardMessage({ text: res.message, error: !res.success });
                          if (res.success) setGiftCardInput('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {giftCardMessage && (
                    <p className={`text-[10px] ${giftCardMessage.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {giftCardMessage.text}
                    </p>
                  )}
                </div>

                {/* Store Credit Toggle */}
                <div className="pt-2 pb-1 border-t border-white/5 space-y-1">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useStoreCredit}
                        onChange={(e) => setUseStoreCredit(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-slate-300 group-hover:text-white">Apply Store Credit</span>
                    </div>
                    <span className="font-mono text-cyan-400 text-[11px]">{formatPrice(storeCreditBalance)} available</span>
                  </label>
                  {storeCreditApplied > 0 && (
                    <div className="flex items-center justify-between text-cyan-400 pl-5">
                      <span>Store Credit Applied</span>
                      <span className="font-mono font-bold">-{formatPrice(storeCreditApplied)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Logistics ({shippingTier.toUpperCase()})</span>
                  <span className="font-mono text-emerald-400">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Sales Tax (6.5%)</span>
                  <span className="font-mono text-white">{formatPrice(taxAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Smart Contract Escrow</span>
                  <span className="font-mono text-cyan-400">Included ($0.00)</span>
                </div>

                <div className="flex items-center justify-between text-base font-extrabold text-white pt-3 border-t border-white/10">
                  <span>Total Due</span>
                  <span className="font-mono text-cyan-300 text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PCI-DSS SAQ-A Certified Processing Rail</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Zero frontend price trust • Server recalculation enforced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 3D Secure 2.2 / Strong Customer Authentication (SCA) Challenge Modal */}
      <AnimatePresence>
        {show3DSModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!threeDsVerifying) setShow3DSModal(false);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-400/40 p-6 z-10 space-y-5 shadow-2xl"
            >
              {/* Bank Simulation Brand Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    3DS
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">UNIFIED SAFEPAY 3D SECURE</h3>
                    <p className="text-[10px] text-slate-400">Strong Customer Authentication (SCA / 2FA)</p>
                  </div>
                </div>
                <Badge variant="cyan" size="sm">VISA / MASTERCARD</Badge>
              </div>

              {/* Transaction Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant:</span>
                  <span className="text-white">UnifiedCommerce Escrow Node</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transaction Amount:</span>
                  <span className="text-cyan-300 font-bold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Card Number:</span>
                  <span className="text-slate-300">•••• •••• •••• 4242</span>
                </div>
              </div>

              {/* Prompt & OTP Field */}
              <form onSubmit={handleVerify3DS} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    One-Time Password (OTP) Verification
                  </label>
                  <p className="text-[11px] text-slate-400">
                    A 6-digit confirmation code was sent to registered device ending in <strong>•••210</strong>.
                  </p>
                </div>

                {threeDsError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{threeDsError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={threeDsOtp}
                      onChange={(e) => setThreeDsOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP (e.g. 771928)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Quick Test Autofill Code */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">Demo Step-Up PIN:</span>
                    <button
                      type="button"
                      onClick={() => setThreeDsOtp('771928')}
                      className="text-cyan-400 hover:underline font-mono"
                    >
                      Autofill Code (771928)
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={threeDsVerifying}
                    onClick={() => setShow3DSModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Abort
                  </button>
                  <Button
                    type="submit"
                    isLoading={threeDsVerifying}
                    variant="primary"
                    size="md"
                  >
                    <span>Verify & Authorize</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
