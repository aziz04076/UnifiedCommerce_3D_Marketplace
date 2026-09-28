import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard — My Shop' };

const STATS = [
  { label: 'Aaj Ki Bikri', labelEn: "Today's Sales", value: '₹0', icon: '💰', color: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'Pending Orders', labelEn: 'Pending Orders', value: '0', icon: '📦', color: 'bg-amber-500/20 text-amber-400' },
  { label: 'Kam Stock', labelEn: 'Low Stock Items', value: '0', icon: '⚠️', color: 'bg-rose-500/20 text-rose-400' },
  { label: 'Kul Bikri', labelEn: 'Total Sales (Month)', value: '₹0', icon: '📈', color: 'bg-blue-500/20 text-blue-400' },
];

const QUICK_ACTIONS = [
  { href: '/shop-admin/orders', label: 'Orders देखें', sublabel: 'View Orders', icon: '📋', urgent: true },
  { href: '/shop-admin/products/add', label: 'Product जोड़ें', sublabel: 'Add Product', icon: '➕', urgent: false },
  { href: '/shop-admin/products', label: 'Products', sublabel: 'Manage Products', icon: '🛍️', urgent: false },
  { href: '/shop-admin/setup-wizard', label: 'Setup', sublabel: 'Store Settings', icon: '⚙️', urgent: false },
];

export default function ShopAdminPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🏪 My Shop</h1>
            <p className="text-slate-400 text-sm">Admin Panel</p>
          </div>
          <a href="/" className="text-slate-400 text-sm cursor-pointer">Live Store →</a>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 border border-slate-700 bg-slate-800/60`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.labelEn}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`rounded-xl p-4 border text-center block cursor-pointer ${
                  action.urgent
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-800/60'
                }`}
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-slate-400 text-xs">{action.sublabel}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
          <div className="font-semibold text-blue-300 mb-1">❓ Madad chahiye? / Need help?</div>
          <p className="text-sm text-slate-400 mb-3">Koi problem ho to developer se contact karein.</p>
          <a
            href="https://wa.me/919999999999?text=Admin+panel+mein+help+chahiye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            💬 Developer se baat karein
          </a>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex">
          {[
            { href: '/shop-admin', icon: '🏠', label: 'Home' },
            { href: '/shop-admin/orders', icon: '📦', label: 'Orders' },
            { href: '/shop-admin/products', icon: '🛍️', label: 'Products' },
            { href: '/shop-admin/staff', icon: '👥', label: 'Staff' },
          ].map((nav) => (
            <a key={nav.href} href={nav.href} className="flex-1 py-3 flex flex-col items-center cursor-pointer">
              <span className="text-xl">{nav.icon}</span>
              <span className="text-xs text-slate-400 mt-1">{nav.label}</span>
            </a>
          ))}
        </nav>
        <div className="h-20" /> {/* spacer for fixed nav */}
      </div>
    </main>
  );
}
