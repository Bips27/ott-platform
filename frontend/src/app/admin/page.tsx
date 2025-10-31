'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { useToastContext } from '@/components/ToastProvider';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  FilmIcon,
  TvIcon
} from '@heroicons/react/24/outline';

interface Content {
  _id: string;
  title: string;
  description: string;
  category: 'movie' | 'show' | 'trailer' | 'other';
  type: 'movie' | 'series' | 'trailer';
  thumbnailUrl: string;
  trailerUrl?: string;
  videoUrl: string;
  duration?: number | string;
  rating?: string | { average: number; count: number };
  releaseDate?: string;
  createdAt?: string;
  homepageSections?: string[];
  isPublished?: boolean;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { success, error } = useToastContext();
  const [content, setContent] = useState<Content[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [featuredSections, setFeaturedSections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'categories'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created'|'title'|'type'|'status'>('created');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Debounce search for snappier UX
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all'
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const fetchContent = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchFeaturedSections = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/featured-sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeaturedSections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured sections:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchContent();
      fetchFeaturedSections();
      fetchCategories();
    }
  }, [user, loading, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('Are you sure you want to delete this content?')) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch(`/api/admin/content/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setContent(content.filter(item => item._id !== id));
          success('Content Deleted', 'Content deleted successfully');
        } else {
          const result = await res.json();
          error('Delete Failed', result.message || 'Failed to delete content');
        }
      } catch (err) {
        console.error('Delete error', err);
        error('Network Error', 'Failed to connect to server. Please try again.');
      }
    }
  };

  const bulkAction = async (action: 'draft'|'trash'|'delete'|'publish') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch('/api/admin/content/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds, action })
      });
      const result = await res.json();
      if (res.ok) {
        success('Bulk Action', 'Updated selected items');
        setSelectedIds([]);
        fetchContent();
      } else {
        error('Bulk Action Failed', result.message || 'Failed to apply action');
      }
    } catch (err) {
      console.error('Bulk action error', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleEdit = (item: Content) => {
    setEditingContent(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingContent(null);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingContent(null);
    fetchContent(); // Refresh the list
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('Are you sure you want to delete this category?')) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchCategories();
          success('Category Deleted', 'Category deleted successfully');
        } else {
          const result = await res.json();
          error('Delete Failed', result.message || 'Failed to delete category');
        }
      } catch (err) {
        console.error('Delete error', err);
        error('Network Error', 'Failed to connect to server. Please try again.');
      }
    }
  };

  const handleSaveCategory = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  // Filter and search content
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = filters.type === 'all' || item.type === filters.type;
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'published' ? item.isPublished : !item.isPublished);
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // Sorting
  const sortedContent = [...filteredContent].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return String(a.type).localeCompare(String(b.type));
      case 'status':
        return Number(b.isPublished) - Number(a.isPublished);
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedContent.length / pageSize));
  const currentPageItems = sortedContent.slice((page - 1) * pageSize, page * pageSize);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show loading UI while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="text-netflix-text-gray text-sm">Please wait…</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect handled by the top-level effect; render nothing here
    return null;
  }

  return (
    <div className="min-h-screen bg-netflix-black -mt-16">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 pt-4 pb-6 md:pb-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
              <p className="text-netflix-text-gray">Manage your content library and categories</p>
            </div>
            {activeTab === 'library' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  className="bg-netflix-red hover:bg-netflix-red-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Content</span>
                </button>
                {/* Download sample CSV */}
                <a
                  href="data:text/csv;charset=utf-8,"
                  id="sampleCsvLinkTop"
                  download="content-sample.csv"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    const headers = [
                      'title','description','type','category','thumbnailUrl','backgroundThumbnailUrl','videoUrl','trailerUrl','duration','quality','releaseDate','rating','homepageSections','director','cast'
                    ];
                    const sample = [
                      'Blame','I am testing','movie','movie','https://.../thumb.jpg','https://.../bg.jpg','https://.../video.mp4','https://.../trailer.mp4','3600','1080p','2025-09-06','PG-13','featured|trending','Jane Doe','Tom Hanks:Lead|Robin Wright:Support'
                    ];
                    const csv = headers.join(',') + '\n' + sample.map((s) => '"'+String(s).replaceAll('"','""')+'"').join(',');
                    const link = document.getElementById('sampleCsvLinkTop') as HTMLAnchorElement;
                    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                  }}
                >
                  Download Sample CSV
                </a>
                {/* Upload CSV */}
                <label className="btn btn-primary cursor-pointer">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
                      const headers = headerLine.split(',').map((h) => h.replace(/^"|"$/g,''));
                      const items = lines.map((line) => {
                        const cols = line.match(/(?:\"([^\"]*)\"|([^,]+))/g)?.map((c) => c.replace(/^\"|\"$/g,'')) || [];
                        const obj: any = {};
                        headers.forEach((h, i) => obj[h.trim()] = (cols[i] || '').trim());
                        if (obj.duration) obj.duration = Number(obj.duration);
                        if (obj.homepageSections) obj.homepageSections = obj.homepageSections.split('|').map((s: string) => s.trim()).filter(Boolean);
                        if (obj.cast) obj.cast = obj.cast.split('|').map((p: string) => { const [n,r]=p.split(':'); return { name:(n||'').trim(), role:(r||'Actor').trim() }; }).filter((c:any)=>c.name);
                        return obj;
                      });
                      try {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                        const res = await fetch('/api/admin/content/bulk', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items })
                        });
                        const result = await res.json();
                        if (res.ok) { success('Bulk Upload', `Inserted ${result.data?.inserted || items.length} items`); fetchContent(); }
                        else { error('Bulk Upload Failed', result.message || 'Failed to import CSV'); }
                      } catch (err) { console.error('Bulk upload error', err); error('Network Error', 'Failed to connect to server'); }
                      e.currentTarget.value='';
                    }}
                  />
                </label>
                {/* Export */}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const rows = content;
                    const headers = [
                      'title','description','type','category','thumbnailUrl','backgroundThumbnailUrl','videoUrl','trailerUrl','duration','quality','releaseDate','rating','homepageSections','director','cast','isPublished'
                    ];
                    const lines = rows.map((r: any) => {
                      const vals: any[] = [
                        r.title,r.description,r.type,r.category,r.thumbnailUrl,(r as any).backgroundThumbnailUrl,r.videoUrl,r.trailerUrl,r.duration,r.quality,r.releaseDate,typeof r.rating==='string'?r.rating:(r.rating?.average??''),(r.homepageSections||[]).join('|'),(r as any).director||'',((r as any).cast||[]).map((c:any)=>`${c.name}:${c.role}`).join('|'),r.isPublished?'true':'false'
                      ];
                      return vals.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',');
                    });
                    const csv = headers.join(',')+'\n'+lines.join('\n');
                    const url = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
                    const a = document.createElement('a'); a.href=url; a.download='content-export.csv'; document.body.appendChild(a); a.click(); a.remove();
                  }}
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Subtabs */}
          <div className="mb-8">
            <div className="border-b border-netflix-gray">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'library'
                      ? 'border-netflix-red text-netflix-red'
                      : 'border-transparent text-netflix-text-gray hover:text-white hover:border-netflix-gray'
                  }`}
                >
                  Content Library
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'categories'
                      ? 'border-netflix-red text-netflix-red'
                      : 'border-transparent text-netflix-text-gray hover:text-white hover:border-netflix-gray'
                  }`}
                >
                  Manage Categories
                </button>
              </nav>
            </div>
          </div>

          {/* Content Library Tab */}
          {activeTab === 'library' && (
            <>
              {/* Bulk Upload */}
              <div className="hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Bulk Upload via CSV</h3>
                    <p className="text-netflix-text-gray text-sm">Download sample, fill details, then upload to create multiple items at once.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="data:text/csv;charset=utf-8,"
                      id="sampleCsvLink"
                      download="content-sample.csv"
                      className="btn btn-secondary"
                      onClick={(e) => {
                        const headers = [
                          'title','description','type','category','thumbnailUrl','backgroundThumbnailUrl','videoUrl','trailerUrl','duration','quality','releaseDate','rating','homepageSections','director','cast'
                        ];
                        const sample = [
                          'Blame','I am testing','movie','movie','https://.../thumb.jpg','https://.../bg.jpg','https://.../video.mp4','https://.../trailer.mp4','3600','1080p','2025-09-06','PG-13','featured|trending','Jane Doe','Tom Hanks:Lead|Robin Wright:Support'
                        ];
                        const csv = headers.join(',') + '\n' + sample.map((s) => '"'+String(s).replaceAll('"','""')+'"').join(',');
                        const link = document.getElementById('sampleCsvLink') as HTMLAnchorElement;
                        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                      }}
                    >
                      Download Sample CSV
                    </a>
                    <label className="btn btn-primary cursor-pointer">
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const text = await file.text();
                          const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
                          const headers = headerLine.split(',').map((h) => h.replace(/^"|"$/g,''));
                          const items = lines.map((line) => {
                            const cols = line.match(/(?:\"([^\"]*)\"|([^,]+))/g)?.map((c) => c.replace(/^\"|\"$/g,'')) || [];
                            const obj: any = {};
                            headers.forEach((h, i) => obj[h.trim()] = (cols[i] || '').trim());
                            // Normalize fields
                            if (obj.duration) obj.duration = Number(obj.duration);
                            if (obj.homepageSections) obj.homepageSections = obj.homepageSections.split('|').map((s: string) => s.trim()).filter(Boolean);
                            if (obj.cast) obj.cast = obj.cast.split('|').map((p: string) => {
                              const [name, role] = p.split(':');
                              return { name: (name||'').trim(), role: (role||'Actor').trim() };
                            }).filter((c: any) => c.name);
                            return obj;
                          });
                          try {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                            const res = await fetch('/api/admin/content/bulk', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ items })
                            });
                            const result = await res.json();
                            if (res.ok) {
                              success('Bulk Upload', `Inserted ${result.data?.inserted || items.length} items`);
                              fetchContent();
                            } else {
                              error('Bulk Upload Failed', result.message || 'Failed to import CSV');
                            }
                          } catch (err) {
                            console.error('Bulk upload error', err);
                            error('Network Error', 'Failed to connect to server');
                          }
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              {/* Filters, Search, Sort */}
              <div className="bg-netflix-dark-gray rounded-lg p-4 md:p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-netflix-text-gray mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-netflix-text-gray mb-2">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      <option value="all">All Types</option>
                      <option value="movie">Movie</option>
                      <option value="series">TV Show</option>
                      <option value="trailer">Trailer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-netflix-text-gray mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      <option value="all">All Categories</option>
                      {categories && categories.length > 0 ? (
                        categories.map((cat: any) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Action">Action</option>
                          <option value="Comedy">Comedy</option>
                          <option value="Drama">Drama</option>
                          <option value="Horror">Horror</option>
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Thriller">Thriller</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-netflix-text-gray mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-netflix-text-gray mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      <option value="created">Newest</option>
                      <option value="title">Title</option>
                      <option value="type">Type</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex gap-2 justify-end md:justify-start">
                    <button
                      className="btn btn-secondary w-full md:w-auto"
                      onClick={() => { setFilters({ type: 'all', category: 'all', status: 'all' }); setSearchTerm(''); setSortBy('created'); setPage(1); }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <FilmIcon className="w-8 h-8 text-netflix-red" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-netflix-text-gray">Total Content</p>
                  <p className="text-2xl font-bold text-white">{content.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <FilmIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-netflix-text-gray">Movies</p>
                  <p className="text-2xl font-bold text-white">{content.filter(c => c.type === 'movie').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <TvIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-netflix-text-gray">Shows</p>
                  <p className="text-2xl font-bold text-white">{content.filter(c => c.type === 'series').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <EyeIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-netflix-text-gray">Trailers</p>
                  <p className="text-2xl font-bold text-white">{content.filter(c => c.type === 'trailer').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-netflix-dark-gray rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-netflix-gray">
                <thead className="bg-netflix-gray">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredContent.length}
                        onChange={(e) => {
                          setSelectedIds(e.target.checked ? filteredContent.map(c => c._id) : []);
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Type/Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Homepage Sections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-netflix-dark-gray divide-y divide-netflix-gray">
                  {loadingContent ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-netflix-text-gray">
                        Loading content...
                      </td>
                    </tr>
                  ) : filteredContent.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-netflix-text-gray">
                        {content.length === 0 
                          ? "No content found. Click \"Add Content\" to get started."
                          : "No content matches your filters. Try adjusting your search criteria."
                        }
                      </td>
                    </tr>
                  ) : (
                    currentPageItems.map((item) => (
                      <tr key={item._id} className="hover:bg-netflix-gray transition-colors">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => e.target.checked ? [...new Set([...prev, item._id])] : prev.filter(id => id !== item._id));
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              className="h-12 w-20 object-cover rounded" 
                              src={item.thumbnailUrl || '/placeholder.jpg'} 
                              alt={item.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.jpg';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{item.title}</div>
                              <div className="text-sm text-netflix-text-gray">{item.description?.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                          <div>
                            <span className="text-white capitalize">{item.type}</span>
                            <div className="text-xs text-netflix-text-gray">{item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.isPublished 
                              ? 'bg-green-900 text-green-200' 
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                          {typeof item.rating === 'string' ? item.rating : item.rating?.average ? `${item.rating.average}/5` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                          {item.homepageSections && item.homepageSections.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.homepageSections.map((section) => (
                                <span key={section} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-netflix-red text-white">
                                  {section.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-netflix-text-gray">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                          {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-netflix-red hover:text-netflix-red-dark mr-4"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-netflix-text-gray">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary" disabled={page<=1} onClick={() => setPage(p=>Math.max(1,p-1))}>Prev</button>
                <button className="btn btn-secondary" disabled={page>=totalPages} onClick={() => setPage(p=>Math.min(totalPages,p+1))}>Next</button>
              </div>
            </div>
          </div>

          {/* Bulk actions toolbar (floating) */}
          {selectedIds.length > 0 && (
            <div className="fixed left-4 right-4 bottom-4 z-60 bg-netflix-dark-gray/95 backdrop-blur-sm border border-netflix-gray rounded-lg p-4 shadow-xl flex items-center justify-between">
              <span className="text-white text-sm">Selected {selectedIds.length} item(s)</span>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await bulkAction('draft');
                  }}
                >
                  Mark as Draft
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await bulkAction('trash');
                  }}
                >
                  Move to Trash
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const rows = content.filter(c => selectedIds.includes(c._id));
                    const headers = [
                      'title','description','type','category','thumbnailUrl','backgroundThumbnailUrl','videoUrl','trailerUrl','duration','quality','releaseDate','rating','homepageSections','director','cast','isPublished'
                    ];
                    const lines = rows.map((r: any) => {
                      const vals: any[] = [
                        r.title,
                        r.description,
                        r.type,
                        r.category,
                        r.thumbnailUrl,
                        (r as any).backgroundThumbnailUrl,
                        r.videoUrl,
                        r.trailerUrl,
                        r.duration,
                        r.quality,
                        r.releaseDate,
                        typeof r.rating === 'string' ? r.rating : (r.rating?.average ?? ''),
                        (r.homepageSections||[]).join('|'),
                        (r as any).director || '',
                        ((r as any).cast||[]).map((c:any)=>`${c.name}:${c.role}`).join('|'),
                        r.isPublished ? 'true' : 'false'
                      ];
                      return vals.map(v => '"'+String(v ?? '').replaceAll('"','""')+'"').join(',');
                    });
                    const csv = headers.join(',') + '\n' + lines.join('\n');
                    const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'content-export.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                >
                  Export CSV
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (typeof window !== 'undefined' && !confirm('Permanently delete selected items?')) return;
                    await bulkAction('delete');
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
            </>
          )}

          {/* Manage Categories Tab */}
          {activeTab === 'categories' && (
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Manage Categories</h2>
                <button
                  onClick={handleAddCategory}
                  className="bg-netflix-red hover:bg-netflix-red-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Category</span>
                </button>
              </div>
              
              {/* Categories Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-netflix-gray">
                  <thead className="bg-netflix-gray">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-netflix-text-gray uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-netflix-dark-gray divide-y divide-netflix-gray">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-netflix-text-gray">
                          No categories found. Click "Add Category" to get started.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id} className="hover:bg-netflix-gray transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <div>
                                <div className="text-sm font-medium text-white">{category.name}</div>
                                <div className="text-sm text-netflix-text-gray">{category.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-netflix-text-gray">
                            {category.description || 'No description'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-6 h-6 rounded border border-netflix-gray mr-2"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm text-netflix-text-gray">{category.color}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-netflix-text-gray">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-netflix-red hover:text-netflix-red-dark mr-4"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Modal */}
      {showModal && (
        <ContentFormModal
          content={editingContent}
          featuredSections={featuredSections}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setEditingContent(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}

// Content Form Modal Component
function ContentFormModal({ 
  content, 
  featuredSections,
  categories,
  onClose, 
  onSave 
}: { 
  content: Content | null; 
  featuredSections: any[];
  categories: any[];
  onClose: () => void; 
  onSave: () => void; 
}) {
  const { success, error } = useToastContext();
  const [formData, setFormData] = useState({
    title: content?.title || '',
    description: content?.description || '',
    category: (content?.category as string) || (categories?.[0]?.name || ''),
    type: content?.type || 'movie',
    thumbnail: content?.thumbnailUrl || '',
    backgroundThumbnailUrl: (content as any)?.backgroundThumbnailUrl || '',
    trailerUrl: content?.trailerUrl || '',
    videoUrl: content?.videoUrl || '',
    duration: content?.duration ? String(content.duration) : '',
    rating: typeof content?.rating === 'string' ? content.rating : 'PG-13',
    releaseDate: content?.releaseDate ? content.releaseDate.substring(0,10) : '',
    homepageSections: content?.homepageSections || [],
    director: (content as any)?.director || '',
    castText: Array.isArray((content as any)?.cast)
      ? ((content as any)?.cast as any[]).map((c: any) => c.role ? `${c.name}:${c.role}` : c.name).join(', ')
      : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        thumbnail: formData.thumbnail,
        backgroundThumbnailUrl: (formData as any).backgroundThumbnailUrl,
        trailerUrl: formData.trailerUrl,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        rating: formData.rating,
        releaseDate: formData.releaseDate,
        homepageSections: formData.homepageSections,
        director: (formData as any).director || undefined,
        cast: (formData as any).castText
          ? (formData as any).castText.split(',').map((s: string) => {
              const part = s.trim();
              if (!part) return null;
              // Support "Name:Role" or just "Name"
              const hasRole = part.includes(':');
              const [name, role] = hasRole ? part.split(':') : [part, 'Actor'];
              return { name: name.trim(), role: (role || 'Actor').trim() };
            }).filter(Boolean)
          : undefined
      };

      let res: Response;
      if (content?._id) {
        res = await fetch(`/api/admin/content/${content._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/admin/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        onSave();
        success('Content Saved', content?._id ? 'Content updated successfully' : 'Content created successfully');
      } else {
        const result = await res.json();
        error('Save Failed', result.message || 'Failed to save content');
      }
    } catch (err) {
      console.error('Save content error', err);
      error('Network Error', 'Failed to connect to server. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleHomepageSectionChange = (section: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        homepageSections: [...formData.homepageSections, section]
      });
    } else {
      setFormData({
        ...formData,
        homepageSections: formData.homepageSections.filter(s => s !== section)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-netflix-dark-gray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-netflix-gray">
          <h3 className="text-lg font-medium text-white">
            {content ? 'Edit Content' : 'Add New Content'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Director (optional)
              </label>
              <input
                type="text"
                name="director"
                value={(formData as any).director}
                onChange={handleChange}
                placeholder="e.g., Christopher Nolan"
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="trailer">Trailer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="movie">Movie</option>
                    <option value="show">Show</option>
                    <option value="trailer">Trailer</option>
                    <option value="other">Other</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
                <option value="TV-G">TV-G</option>
                <option value="TV-PG">TV-PG</option>
                <option value="TV-14">TV-14</option>
                <option value="TV-MA">TV-MA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Homepage Sections
            </label>
            <div className="grid grid-cols-2 gap-2">
              {featuredSections.length > 0 ? (
                featuredSections.map((section) => (
                  <label key={section._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.homepageSections.includes(section.name.toLowerCase().replace(/\s/g, '_'))}
                      onChange={(e) => handleHomepageSectionChange(section.name.toLowerCase().replace(/\s/g, '_'), e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-netflix-red focus:ring-netflix-red"
                    />
                    <span className="text-netflix-text-gray text-sm">{section.name}</span>
                  </label>
                ))
              ) : (
                <div className="col-span-2 text-netflix-text-gray text-sm">No featured sections available. Create some in the Featured Section tab.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Background Thumbnail URL (Hero)
              </label>
              <input
                type="url"
                name="backgroundThumbnailUrl"
                value={(formData as any).backgroundThumbnailUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Trailer URL
              </label>
              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-text-gray mb-2">
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Cast (optional)
            </label>
            <textarea
              name="castText"
              value={(formData as any).castText}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-netflix-gray border border-netflix-light-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
              placeholder="Comma-separated. Use Name:Role or just Name. e.g., Tom Hanks:Lead, Robin Wright:Support"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-netflix-gray text-netflix-text-gray rounded-md hover:bg-netflix-gray transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red-dark transition-colors"
            >
              {content ? 'Update Content' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Form Modal Component
function CategoryFormModal({ 
  category, 
  onClose, 
  onSave 
}: { 
  category: any | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const { success, error } = useToastContext();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#E50914',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        error('Authentication Error', 'No authentication token found.');
        return;
      }

      const method = category ? 'PUT' : 'POST';
      const url = category ? `/api/admin/categories/${category._id}` : '/api/admin/categories';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      
      if (res.ok) {
        onSave();
        success('Category Saved', category ? 'Category updated successfully' : 'Category created successfully');
      } else {
        console.error('Failed to save category:', result.message);
        error('Save Failed', result.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('Save category error', err);
      error('Network Error', 'Failed to connect to server. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 border border-netflix-light-gray rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                className="flex-1 px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
                placeholder="#E50914"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-netflix-gray text-netflix-text-gray rounded-md hover:bg-netflix-gray transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red-dark transition-colors"
            >
              {category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}