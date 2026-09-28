import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Products — My Shop Admin' };

const DEMO_PRODUCTS = [
  { id: '1', name: 'Blue Kurta', price: 649, stock: 12, category: 'Clothing' },
  { id: '2', name: 'Cotton Saree', price: 2499, stock: 3, category: 'Clothing' },
  { id: '3', name: 'Kids T-Shirt', price: 299, stock: 0, category: 'Clothing' },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <a href="/shop-admin" className="text-slate-400 text-sm">← Back</a>
            <h1 className="text-xl font-bold mt-1">🛍️ Products</h1>
          </div>
          <a
            href="/shop-admin/products/add"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add
          </a>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        {/* Bulk import */}
        <div className="bg-slate-800/40 border border-dashed border-slate-600 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm font-medium mb-1">CSV se import karein</div>
          <div className="text-xs text-slate-400 mb-3">Bulk import from Excel/CSV</div>
          <div className="flex gap-2 justify-center">
            <a
              href="/sample-import.csv"
              className="bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded cursor-pointer"
            >
              Sample Download
            </a>
            <label className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer">
              Upload CSV
              <input type="file" accept=".csv,.xlsx" className="hidden" />
            </label>
          </div>
        </div>

        {/* Products list */}
        {DEMO_PRODUCTS.map((p) => (
          <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              👕
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-slate-400">{p.category} · ₹{p.price}</div>
              <div className={`text-xs mt-0.5 ${p.stock === 0 ? 'text-rose-400' : p.stock <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {p.stock === 0 ? 'Out of stock' : p.stock <= 3 ? `Only ${p.stock} left!` : `${p.stock} in stock`}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="text-xs bg-slate-700 text-slate-200 px-3 py-1.5 rounded cursor-pointer">Edit</button>
              {p.stock === 0 && (
                <button className="text-xs bg-amber-600/20 text-amber-400 border border-amber-600/30 px-3 py-1.5 rounded cursor-pointer">
                  Mark Back
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
