'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Trailer {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  thumbnail: string;
  backgroundThumbnail?: string;
  trailerUrl: string;
  category: string;
  duration: string;
  rating: string;
  ctaButton?: {
    text: string;
    action: 'play' | 'more_info';
    link?: string;
  };
}

interface TrailerCarouselProps {
  trailers: Trailer[];
}

export default function TrailerCarousel({ trailers }: TrailerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-slide every 15 seconds regardless of trailer duration
  useEffect(() => {
    if (!isPlaying) return;

    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === trailers.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); // 15 seconds per slide

    return () => clearTimeout(timeout);
  }, [isPlaying, trailers.length, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? trailers.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === trailers.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handlePlayTrailer = () => {
    const current = trailers[currentIndex];
    const link = current?.ctaButton?.link || (current?.id ? `/watch/${current.id}` : undefined);
    if (link) {
      window.location.href = link;
      return;
    }
    if (current?.trailerUrl) {
      window.open(current.trailerUrl, '_blank');
    }
  };

  if (!trailers || trailers.length === 0) {
    return (
      <div className="relative h-[70vh] bg-dark-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-lg">No trailers available</p>
      </div>
    );
  }

  const currentTrailer = trailers[currentIndex];

  return (
    <div
      className="relative h-[70vh] sm:h-[80vh] md:h-screen w-full overflow-hidden"
    >
      {/* Video Background with fallback image */}
      {currentTrailer.trailerUrl ? (
        <video
          key={currentTrailer.id}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={currentTrailer.backgroundThumbnail || currentTrailer.thumbnail}
          src={currentTrailer.trailerUrl}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentTrailer.backgroundThumbnail || currentTrailer.thumbnail})`,
          }}
        />
      )}

      {/* Gradient Overlays for readability */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top-to-transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Left-to-right for left-aligned text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        {/* Bottom emphasis to strengthen text contrast in lower region */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Content Overlay - left aligned minimal meta, no background panel */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="container mx-auto px-4 pb-6 sm:pb-10 md:pb-16 lg:pb-24 xl:pb-28">
          <div className="max-w-2xl text-left">
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {currentTrailer.title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {currentTrailer.description}
            </p>

            {/* Rating Only */}
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                Rating: {typeof currentTrailer.rating === 'object' ? (currentTrailer.rating.average || 'N/A') : (currentTrailer.rating || 'N/A')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {trailers.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Play/Pause Indicator */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          {isPlaying ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-1 h-4 bg-white mr-1"></div>
              <div className="w-1 h-4 bg-white"></div>
            </div>
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
