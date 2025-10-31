'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ShowItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  trailerUrl?: string;
  genres?: string[];
  episodes?: number;
  rating: any;
}

export default function ShowsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    if (!loading && user && user.subscription?.status !== 'active') {
      router.push('/plans');
      return;
    }
    fetchShows();
    fetchCategories();
  }, [user, loading, router]);

  const fetchShows = async () => {
    try {
      const res = await fetch(`/api/content/shows`);
      const json = await res.json();
      const items: ShowItem[] = (json.data || []).map((c: any) => ({
        id: c._id,
        title: c.title,
        description: c.description,
        thumbnail: c.backgroundThumbnailUrl || c.thumbnailUrl,
        trailerUrl: c.trailerUrl || c.videoUrl,
        genres: c.genres || [],
        episodes: c.episodes || 0,
        rating: c.rating,
      }));
      setShows(items);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        const list = (json.data || []).map((c: any) => ({ _id: c._id, name: c.name })).filter((c: any) => !!c.name);
        setCategories(list);
      }
    } catch (e) {
      // silent
    }
  };

  const hero = shows[0];
  const allGenres = useMemo(() => {
    if (categories.length) {
      return ['all', ...categories.map((c) => c.name)];
    }
    const set = new Set<string>();
    shows.forEach((m) => (m.genres || []).forEach((g: string) => set.add(g)));
    return ['all', ...Array.from(set).sort()];
  }, [shows, categories]);

  const filterByGenre = (items: ShowItem[], genre: string) => {
    if (genre === 'all') return items;
    return items.filter((m) => (m.genres || []).includes(genre));
  };

  const filtered = useMemo(() => filterByGenre(shows, selectedGenre), [shows, selectedGenre]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white">Loading TV Shows...</div>
      </div>
    );
  }

  const Grid = () => (
    <section className="mb-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => router.push(`/watch/${m.id}`)}
            className="relative aspect-[2/3] rounded-lg overflow-hidden group"
          >
            <Image src={m.thumbnail} alt={m.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-left">
              <p className="text-white text-xs sm:text-sm font-semibold truncate">{m.title}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-netflix-black -mt-16">
      {/* Hero */}
      {hero && (
        <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
          {hero.trailerUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline poster={hero.thumbnail} src={hero.trailerUrl} />
          ) : (
            <Image src={hero.thumbnail} alt={hero.title} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 pb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">{hero.title}</h1>
              <p className="text-gray-200 max-w-xl mb-5 line-clamp-2">{hero.description}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push(`/watch/${hero.id}`)} className="btn btn-primary">
                  Play
                </button>
                <button onClick={() => router.push(`/watch/${hero.id}`)} className="btn btn-secondary">
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="container mx-auto px-4 py-10">
        {/* Genre filter */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-white text-sm">Genre:</label>
          <select
            className="px-3 py-2 bg-netflix-gray text-white rounded border border-gray-600 focus:border-netflix-red focus:outline-none"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g === 'all' ? 'All' : g.replace(/\b\w/g, (m) => m.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <Grid />
      </div>
    </div>
  );
}
