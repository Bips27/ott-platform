'use client';

import { useState, useEffect } from 'react';
import { HeroSection, ContentGrid, SectionHeader, LoadingSpinner } from '@/components/ui';
import TrailerCarousel from '@/components/TrailerCarousel';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { PlayIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user, loading } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [heroContent, setHeroContent] = useState<any>(null);
  const [heroTrailers, setHeroTrailers] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch homepage sections
        const sectionsRes = await fetch(`/api/content/homepage/sections`);
        const sectionsJson = await sectionsRes.json();
        const data = sectionsJson.data;
        
        // Handle both array format (from FeaturedSection) and object format (legacy)
        if (Array.isArray(data)) {
          setSections(data);
        } else {
          const defaultSections = [
            { name: 'Featured', key: 'featured' },
            { name: 'Trending Now', key: 'trending' },
            { name: 'New Releases', key: 'new_releases' },
            { name: 'Top Picks for You', key: 'top_picks' },
            { name: 'Recommended', key: 'recommended' }
          ];
          
          const sectionsWithContent = defaultSections.map(section => ({
            name: section.name,
            items: data?.[section.key] || []
          }));
          
          setSections(sectionsWithContent);
        }
        
        // Fetch hero sections for carousel
        const heroRes = await fetch(`/api/content/hero-sections`);
        const heroJson = await heroRes.json();
        const heroData = heroJson.data || [];
        
        if (heroData.length > 0) {
          // Map hero sections into TrailerCarousel format
          const mapped = heroData.map((h: any) => ({
            id: h._id || h.content?._id || Math.random().toString(36).slice(2),
            title: h.title || h.content?.title || 'Featured',
            subtitle: h.subtitle || undefined,
            description: h.description || h.content?.description || '',
            thumbnail: h.content?.thumbnailUrl || '/placeholder-hero.jpg',
            backgroundThumbnail: h.backgroundImage || h.content?.backgroundThumbnailUrl || h.content?.thumbnailUrl,
            trailerUrl: h.backgroundVideo || h.content?.trailerUrl || h.content?.videoUrl || '',
            category: h.content?.category || 'Featured',
            duration: h.content?.duration || '2h',
            rating: typeof h.content?.rating === 'string' ? h.content?.rating : 'PG-13',
            ctaButton: { text: 'Play', action: 'play', link: h.content?._id ? `/watch/${h.content._id}` : undefined }
          }));
          setHeroTrailers(mapped);
          // Keep first for fallback HeroSection consumers
          const firstHero = mapped[0];
          setHeroContent({
            title: firstHero.title,
            description: firstHero.description,
            backgroundImage: firstHero.backgroundThumbnail || firstHero.thumbnail,
            trailerUrl: firstHero.trailerUrl
          });
        } else {
          // Fallback hero content
          setHeroContent({
            title: 'Welcome to OTT Platform',
            description: 'Discover amazing movies and TV shows from around the world. Stream unlimited content with our premium subscription.',
            backgroundImage: '/placeholder-hero.jpg',
            trailerUrl: null
          });
        }
        
        setLoadingContent(false);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, []);

  const handlePlay = () => {
    if (heroContent?.trailerUrl) {
      // Open video player or redirect to watch page
      window.open(heroContent.trailerUrl, '_blank');
    }
  };

  const handleMoreInfo = () => {
    // Scroll to content sections
    const sectionsElement = document.getElementById('content-sections');
    sectionsElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContentClick = (item: any) => {
    // Navigate to content detail page
    const contentId = item.id || item._id;
    if (contentId) {
      window.location.href = `/watch/${contentId}`;
    }
  };

  const handlePlayContent = (item: any) => {
    // Navigate to watch page
    const contentId = item.id || item._id;
    if (contentId) {
      window.location.href = `/watch/${contentId}`;
    }
  };

  const handleAddToWatchlist = (item: any) => {
    // Add to watchlist functionality
    console.log('Add to watchlist:', item.title);
  };

  const handleShareContent = (item: any) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: `${window.location.origin}/watch/${item._id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/watch/${item._id}`);
    }
  };

  if (loadingContent) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-body text-netflix-text-gray">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black -mt-16">
      {/* Hero Section - prefer video carousel if available */}
      {heroTrailers.length > 0 ? (
        <div className="-mt-16">
          <TrailerCarousel trailers={heroTrailers} />
        </div>
      ) : heroContent ? (
        <HeroSection
          title={heroContent.title}
          description={heroContent.description}
          backgroundImage={heroContent.backgroundImage}
          onPlay={handlePlay}
          onMoreInfo={handleMoreInfo}
        />
      ) : null}

      {/* Content Sections */}
      <div id="content-sections" className="py-16">
        <div className="container mx-auto px-4">
          {sections.map((section: any, index: number) => {
            if (!section.items || section.items.length === 0) return null;
            
            return (
              <div key={section.name || index} className="mb-16">
                <SectionHeader
                  title={section.name}
                />
                
                <ContentGrid
                  items={section.items.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    image: item.thumbnailUrl || '/placeholder.jpg',
                    year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : '2024',
                    rating: typeof item.rating === 'string' ? item.rating : 'PG-13',
                    genres: [item.category],
                    description: item.description
                  }))}
                  onItemClick={handleContentClick}
                  onPlay={handlePlayContent}
                  onAddToWatchlist={handleAddToWatchlist}
                  onShare={handleShareContent}
                />
              </div>
            );
          })}
          
          {sections.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-heading-3 text-white mb-4">No Content Available</h2>
              <p className="text-body text-netflix-text-gray mb-8">
                Check back soon for amazing movies and TV shows!
              </p>
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="btn btn-primary"
                >
                  Add Content
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}