'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FilmIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlayIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Content Management',
    href: '/admin',
    icon: FilmIcon,
  },
  {
    name: 'Featured Section',
    href: '/admin/featured',
    icon: HomeIcon,
  },
  {
    name: 'Hero Section',
    href: '/admin/hero',
    icon: PhotoIcon,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UsersIcon,
  },
  {
    name: 'Monetization',
    href: '/admin/monetization',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Player Settings',
    href: '/admin/player',
    icon: PlayIcon,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Cog6ToothIcon,
  },
];

export default function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-netflix-gray">
        <div className="w-8 h-8 bg-netflix-red rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">O</span>
        </div>
        <span className="ml-3 text-xl font-bold text-white">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-netflix-red text-white'
                  : 'text-netflix-text-gray hover:bg-netflix-gray hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-6 py-4 border-t border-netflix-gray">
        <Link
          href="/"
          className="flex items-center text-sm text-netflix-text-gray hover:text-white transition-colors"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          Back to Website
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-netflix-dark-gray p-2 rounded-lg text-white"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-netflix-dark-gray lg:border-r lg:border-netflix-gray">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-netflix-dark-gray border-r border-netflix-gray z-50">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
