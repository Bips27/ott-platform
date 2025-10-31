'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const platformSettings = typeof window !== 'undefined' && localStorage.getItem('platform_settings')
    ? JSON.parse(localStorage.getItem('platform_settings') as string)
    : null;

  const platformName = platformSettings?.platformName || 'OTT Platform';

  return (
    <footer className="bg-dark-800 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        {/* Row 1: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Col 1: Logo + Description */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {platformSettings?.logoUrl ? (
                <img src={platformSettings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              ) : (
                <div className="w-8 h-8 bg-netflix-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
              )}
              {platformSettings?.showPlatformName !== false && (
                <span className="text-xl font-bold text-white">{platformName}</span>
              )}
            </Link>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for premium entertainment. Stream the latest movies, TV shows, and exclusive content anytime, anywhere.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/movies" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Movies</Link></li>
              <li><Link href="/shows" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">TV Shows</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-2">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Get the latest updates on new releases and exclusive content.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1 text-sm"
              />
              <button type="submit" className="btn-primary text-sm px-4">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Row 2: 2 Columns */}
        <div className="border-t border-gray-700 pt-8 grid grid-cols-1 md:grid-cols-2 items-center gap-4">
          <div className="text-gray-400 text-sm">
            © {currentYear} {platformName}. All rights reserved.
          </div>
          <div className="flex justify-start md:justify-end items-center gap-6 text-sm">
            <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
