'use client';
import { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'orders_only' | 'products_only' | 'owner';
  addedOn: string;
}

const ROLES = [
  { value: 'orders_only',   label: 'Orders Only',   desc: 'Can view and update orders only' },
  { value: 'products_only', label: 'Products Only',  desc: 'Can add/edit products only' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'Ravi Kumar', email: 'ravi@myshop.com', role: 'orders_only', addedOn: '2026-09-01' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'orders_only' | 'products_only'>('orders_only');

  function addStaff() {
    if (!newName || !newEmail) { alert('Name and email required'); return; }
    setStaff((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName, email: newEmail, role: newRole, addedOn: new Date().toISOString().slice(0, 10) },
    ]);
    setNewName(''); setNewEmail(''); setShowAdd(false);
  }

  function removeStaff(id: string) {
    if (!confirm('Are you sure? / Pakka hatana hai?')) return;
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <a href="/shop-admin" className="text-slate-400 text-sm">← Back</a>
            <h1 className="text-xl font-bold mt-1">👥 Staff Accounts</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add Staff
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        <p className="text-slate-400 text-sm">Staff apne role ke bahar kuch nahi kar sakte.</p>

        {staff.map((s) => (
          <div key={s.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-slate-400">{s.email}</div>
                <div className="text-xs text-blue-400 mt-1">
                  {ROLES.find((r) => r.value === s.role)?.label ?? s.role}
                </div>
              </div>
              {s.role !== 'owner' && (
                <button
                  onClick={() => removeStaff(s.id)}
                  className="text-rose-400 text-sm cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {showAdd && (
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">New Staff Member</h3>
            <input
              type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
            />
            <input
              type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'orders_only' | 'products_only')}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={addStaff} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm cursor-pointer">Add</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-700 text-slate-200 py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
