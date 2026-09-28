'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Heart,
  Menu,
  X,
  ChevronDown,
  Layers,
  Bell,
  Globe,
  SlidersHorizontal,
  Check,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { ProductCategory } from '@unified-commerce/types';
import { cn } from '../utils';

export interface NavbarProps {
  categories?: ProductCategory[];
  cartCount?: number;
  wishlistCount?: number;
  activeRole?: string;
  onRoleChange?: (role: string) => void;
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onNotificationClick?: () => void;
  unreadNotificationsCount?: number;
  currency?: string;
  onCurrencyChange?: (c: string) => void;
  language?: string;
  onLanguageChange?: (l: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories = [],
  cartCount = 0,
  wishlistCount = 0,
  activeRole = 'CUSTOMER',
  onRoleChange,
  onSearchClick,
  onCartClick,
  onWishlistClick,
  onNotificationClick,
  unreadNotificationsCount = 3,
  currency = 'USD',
  onCurrencyChange,
  language = 'EN',
  onLanguageChange,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roles = [
    { id: 'CUSTOMER', label: 'Customer View', desc: 'Shop & browse 3D catalog', href: '/' },
    { id: 'VENDOR', label: 'Vendor Portal', desc: 'Store & inventory analytics', href: '/vendor' },
    { id: 'ADMIN', label: 'Super Admin', desc: 'Platform GMV & moderation', href: '/admin' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'JA', name: '日本語' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
      <div
        className={cn(
          'max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors duration-200',
          scrolled
            ? 'bg-slate-950/95 border border-white/10 shadow-xl'
            : 'bg-slate-900/80 border border-white/5 shadow-md'
        )}
      >
        {/* Brand Logo - Stable, zero hover motion */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 p-0.5 shadow-neon-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              Unified<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Commerce</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-mono tracking-wider">
              3D AI MARKETPLACE
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-full">
          <a
            href="/"
            className="px-3 py-1 text-xs font-medium text-white hover:text-cyan-300 transition-colors"
          >
            Home
          </a>
          <a
            href="/collections"
            className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Collections
          </a>
          <a
            href="/products"
            className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Catalog Explorer
          </a>
          <a
            href="/compare"
            className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            Compare
          </a>
          <a
            href="/faq"
            className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Help Center
          </a>
          <a
            href="/vendor"
            className="px-3 py-1 text-xs font-medium text-violet-300 flex items-center gap-1 bg-violet-500/10 rounded-full border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Vendor Portal
          </a>
          <a
            href="/admin"
            className="px-3 py-1 text-xs font-medium text-amber-300 flex items-center gap-1 bg-amber-500/10 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Admin
          </a>
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onSearchClick}
            aria-label="Search catalog"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Currency Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setCurrencyDropdownOpen(!currencyDropdownOpen);
                setLanguageDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              aria-label="Select currency"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 transition-colors"
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-950 border border-white/10 shadow-2xl p-1 z-50">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 border-b border-white/5 mb-1">
                  CURRENCY
                </div>
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCurrencyChange?.(c.code);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors',
                      currency === c.code
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span>{c.code} ({c.symbol})</span>
                    {currency === c.code && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setLanguageDropdownOpen(!languageDropdownOpen);
                setCurrencyDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              aria-label="Select language"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 transition-colors"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{language}</span>
            </button>
            {languageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-950 border border-white/10 shadow-2xl p-1 z-50">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 border-b border-white/5 mb-1">
                  LANGUAGE
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange?.(l.code);
                      setLanguageDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors',
                      language === l.code
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Center Bell */}
          <button
            onClick={onNotificationClick}
            aria-label="View notifications"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setCurrencyDropdownOpen(false);
                setLanguageDropdownOpen(false);
              }}
              aria-label="Switch perspective role"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 text-xs font-medium text-purple-300 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline capitalize font-mono text-[11px]">{activeRole.toLowerCase()}</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-white/10 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-mono text-slate-400 border-b border-white/5 mb-1">
                  SWITCH PERSPECTIVE
                </div>
                {roles.map((r) => (
                  <a
                    key={r.id}
                    href={r.href}
                    onClick={() => {
                      onRoleChange?.(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors block',
                      activeRole === r.id
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-[10px] text-slate-500">{r.desc}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onWishlistClick}
            aria-label="View wishlist"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors relative"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            aria-label="View shopping cart"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-400/40 text-cyan-300 hover:border-cyan-300 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">{cartCount}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-white/10 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-slate-950 border border-white/10 shadow-2xl p-5 overflow-hidden">
          <div className="flex flex-col gap-3">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-cyan-400 py-1"
            >
              Marketplace Home
            </a>
            <a
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Catalog Explorer (1,000+ Items)
            </a>
            <a
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Product Comparison
            </a>
            <a
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Help Center & FAQs
            </a>
            <a
              href="/support/tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Support Tickets
            </a>
            <a
              href="/vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
            >
              Vendor Operations Portal
            </a>
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-amber-300 hover:text-amber-200 py-1"
            >
              Super Admin Console
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

Navbar.displayName = 'Navbar';
