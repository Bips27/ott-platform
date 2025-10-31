'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlayIcon, PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'movie' | 'series';
  duration?: string;
  episodes?: number;
  rating: string;
}

interface ContentGridProps {
  content: ContentItem[];
  loading: boolean;
}

export default function ContentGrid({ content, loading }: ContentGridProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();

  const handlePlay = (item: ContentItem) => {
    router.push(`/watch/${item.id}`);
  };

  const handleAddToList = (item: ContentItem) => {
    // Handle add to list functionality
    console.log('Added to list:', item.title);
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (loading) {
    return (
      <div className="content-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="skeleton h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="content-grid">
      {content.map((item) => (
        <div
          key={item.id}
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* Content Card */}
          <div className="card overflow-hidden">
            {/* Thumbnail */}
            <div className="relative aspect-[2/3] bg-gray-800">
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Action Buttons */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(item);
                    }}
                    className="bg-white/90 hover:bg-white text-black p-2 rounded-full transition-colors duration-200"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToList(item);
                    }}
                    className="bg-dark-800/90 hover:bg-dark-700 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="bg-dark-800/90 hover:bg-dark-700 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    {favorites.includes(item.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content Info */}
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm mb-1 truncate">
                {item.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-600 text-white px-1 py-0.5 rounded text-xs">
                    {typeof item.rating === 'object' ? item.rating.average || 'N/A' : item.rating}
                  </span>
                  <span>{item.type === 'movie' ? item.duration : `${item.episodes} Episodes`}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hover Info */}
          {hoveredItem === item.id && (
            <div className="absolute top-0 left-0 right-0 bg-dark-800 rounded-lg p-3 shadow-lg z-10 transform -translate-y-2">
              <h4 className="font-semibold text-white text-sm mb-2">
                {item.title}
              </h4>
              <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.type === 'movie' ? item.duration : `${item.episodes} Episodes`}</span>
                <span className="bg-green-600 text-white px-1 py-0.5 rounded">
                  {typeof item.rating === 'object' ? item.rating.average || 'N/A' : item.rating}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
