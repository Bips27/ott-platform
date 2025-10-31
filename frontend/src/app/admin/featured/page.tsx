'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Category { _id: string; name: string; contentType: 'movie' | 'series'; }
interface Section { _id: string; name: string; contentType: 'movie' | 'series'; category: Category; order: number; }

export default function AdminFeaturedSections() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState({ name: '', contentType: 'movie', categoryId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    const token = localStorage.getItem('auth_token');
    const [catsRes, secRes] = await Promise.all([
      fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/featured-sections', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const catsJson = await catsRes.json();
    const secJson = await secRes.json();
    setCategories(catsJson.data || []);
    setSections(secJson.data || []);
    if (!form.categoryId && catsJson.data?.length) {
      setForm(prev => ({ ...prev, categoryId: catsJson.data[0]._id }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', form); // Debug log
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        ...form,
        categoryId: form.categoryId || null
      };
      console.log('Payload:', payload); // Debug log
      
      const res = await fetch('/api/admin/featured-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      console.log('Response:', result); // Debug log
      
      if (res.ok) {
        await loadData();
        setForm({ name: '', contentType: 'movie', categoryId: categories[0]?._id || '' });
      } else {
        console.error('Error creating section:', result);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Featured Sections</h1>

          <form onSubmit={submit} className="bg-netflix-dark-gray rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-netflix-text-gray mb-2">Section Name</label>
              <input 
                type="text"
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})} 
                className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red" 
                placeholder="Enter section name"
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-netflix-text-gray mb-2">Content Type</label>
              <select value={form.contentType} onChange={(e)=>setForm({...form,contentType:e.target.value as any})} className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red">
                <option value="movie">Movie</option>
                <option value="series">TV Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-netflix-text-gray mb-2">Category</label>
              <select value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})} className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red">
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.contentType})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button disabled={saving} className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red-dark">{saving ? 'Saving...' : 'Create Section'}</button>
            </div>
          </form>

          <div className="bg-netflix-dark-gray rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-netflix-gray">
              <thead className="bg-netflix-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-netflix-gray">
                {sections.map(s => (
                  <tr key={s._id} className="hover:bg-netflix-gray">
                    <td className="px-6 py-4 text-white">{s.name}</td>
                    <td className="px-6 py-4 text-netflix-text-gray capitalize">{s.contentType}</td>
                    <td className="px-6 py-4 text-netflix-text-gray">{s.category?.name}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Simple delete for now */}
                      <button onClick={async()=>{ const token=localStorage.getItem('auth_token'); await fetch(`/api/admin/featured-sections/${s._id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); loadData(); }} className="text-red-400 hover:text-red-300">Delete</button>
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


