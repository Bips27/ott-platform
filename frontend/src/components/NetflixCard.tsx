'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlayIcon, PlusIcon, ChevronDownIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlaySolidIcon } from '@heroicons/react/24/solid';

interface NetflixCardProps {
  content: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    type: 'movie' | 'series';
    duration?: string;
    episodes?: number;
    rating: string;
    category?: string;
  };
  size?: 'small' | 'medium' | 'large';
}

export default function NetflixCard({ content, size = 'medium' }: NetflixCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handlePlay = () => {
    router.push(`/watch/${content.id}`);
  };

  const handleMoreInfo = () => {
    router.push(`/details/${content.id}`);
  };

  const sizeClasses = {
    small: 'w-40 h-24',
    medium: 'w-64 h-36',
    large: 'w-80 h-44'
  };

  const containerClasses = {
    small: 'group cursor-pointer transition-all duration-300 hover:z-10',
    medium: 'group cursor-pointer transition-all duration-300 hover:z-20',
    large: 'group cursor-pointer transition-all duration-300 hover:z-30'
  };

  return (
    <div 
      className={containerClasses[size]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Main Image */}
        <div className={`relative ${sizeClasses[size]} bg-netflix-gray rounded-md overflow-hidden`}>
          <Image
            src={content.thumbnail}
            alt={content.title}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-netflix-gray animate-pulse" />
          )}

          {/* Play button overlay on hover */}
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handlePlay}
              className="bg-white/90 hover:bg-white text-black rounded-full p-2 transform transition-transform duration-200 hover:scale-110"
            >
              <PlaySolidIcon className="w-6 h-6 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Expanded info card on hover */}
        {isHovered && (
          <div className="absolute top-0 left-0 bg-netflix-dark-gray rounded-md shadow-2xl border border-netflix-gray pt-0 z-50 w-[300px] transform -translate-y-2">
            {/* Same image but slightly larger */}
            <div className="relative w-full h-40 bg-netflix-gray rounded-t-md overflow-hidden">
              <Image
                src={content.thumbnail}
                alt={content.title}
                fill
                className="object-cover"
                sizes="300px"
              />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Action buttons */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                <button
                  onClick={handlePlay}
                  className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
                >
                  <PlayIcon className="w-4 h-4" />
                </button>
                <button className="bg-netflix-gray/80 text-white rounded-full p-2 hover:bg-netflix-light-gray transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button className="bg-netflix-gray/80 text-white rounded-full p-2 hover:bg-netflix-light-gray transition-colors">
                  <HandThumbUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMoreInfo}
                  className="bg-netflix-gray/80 text-white rounded-full p-2 hover:bg-netflix-light-gray transition-colors ml-auto"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-semibold text-sm">98% Match</span>
                  <span className="border border-netflix-light-gray text-netflix-text-gray px-1 text-xs">
                    {typeof content.rating === 'object' ? content.rating.average || 'N/A' : content.rating}
                  </span>
                </div>
                <span className="text-netflix-text-gray text-sm">
                  {content.type === 'movie' ? content.duration : `${content.episodes} Episodes`}
                </span>
              </div>

              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">
                {content.title}
              </h3>

              <p className="text-netflix-text-gray text-xs line-clamp-3 leading-relaxed">
                {content.description}
              </p>

              {content.category && (
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-netflix-text-gray text-xs">
                    {content.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
