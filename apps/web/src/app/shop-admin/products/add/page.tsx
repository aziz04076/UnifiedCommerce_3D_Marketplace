'use client';
import { useState, useRef } from 'react';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function generateDescription() {
    if (!name) { alert('Pehle product ka naam likhein / First enter product name'); return; }
    setAiLoading(true);
    // Placeholder — connect to /api/ai/describe in production
    await new Promise((r) => setTimeout(r, 1200));
    setDescription(`${name} — high quality product. Perfect for everyday use. Available in multiple variants.`);
    setAiLoading(false);
  }

  function handleSave() {
    if (!name || !price) { alert('Naam aur price zaroori hain / Name and price are required'); return; }
    // TODO: POST to /api/products
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <a href="/shop-admin/products" className="text-slate-400 text-sm">← Back</a>
          <h1 className="text-xl font-bold mt-1">➕ New Product jodein</h1>
          <p className="text-slate-400 text-sm">60 seconds mein ready / Ready in 60 seconds</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
        {/* Photo capture */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer"
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm text-slate-400">Photo click karein / Tap to add photo</div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImage}
        />

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product ka Naam *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue Cotton Kurta"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-base"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 499"
            min="0"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-base"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-base"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-base"
          >
            <option value="">Select category</option>
            {['Clothing', 'Food', 'Electronics', 'Books', 'Gifts', 'Stationery', 'Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description + AI */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Description</label>
            <button
              onClick={generateDescription}
              disabled={aiLoading}
              className="text-xs bg-purple-600/20 text-purple-300 border border-purple-600/30 px-3 py-1 rounded cursor-pointer disabled:opacity-60"
            >
              {aiLoading ? '✨ Writing...' : '✨ AI se likhwao'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Product ke baare mein likhein..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg cursor-pointer"
        >
          {saved ? '✅ Product Save ho gaya!' : 'Save Product'}
        </button>

        <p className="text-center text-xs text-slate-500">
          * Required fields / Zaroori hai
        </p>
      </div>
    </main>
  );
}
