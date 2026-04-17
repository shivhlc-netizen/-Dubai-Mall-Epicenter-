'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, X, Check, ShieldCheck, User, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface DBUser {
  id: number; name: string; email: string; role: 'admin' | 'user';
  active: number; last_login: string | null; created_at: string;
}

const emptyForm = { name: '', email: '', password: '', role: 'user' as const };

export default function UsersAdmin() {
  const [users, setUsers]     = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DBUser | null>(null);
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setUsers(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleActive(user: DBUser) {
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: user.active === 0 }),
    });
    fetchUsers();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true); setError('');
    const body: Record<string, unknown> = { name: editing.name, email: editing.email, role: editing.role };
    if ((form as any).password) body.password = (form as any).password;
    const r = await fetch(`/api/users/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) { setError(data.error || 'Update failed'); return; }
    setEditing(null);
    fetchUsers();
  }

  async function createUser() {
    setSaving(true); setError('');
    const r = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) { setError(data.error || 'Create failed'); return; }
    setAdding(false);
    setForm(emptyForm);
    fetchUsers();
  }

  async function deleteUser(id: number) {
    if (!confirm('Permanently delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  }

  async function resetSecurity(userId: number) {
    if (!confirm('Reset failed attempts and unlock this user?')) return;
    const r = await fetch(`/api/admin/users/${userId}/reset-security`, { method: 'POST' });
    if (r.ok) {
      alert('Security counter reset successfully.');
      fetchUsers();
    } else {
      const data = await r.json();
      alert(data.error || 'Reset failed');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">User Management</h1>
          <p className="text-white/30 text-sm font-sans">{users.length} users registered</p>
        </div>
        <button onClick={() => { setAdding(true); setError(''); }} className="btn-gold flex items-center gap-2">
          <Plus size={14} /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 py-10">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="glass-card rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-white/30 font-sans">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gold/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white text-sm font-sans">{u.name}</td>
                  <td className="px-4 py-3 text-white/50 text-sm font-sans">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1 text-[9px] tracking-wider uppercase px-2 py-1 border font-sans',
                      u.role === 'admin'
                        ? 'text-gold border-gold/30 bg-gold/10'
                        : 'text-white/40 border-white/10 bg-white/5'
                    )}>
                      {u.role === 'admin' ? <ShieldCheck size={9} /> : <User size={9} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'text-[9px] uppercase tracking-wider px-2 py-1',
                      u.active ? 'text-green-400 bg-green-950/40' : 'text-red-400 bg-red-950/30'
                    )}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs font-sans">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(u); setForm({ ...emptyForm }); setError(''); }}
                        className="text-white/30 hover:text-gold transition-colors p-1"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        className={clsx('text-xs px-2 py-0.5 border transition-colors',
                          u.active
                            ? 'text-red-400/60 border-red-900/40 hover:text-red-400'
                            : 'text-green-400/60 border-green-900/40 hover:text-green-400'
                        )}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => resetSecurity(u.id)}
                        title="Reset failed attempts / Unlock"
                        className="text-amber-500/40 hover:text-amber-500 transition-colors p-1"
                      >
                        <RotateCcw size={13} />
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-500/40 hover:text-red-500 transition-colors p-1"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-gold/20 rounded-sm w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl text-white">{adding ? 'Add User' : 'Edit User'}</h3>
              <button onClick={() => { setAdding(false); setEditing(null); }} className="text-white/30 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs px-3 py-2 mb-4">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <div className="space-y-4">
              {(['name', 'email'] as const).map(field => (
                <div key={field}>
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={editing ? (editing[field] as string) : form[field]}
                    onChange={e => editing
                      ? setEditing({ ...editing, [field]: e.target.value })
                      : setForm({ ...form, [field]: e.target.value })
                    }
                    className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1">
                  Password {editing && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40"
                  placeholder={editing ? '••••••••' : 'Min 8 chars, 1 upper, 1 number, 1 special'}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1">Role</label>
                <select
                  value={editing ? editing.role : form.role}
                  onChange={e => {
                    const v = e.target.value as 'admin' | 'user';
                    editing ? setEditing({ ...editing, role: v }) : setForm({ ...form, role: v as any });
                  }}
                  className="w-full bg-[#0A0A0A] border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editing ? saveEdit : createUser}
                disabled={saving}
                className="btn-gold flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {editing ? 'Save Changes' : 'Create User'}
              </button>
              <button onClick={() => { setAdding(false); setEditing(null); }} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
