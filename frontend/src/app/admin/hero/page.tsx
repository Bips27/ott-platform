'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { useToastContext } from '@/components/ToastProvider';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  PlayIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface HeroSection {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    backgroundThumbnailUrl?: string;
    videoUrl: string;
    trailerUrl?: string;
    type: string;
    category: string;
    rating: any; // accept string | { average: number; count?: number }
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaButton: {
    text: string;
    action: 'play' | 'more_info';
    link?: string;
  };
  order: number;
  isActive: boolean;
}

interface Content {
  _id: string;
  title: string;
  thumbnailUrl: string;
  backgroundThumbnailUrl?: string;
  videoUrl: string;
  trailerUrl?: string;
  type: string;
  category: string;
  rating: any; // accept string | { average: number; count?: number }
}

function formatRating(r: any): string {
  if (r == null) return 'N/A';
  if (typeof r === 'object') {
    const avg = (r as any).average;
    return typeof avg === 'number' || typeof avg === 'string' ? String(avg) : 'N/A';
  }
  return String(r);
}

export default function HeroSectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { success, error } = useToastContext();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load hero sections
      const heroRes = await fetch('/api/admin/hero-sections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const heroData = await heroRes.json();
      setHeroSections(heroData.data || []);

      // Load content for dropdown
      const contentRes = await fetch('/api/admin/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentData = await contentRes.json();
      setContent(contentData.data || []);
      
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingData(false);
    }
  };

  const handleSave = async (heroData: Partial<HeroSection>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const method = heroData._id ? 'PUT' : 'POST';
      const url = heroData._id ? `/api/admin/hero-sections/${heroData._id}` : '/api/admin/hero-sections';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(heroData)
      });

      const result = await res.json();
      
      if (res.ok) {
        loadData();
        setShowModal(false);
        setEditingHero(null);
        success('Hero Section Saved', heroData._id ? 'Hero section updated successfully' : 'Hero section created successfully');
      } else {
        console.error('Failed to save hero section:', result.message);
        error('Save Failed', result.message || 'Failed to save hero section');
      }
    } catch (err) {
      console.error('Network error:', err);
      error('Network Error', 'Failed to connect to server. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hero section?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/admin/hero-sections/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          loadData();
          success('Hero Section Deleted', 'Hero section deleted successfully');
        } else {
          console.error('Failed to delete hero section');
          error('Delete Failed', 'Failed to delete hero section');
        }
      } catch (err) {
        console.error('Network error:', err);
        error('Network Error', 'Failed to connect to server. Please try again.');
      }
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSections.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSections.length) % heroSections.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-netflix-black flex">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Hero Section Management</h1>
            <p className="text-netflix-text-gray mt-1">Create and manage homepage hero slides</p>
          </div>
          <div className="flex space-x-3">
            {heroSections.length > 0 && (
              <button
                onClick={() => setShowPreview(true)}
                className="bg-netflix-gray hover:bg-netflix-light-gray text-white px-4 py-2 rounded-md flex items-center"
              >
                <EyeIcon className="w-5 h-5 mr-2" /> Preview
              </button>
            )}
            <button
              onClick={() => { setEditingHero(null); setShowModal(true); }}
              disabled={heroSections.length >= 5}
              className="bg-netflix-red hover:bg-netflix-red-dark text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Add Hero Slide
            </button>
          </div>
        </div>

        {heroSections.length >= 5 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              Maximum of 5 hero slides allowed. Delete an existing slide to add a new one.
            </p>
          </div>
        )}

        {loadingData ? (
          <div className="text-center py-8">
            <div className="text-netflix-text-gray">Loading hero sections...</div>
          </div>
        ) : heroSections.length > 0 ? (
          <div className="space-y-6">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={prevSlide}
                  disabled={heroSections.length <= 1}
                  className="p-2 bg-netflix-gray hover:bg-netflix-light-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-white" />
                </button>
                <span className="text-white font-medium">
                  Slide {currentSlide + 1} of {heroSections.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={heroSections.length <= 1}
                  className="p-2 bg-netflix-gray hover:bg-netflix-light-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  <ChevronRightIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {heroSections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-netflix-red' : 'bg-netflix-gray'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Slide Display */}
            <div className="bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-96">
                <img
                  src={heroSections[currentSlide].backgroundImage || heroSections[currentSlide].content.backgroundThumbnailUrl || heroSections[currentSlide].content.thumbnailUrl}
                  alt={heroSections[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h2 className="text-white font-bold text-3xl mb-2">{heroSections[currentSlide].title}</h2>
                  {heroSections[currentSlide].subtitle && (
                    <p className="text-gray-300 text-lg mb-4">{heroSections[currentSlide].subtitle}</p>
                  )}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-green-400 text-sm font-semibold">98% Match</span>
                    <span className="text-gray-400 text-sm">
                      {formatRating(heroSections[currentSlide].content.rating)}
                    </span>
                    <span className="text-gray-400 text-sm">{heroSections[currentSlide].content.category}</span>
                    <span className="text-gray-400 text-sm">{heroSections[currentSlide].content.type}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 max-w-2xl line-clamp-3">
                    {heroSections[currentSlide].description || `Watch ${heroSections[currentSlide].content.title} - ${heroSections[currentSlide].content.category} ${heroSections[currentSlide].content.type}`}
                  </p>
                  <div className="flex items-center space-x-4">
                    <button className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center">
                      <PlayIcon className="w-5 h-5 mr-2" />
                      {heroSections[currentSlide].ctaButton.text}
                    </button>
                    <button className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                      More Info
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => { setEditingHero(heroSections[currentSlide]); setShowModal(true); }}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-md"
                  >
                    <PencilIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(heroSections[currentSlide]._id)}
                    className="p-2 bg-black/50 hover:bg-red-600/70 rounded-md"
                  >
                    <TrashIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-netflix-text-gray text-sm">Order: {heroSections[currentSlide].order}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      heroSections[currentSlide].isActive ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {heroSections[currentSlide].isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-netflix-text-gray text-sm">
                    Content: {heroSections[currentSlide].content.title}
                  </div>
                </div>
              </div>
            </div>

            {/* All Slides Grid */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">All Hero Slides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroSections.map((hero, index) => (
                  <div 
                    key={hero._id} 
                    className={`bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all ${
                      index === currentSlide ? 'ring-2 ring-netflix-red' : 'hover:ring-1 hover:ring-netflix-gray'
                    }`}
                    onClick={() => goToSlide(index)}
                  >
                    <div className="relative h-32">
                      <img
                        src={hero.backgroundImage || hero.content.backgroundThumbnailUrl || hero.content.thumbnailUrl}
                        alt={hero.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-white font-semibold text-sm truncate">{hero.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-300 text-xs">{hero.content.type}</span>
                          <span className="text-gray-300 text-xs">#{hero.order}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-netflix-text-gray mb-4">No hero sections created yet.</div>
            <button
              onClick={() => { setEditingHero(null); setShowModal(true); }}
              className="bg-netflix-red hover:bg-netflix-red-dark text-white px-6 py-3 rounded-md"
            >
              Create Your First Hero Slide
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && heroSections.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-md"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
            
            <div className="relative h-[70vh] rounded-lg overflow-hidden">
              <img
                src={heroSections[currentSlide].backgroundImage || heroSections[currentSlide].content.backgroundThumbnailUrl || heroSections[currentSlide].content.thumbnailUrl}
                alt={heroSections[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h1 className="text-white font-bold text-4xl mb-4">{heroSections[currentSlide].title}</h1>
                {heroSections[currentSlide].subtitle && (
                  <p className="text-gray-300 text-xl mb-6">{heroSections[currentSlide].subtitle}</p>
                )}
                <div className="flex items-center space-x-6 mb-6">
                  <span className="text-green-400 text-lg font-semibold">98% Match</span>
                  <span className="text-gray-400">
                    {formatRating(heroSections[currentSlide].content.rating)}
                  </span>
                  <span className="text-gray-400">{heroSections[currentSlide].content.category}</span>
                  <span className="text-gray-400">{heroSections[currentSlide].content.type}</span>
                </div>
                <p className="text-gray-300 text-lg mb-8 max-w-3xl">
                  {heroSections[currentSlide].description || `Watch ${heroSections[currentSlide].content.title} - ${heroSections[currentSlide].content.category} ${heroSections[currentSlide].content.type}`}
                </p>
                <div className="flex items-center space-x-6">
                  <button className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center text-lg">
                    <PlayIcon className="w-6 h-6 mr-3" />
                    {heroSections[currentSlide].ctaButton.text}
                  </button>
                  <button className="bg-gray-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-500 transition-colors text-lg">
                    More Info
                  </button>
                </div>
              </div>
            </div>
            
            {/* Preview Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prevSlide}
                disabled={heroSections.length <= 1}
                className="p-3 bg-netflix-gray hover:bg-netflix-light-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div className="flex space-x-3">
                {heroSections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-4 h-4 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-netflix-red' : 'bg-netflix-gray'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                disabled={heroSections.length <= 1}
                className="p-3 bg-netflix-gray hover:bg-netflix-light-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <HeroSectionFormModal
          hero={editingHero}
          content={content}
          existingOrders={heroSections.map(h => h.order)}
          onClose={() => { setShowModal(false); setEditingHero(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function HeroSectionFormModal({ 
  hero, 
  content, 
  existingOrders,
  onClose, 
  onSave 
}: {
  hero: HeroSection | null;
  content: Content[];
  existingOrders: number[];
  onClose: () => void;
  onSave: (hero: Partial<HeroSection>) => void;
}) {
  const { error } = useToastContext();
  const [selectedContent, setSelectedContent] = useState<Content | null>(
    hero ? content.find(c => c._id === hero.content._id) || null : null
  );
  const [searchTerm, setSearchTerm] = useState(selectedContent?.title || '');
  const [showContentDropdown, setShowContentDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredContent = content.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableOrders = [1, 2, 3, 4, 5].filter(order => 
    !existingOrders.includes(order) || order === hero?.order
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContent) {
      error('Validation Error', 'Please select content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const heroData = {
        title: selectedContent.title,
        subtitle: `${selectedContent.category} ${selectedContent.type}`,
        description: `Watch ${selectedContent.title} - ${selectedContent.category} ${selectedContent.type}`,
        contentId: selectedContent._id,
        backgroundImage: selectedContent.backgroundThumbnailUrl || selectedContent.thumbnailUrl,
        backgroundVideo: selectedContent.trailerUrl || '',
        ctaButton: {
          text: 'Play',
          action: 'play'
        } as const,
        order: availableOrders[0] || 1,
        isActive: true,
        _id: hero?._id
      };

      await onSave(heroData);
    } catch (err) {
      console.error('Error saving hero section:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentSelect = (content: Content) => {
    setSelectedContent(content);
    setSearchTerm(content.title);
    setShowContentDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-netflix-dark-gray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-netflix-gray">
          <h3 className="text-lg font-medium text-white">
            {hero ? 'Edit Hero Section' : 'Add New Hero Section'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-netflix-text-gray mb-2">Select Content *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for movies or TV shows..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowContentDropdown(true);
                }}
                onFocus={() => setShowContentDropdown(true)}
                className="w-full px-3 py-2 bg-white border border-netflix-light-gray rounded-md text-black focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
              
              {showContentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-netflix-light-gray rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredContent.length > 0 ? (
                    filteredContent.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleContentSelect(item)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black text-sm flex items-center"
                      >
                        <img src={item.thumbnailUrl} alt={item.title} className="w-8 h-6 object-cover rounded mr-3" />
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-gray-500 text-xs">
                            {item.type} • {item.category} • {formatRating(item.rating)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.backgroundThumbnailUrl ? 'Has Background' : 'Thumbnail Only'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No content found</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedContent && (
              <div className="mt-3 p-4 bg-netflix-gray rounded-lg border border-netflix-light-gray">
                <div className="flex items-start space-x-4">
                  <img 
                    src={selectedContent.thumbnailUrl} 
                    alt={selectedContent.title} 
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm mb-1">{selectedContent.title}</div>
                    <div className="text-netflix-text-gray text-xs mb-2">
                      {selectedContent.type} • {selectedContent.category} • {formatRating(selectedContent.rating)}
                    </div>
                    <div className="text-netflix-text-gray text-xs">
                      {selectedContent.backgroundThumbnailUrl ? '✓ Background image available' : '⚠ Using thumbnail as background'}
                    </div>
                  </div>
                </div>
                
                {/* Preview of auto-populated data */}
                <div className="mt-4 pt-4 border-t border-netflix-light-gray">
                  <div className="text-xs text-netflix-text-gray mb-2">Hero slide will be created with:</div>
                  <div className="space-y-1">
                    <div className="text-white text-sm">
                      <span className="text-netflix-text-gray">Title:</span> {selectedContent.title}
                    </div>
                    <div className="text-white text-sm">
                      <span className="text-netflix-text-gray">Subtitle:</span> {selectedContent.category} {selectedContent.type}
                    </div>
                    <div className="text-white text-sm">
                      <span className="text-netflix-text-gray">Description:</span> Watch {selectedContent.title} - {selectedContent.category} {selectedContent.type}
                    </div>
                    <div className="text-white text-sm">
                      <span className="text-netflix-text-gray">Background:</span> {selectedContent.backgroundThumbnailUrl || selectedContent.thumbnailUrl}
                    </div>
                    <div className="text-white text-sm">
                      <span className="text-netflix-text-gray">Order:</span> {availableOrders[0] || 1}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={!selectedContent || isSubmitting}
              className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : (hero ? 'Update Hero Slide' : 'Create Hero Slide')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

