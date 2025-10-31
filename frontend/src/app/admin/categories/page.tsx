'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Category { _id: string; name: string; contentType: 'movie' | 'series'; }

export default function AdminCategories() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', contentType: 'movie' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) { router.push('/'); return; }
    if (user?.role === 'admin') { load(); }
  }, [user, loading, router]);

  const load = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    setCategories(json.data || []);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', contentType: 'movie' });
        await load();
      }
    } finally { setSaving(false); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Manage Categories</h1>

          <form onSubmit={submit} className="bg-netflix-dark-gray rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-netflix-text-gray mb-2">Name</label>
              <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white" required />
            </div>
            <div>
              <label className="block text-sm text-netflix-text-gray mb-2">Content Type</label>
              <select value={form.contentType} onChange={(e)=>setForm({...form,contentType:e.target.value as any})} className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white">
                <option value="movie">Movie</option>
                <option value="series">TV Show</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button disabled={saving} className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red-dark">{saving ? 'Saving...' : 'Add Category'}</button>
            </div>
          </form>

          <div className="bg-netflix-dark-gray rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-netflix-gray">
              <thead className="bg-netflix-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-netflix-gray">
                {categories.map(c => (
                  <tr key={c._id} className="hover:bg-netflix-gray">
                    <td className="px-6 py-4 text-white">{c.name}</td>
                    <td className="px-6 py-4 text-netflix-text-gray capitalize">{c.contentType}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={async()=>{const token=localStorage.getItem('auth_token'); await fetch(`/api/admin/categories/${c._id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); load();}} className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


