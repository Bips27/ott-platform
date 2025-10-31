'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { Button, PlayButton, ContentCard, LoadingSpinner } from '@/components/ui';
import { 
  PlayIcon, 
  PlusIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  ShareIcon,
  ArrowLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { success, error } = useToastContext();
  const [item, setItem] = useState<any>(null);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [overlayActive, setOverlayActive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params?.id) return;
    fetchContent();
  }, [params?.id]);

  useEffect(() => {
    if (!loading && item?.requiresSubscription && (!user || user.subscription?.status !== 'active')) {
      router.push('/plans');
    }
  }, [loading, item, user, router]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/content/${params.id}`);
      const json = await res.json();
      
      if (res.ok) {
        setItem(json.data);
        fetchRelatedContent(json.data.category);
      } else {
        error('Error', 'Failed to load content');
      }
    } catch (e: any) {
      console.error('Error fetching content:', e);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoadingContent(false);
    }
  };

  // Basic player-protection deterrents (not fool-proof)
  useEffect(() => {
    const handleVisibility = () => {
      // If tab is hidden or window is blurred, show black overlay
      const hidden = document.hidden;
      setOverlayActive(hidden);
    };

    const handleBlur = () => setOverlayActive(true);
    const handleFocus = () => setOverlayActive(false);

    // Attempt to clear clipboard on PrintScreen (best-effort, may be blocked by browser)
    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'printscreen') {
        try {
          const blank = new Blob([new Uint8Array()], { type: 'image/png' });
          // @ts-ignore - ClipboardItem is available in secure contexts
          await navigator.clipboard.write?.([new (window as any).ClipboardItem({ 'image/png': blank })]);
        } catch {}
        setOverlayActive(true);
        setTimeout(() => setOverlayActive(false), 1200);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const fetchRelatedContent = async (category: string) => {
    try {
      const res = await fetch(`/api/content?category=${category}&limit=6`);
      const json = await res.json();
      
      if (res.ok) {
        // Filter out current content
        const related = json.data.filter((content: any) => content._id !== params.id);
        setRelatedContent(related.slice(0, 6));
      }
    } catch (e) {
      console.error('Error fetching related content:', e);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      error('Authentication Required', 'Please log in to add to watchlist');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/users/watchlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentId: item._id }),
      });

      if (response.ok) {
        setIsInWatchlist(!isInWatchlist);
        success('Success', isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
      } else {
        error('Error', 'Failed to update watchlist');
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      success('Success', 'Link copied to clipboard');
    }
  };

  if (loadingContent) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-body text-netflix-text-gray">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-heading-3 text-white mb-4">Content Not Found</h1>
          <Button variant="primary" href="/">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pt-0">
      {/* Back Button */}
      <div className="fixed top-16 md:top-24 left-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
          className="bg-netflix-black/80 backdrop-blur-sm"
        >
          Back
        </Button>
      </div>

      {/* Hero Video Section */}
      <div className="relative w-full h-[58vh] sm:h-[65vh] md:h-[72vh] lg:h-[calc(100svh-4rem)] bg-black overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
        {isPlaying ? (
          <video
            className="w-full h-full object-contain md:object-cover"
            src={item.videoUrl || item.trailerUrl}
            controls
            // @ts-ignore
            controlsList="nodownload noplaybackrate"
            autoPlay
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {/* Background: prefer trailer video, fallback to image */}
            {item.trailerUrl ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={item.backgroundThumbnailUrl || item.thumbnailUrl}
                src={item.trailerUrl}
              />
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${item.backgroundThumbnailUrl || item.thumbnailUrl})` }}
              />
            )}

            {/* Readability gradients */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
            </div>
            
            {/* Content Info Overlay (bottom-left) */}
            <div className="absolute inset-0 flex items-end z-10 pointer-events-none">
              <div className="container mx-auto px-4 pb-6 sm:pb-10 md:pb-12 lg:pb-16">
                <div className="max-w-3xl">
                  <div className="pointer-events-auto flex items-center gap-3">
                    <PlayButton
                      size="lg"
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: document.body.clientHeight, behavior: 'smooth' }); }}
                    >
                      More Like This
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Anti-capture black overlay */}
        <div
          ref={overlayRef}
          className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 ${overlayActive ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-heading-2 text-white mb-6">{item.title}</h1>
              
              <p className="text-sm sm:text-base md:text-lg text-netflix-text-light leading-relaxed mb-6 md:mb-8">
                {item.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  variant="secondary"
                  size="md"
                  icon={isInWatchlist ? <HeartSolidIcon className="w-5 h-5 text-netflix-red" /> : <HeartIcon className="w-5 h-5" />}
                  onClick={handleAddToWatchlist}
                >
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={<ShareIcon className="w-5 h-5" />}
                  onClick={handleShare}
                >
                  Share
                </Button>

                <Button variant="ghost" size="md" icon={<HandThumbUpIcon className="w-5 h-5" />}>Like</Button>

                <Button variant="ghost" size="md" icon={<HandThumbDownIcon className="w-5 h-5" />}>Dislike</Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-heading-6 text-white mb-3">Cast</h3>
                {Array.isArray(item.cast) && item.cast.length > 0 ? (
                  <ul className="space-y-2">
                    {item.cast.slice(0, 8).map((c: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between text-body-small text-netflix-text-gray">
                        <span className="text-white/90">{c.name}</span>
                        {c.role && <span className="text-netflix-text-gray">{c.role}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-small text-netflix-text-gray">Cast information not available</p>
                )}
              </div>
              
              <div className="card p-6">
                <h3 className="text-heading-6 text-white mb-3">Genre</h3>
                <p className="text-body-small text-netflix-text-gray">
                  {item.genre || item.category}
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-heading-6 text-white mb-3">Director</h3>
                <p className="text-body-small text-netflix-text-gray">
                  {item.director || 'Director information not available'}
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-heading-6 text-white mb-3">Details</h3>
                <div className="space-y-2 text-body-small text-netflix-text-gray">
                  <div className="flex justify-between">
                    <span>Release Date:</span>
                    <span>{item.releaseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span>{typeof item.rating === 'object' ? item.rating.average : item.rating}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Content */}
        {relatedContent.length > 0 && (
          <div className="mt-16">
            <h2 className="text-heading-3 text-white mb-8">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {relatedContent.map((content) => (
                <ContentCard
                  key={content._id}
                  title={content.title}
                  image={content.thumbnailUrl || '/placeholder.jpg'}
                  year={content.releaseDate ? new Date(content.releaseDate).getFullYear() : '2024'}
                  rating={typeof content.rating === 'string' ? content.rating : 'PG-13'}
                  genres={[content.category]}
                  description={content.description}
                  onClick={() => router.push(`/watch/${content._id}`)}
                  onPlay={() => router.push(`/watch/${content._id}`)}
                  onAddToWatchlist={() => handleAddToWatchlist()}
                  onShare={() => handleShare()}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
