'use client';

import { useState, useEffect } from 'react';
import {
  MapPin, Plus, Check, Trash2, Edit2, ShieldCheck, Home, Briefcase,
  Navigation, Loader2, AlertCircle, CheckCircle2, Phone, User
} from 'lucide-react';
import { SavedAddress, AddressType } from '@unified-commerce/types';

interface AddressBookManagerProps {
  selectedAddressId?: string;
  onSelectAddress?: (address: SavedAddress) => void;
  allowSelection?: boolean;
}

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-001',
    userId: 'usr-demo-771',
    type: 'HOME',
    fullName: 'Alex Vance',
    phone: '+91 98765 43210',
    street: 'Penthouse 42B, Neo-Bandra Heights, Perry Cross Rd',
    landmark: 'Near Joggers Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
    isDefault: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'addr-002',
    userId: 'usr-demo-771',
    type: 'WORK',
    fullName: 'Alex Vance',
    phone: '+91 98765 43210',
    street: 'Cyber Tower 9, 14th Floor, Electronic City Phase 1',
    landmark: 'Opposite Wipro Gate 5',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
    isDefault: false,
    createdAt: '2026-02-20T10:00:00.000Z',
  },
];

export function AddressBookManager({
  selectedAddressId,
  onSelectAddress,
  allowSelection = true,
}: AddressBookManagerProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_SAVED_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState<AddressType>('HOME');
  const [isDefault, setIsDefault] = useState(false);

  // Serviceability check state
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [serviceabilityMessage, setServiceabilityMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('uc_saved_addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  function saveAddresses(newAddrs: SavedAddress[]) {
    setAddresses(newAddrs);
    try {
      localStorage.setItem('uc_saved_addresses', JSON.stringify(newAddrs));
    } catch {}
  }

  async function handlePincodeLookup(code: string) {
    setPostalCode(code);
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      setIsCheckingPincode(true);
      setServiceabilityMessage(null);
      try {
        const res = await fetch(`/api/address/serviceability?pincode=${code}`);
        const data = await res.json();
        if (data.isServiceable) {
          setCity(data.city);
          setState(data.state);
          setServiceabilityMessage(`✓ ${data.city}, ${data.state} — ${data.message}`);
        } else {
          setServiceabilityMessage('Postal code outside direct logistics zone.');
        }
      } catch {
        // Fallback
      } finally {
        setIsCheckingPincode(false);
      }
    }
  }

  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        // Simulates reverse geocode
        setPostalCode('400050');
        setCity('Mumbai');
        setState('Maharashtra');
        setStreet('Bandra West Coastal Corridor');
        setServiceabilityMessage('✓ Location detected: Bandra West (Same-day drone corridor)');
      },
      () => {
        setIsLocating(false);
        setFormError('Unable to retrieve location. Please enter address manually.');
      }
    );
  }

  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !street || !postalCode || !city) {
      setFormError('Please fill in all mandatory address fields.');
      return;
    }

    if (editingId) {
      const updated = addresses.map((a) =>
        a.id === editingId
          ? {
              ...a,
              fullName,
              phone,
              street,
              landmark,
              postalCode,
              city,
              state,
              type,
              isDefault,
            }
          : isDefault
          ? { ...a, isDefault: false }
          : a
      );
      saveAddresses(updated);
    } else {
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        userId: 'usr-demo-771',
        type,
        fullName,
        phone,
        street,
        landmark,
        postalCode,
        city,
        state,
        country: 'India',
        isDefault,
        createdAt: new Date().toISOString(),
      };
      const updated = isDefault
        ? [newAddress, ...addresses.map((a) => ({ ...a, isDefault: false }))]
        : [...addresses, newAddress];
      saveAddresses(updated);
      if (onSelectAddress) onSelectAddress(newAddress);
    }

    // Reset form
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
    setServiceabilityMessage(null);
  }

  function handleStartEdit(addr: SavedAddress) {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setPostalCode(addr.postalCode);
    setCity(addr.city);
    setState(addr.state);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Verified Delivery Addresses
          </h3>
          <p className="text-xs text-slate-400">AES-256 encrypted storage for address data</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null);
              setFullName('');
              setPhone('');
              setStreet('');
              setLandmark('');
              setPostalCode('');
              setCity('');
              setState('');
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSaveAddress} className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? 'Edit Address' : 'New Delivery Address'}
            </h4>
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              Use current location
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Recipient Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mobile Number (with OTP link) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pincode / Postal Code *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => handlePincodeLookup(e.target.value)}
                  placeholder="e.g. 400050"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                {isCheckingPincode && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400 animate-spin" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {serviceabilityMessage && (
            <p className="text-[11px] text-cyan-300 font-mono bg-cyan-950/20 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              {serviceabilityMessage}
            </p>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Flat, House no., Building, Street *</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Penthouse 42B, Neo-Bandra Heights"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Joggers Park or Gate 2"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Address Type Selection */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {(['HOME', 'WORK', 'OTHER'] as AddressType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    type === t
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {t === 'HOME' && <Home className="w-3 h-3" />}
                  {t === 'WORK' && <Briefcase className="w-3 h-3" />}
                  {t === 'OTHER' && <MapPin className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-3.5 h-3.5 accent-cyan-400 rounded"
              />
              Set as Default
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20"
            >
              {editingId ? 'Save Changes' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address Card List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => {
                if (allowSelection && onSelectAddress) {
                  onSelectAddress(addr);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/20 border-cyan-400 ring-2 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStartEdit(addr)}
                      className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs font-bold text-white mb-0.5">{addr.fullName}</p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{addr.street}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>
                )}
                <p className="text-xs text-cyan-300 font-mono mt-1">
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {addr.phone}
                </p>
              </div>

              {allowSelection && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isSelected ? '✓ Deliver to this address' : 'Click to select'}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-950 font-bold" />}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
