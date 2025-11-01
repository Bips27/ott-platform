'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface HeroProps {
  user?: any;
}

function formatRating(r: any): string {
  if (r == null) return 'N/A';
  if (typeof r === 'object') {
    const avg = (r as any).average;
    return typeof avg === 'number' || typeof avg === 'string' ? String(avg) : 'N/A';
  }
  return String(r);
}

export default function Hero({ user }: HeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const featuredContent = {
    title: "The Ultimate Adventure",
    description: "Embark on an epic journey through uncharted territories. Experience breathtaking visuals and heart-pounding action in this blockbuster adventure.",
    rating: "PG-13" as any, // accept string | { average?: number }
    duration: "2h 15m",
    year: "2024",
    genre: "Adventure, Action"
  };

  const handlePlay = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    setIsPlaying(true);
    // Handle play functionality
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-800/80 to-dark-900/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Featured Content Info */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {featuredContent.title}
            </h1>
            
            <div className="flex items-center justify-center space-x-4 mb-4 text-sm text-gray-300">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                {formatRating(featuredContent.rating)}
              </span>
              <span>{featuredContent.year}</span>
              <span>{featuredContent.duration}</span>
              <span>{featuredContent.genre}</span>
            </div>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {featuredContent.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handlePlay}
              className="btn-netflix flex items-center space-x-2 px-8 py-4 text-lg font-semibold"
            >
              <PlayIcon className="w-6 h-6" />
              <span>{user ? 'Play Now' : 'Start Watching'}</span>
            </button>
            
            <button className="btn-outline flex items-center space-x-2 px-8 py-4 text-lg font-semibold bg-dark-800/50">
              <InformationCircleIcon className="w-6 h-6" />
              <span>More Info</span>
            </button>
          </div>

          {/* Call to Action for Non-Users */}
          {!user && (
            <div className="mt-12 p-6 bg-dark-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">
                Join Millions of Viewers
              </h3>
              <p className="text-gray-300 mb-4">
                Get unlimited access to thousands of movies, TV shows, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Link href="/register" className="btn-primary px-6 py-2">
                  Start Free Trial
                </Link>
                <Link href="/plans" className="text-primary-400 hover:text-primary-300 underline">
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent"></div>
    </section>
  );
}
