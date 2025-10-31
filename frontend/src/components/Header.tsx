'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (isMenuOpen) {
      const prev = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => { body.style.overflow = prev; };
    } else {
      body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // On mount: ensure clean UI state and correct header background based on scroll position
  useEffect(() => {
    closeMenus();
    if (typeof window !== 'undefined') {
      setIsScrolled(window.scrollY > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close any open mobile/menus on route change (prevents showing previous state on reload/navigation)
  useEffect(() => {
    closeMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close menus when viewport becomes desktop to reset mobile UI state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMenus();
      }
    };
    window.addEventListener('resize', handleResize);
    // Run once on mount to ensure a clean state after reload
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-netflix-black/95 backdrop-blur-md border-b border-netflix-gray' 
        : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {typeof window !== 'undefined' && localStorage.getItem('platform_settings') && JSON.parse(localStorage.getItem('platform_settings') as string)?.logoUrl ? (
              <img
                src={JSON.parse(localStorage.getItem('platform_settings') as string)?.logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
              />
            ) : (
              <div className="w-10 h-10 bg-netflix-red rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">O</span>
              </div>
            )}
            {(() => {
              if (typeof window === 'undefined') return <span className="text-heading-5 text-white font-bold">OTT Platform</span>;
              const s = localStorage.getItem('platform_settings');
              if (!s) return <span className="text-heading-5 text-white font-bold">OTT Platform</span>;
              const parsed = JSON.parse(s);
              if (parsed?.showPlatformName === false) return null;
              const name = parsed?.platformName || 'OTT Platform';
              return <span className="text-heading-5 text-white font-bold">{name}</span>;
            })()}
          </Link>

          {/* Desktop Navigation (centered) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-6">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/movies" className="nav-link">
              Movies
            </Link>
            <Link href="/shows" className="nav-link">
              TV Shows
            </Link>
            <Link href="/plans" className="nav-link">
              Plans
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </nav>

          {/* Search - icon toggles input */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search movies, series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 md:w-56 lg:w-64 h-10 pl-4 pr-10 rounded-lg bg-netflix-gray text-white border border-gray-600 focus:border-netflix-red focus:outline-none placeholder:text-netflix-text-gray"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white transition-colors"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white p-2"
                  aria-label="Open search"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Show Subscribe button if user is not subscribed */}
                {user.subscription?.status !== 'active' && (
                  <Button variant="primary" size="sm" href="/plans">
                    Subscribe
                  </Button>
                )}
                
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="text-white transition-colors p-2"
                    aria-label="Notifications"
                  >
                    <BellIcon className="w-6 h-6" />
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-netflix-dark-gray rounded-lg shadow-xl border border-netflix-gray overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-netflix-gray text-white font-medium">Notifications</div>
                      <ul className="max-h-80 overflow-auto">
                        <li className="px-4 py-3 text-sm text-netflix-text-gray hover:bg-netflix-gray">No new notifications</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-white transition-colors p-2"
                    aria-label="User menu"
                  >
                    <UserCircleIcon className="w-8 h-8" />
                    <span className="hidden sm:block text-body text-white">{user.firstName}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-netflix-dark-gray rounded-lg shadow-xl border border-netflix-gray overflow-hidden">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-netflix-gray">
                          <p className="text-body font-medium text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-caption text-netflix-text-gray">{user.email}</p>
                        </div>
                        
                        <Link
                          href="/account"
                          className="flex items-center px-4 py-3 text-body text-netflix-text-gray hover:bg-netflix-gray hover:text-white transition-colors"
                          onClick={closeMenus}
                        >
                          <UserCircleIcon className="w-5 h-5 mr-3" />
                          My Account
                        </Link>
                        
                        <Link
                          href="/plans"
                          className="flex items-center px-4 py-3 text-body text-netflix-text-gray hover:bg-netflix-gray hover:text-white transition-colors"
                          onClick={closeMenus}
                        >
                          <BellIcon className="w-5 h-5 mr-3" />
                          Subscription
                        </Link>
                        
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-body text-netflix-text-gray hover:bg-netflix-gray hover:text-white transition-colors"
                            onClick={closeMenus}
                          >
                            <UserCircleIcon className="w-5 h-5 mr-3" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <hr className="border-netflix-gray my-2" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-body text-netflix-text-gray hover:bg-netflix-gray hover:text-white transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="primary" size="sm" href="/plans">
                  Subscribe
                </Button>
                <Button variant="secondary" size="sm" href="/login" className="hidden lg:inline-flex">
                  Login/Signup
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 shadow-md"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-7 h-7" />
              ) : (
                <Bars3Icon className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 lg:hidden pt-16 overflow-auto border-t border-netflix-gray bg-netflix-black/95 backdrop-blur-md z-50">
            <div className="max-w-md mx-auto w-full">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-netflix-gray">
                <Link href="/" onClick={closeMenus} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-netflix-red rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">O</span>
                  </div>
                  <span className="text-white font-semibold">Menu</span>
                </Link>
                <button onClick={closeMenus} className="text-white p-2 rounded-lg bg-white/10" aria-label="Close menu">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-0 px-2 py-2">
                <Link href="/" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">Home</span>
                </Link>
                <Link href="/movies" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">Movies</span>
                </Link>
                <Link href="/shows" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">Shows</span>
                </Link>
                <Link href="/plans" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">Plans</span>
                </Link>
                <Link href="/about" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">About</span>
                </Link>
                <Link href="/contact" className="nav-link" onClick={closeMenus}>
                  <span className="block w-full py-3 text-lg border-b border-netflix-gray">Contact</span>
                </Link>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative mt-4 px-2">
                  <input
                    type="text"
                    placeholder="Search movies, series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-4 pr-10 rounded-lg bg-netflix-gray text-white border border-gray-600 focus:border-netflix-red focus:outline-none placeholder:text-netflix-text-gray"
                  />
                  <button
                    type="submit"
                    className="absolute right-5 top-[calc(50%+1rem)] -translate-y-1/2 text-netflix-text-gray hover:text-white transition-colors"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </form>

                {/* Mobile Auth Actions */}
                <div className="mt-4 px-2 pb-6 space-y-2">
                  <Link href="/plans" onClick={closeMenus} className="btn btn-primary w-full justify-center">
                    Subscribe
                  </Link>
                  <Link href="/login" onClick={closeMenus} className="btn btn-secondary w-full justify-center">
                    Login/Signup
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
