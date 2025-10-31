'use client';

import React from 'react';
import { PlayIcon, PlusIcon, HeartIcon, ShareIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// ===== BUTTON COMPONENTS =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  className = '',
  disabled,
  href,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        {...(props as any)}
      >
        {loading ? (
          <div className="animate-pulse w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </a>
    );
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-pulse w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

// ===== PLAY BUTTON COMPONENT =====
interface PlayButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  onClick,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <button
      onClick={onClick}
      className={`btn btn-primary rounded-full p-0 ${sizeClasses[size]} ${className}`}
      aria-label="Play content"
    >
      <PlayIcon className="w-1/2 h-1/2 ml-0.5" />
    </button>
  );
};

// ===== CONTENT CARD COMPONENT =====
interface ContentCardProps {
  title: string;
  image: string;
  year?: string | number;
  rating?: string;
  genres?: string[];
  description?: string;
  onClick?: () => void;
  onPlay?: () => void;
  onAddToWatchlist?: () => void;
  onShare?: () => void;
  isInWatchlist?: boolean;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  image,
  year,
  rating,
  genres = [],
  description,
  onClick,
  onPlay,
  onAddToWatchlist,
  onShare,
  isInWatchlist = false,
  className = ''
}) => {
  return (
    <div 
      className={`content-card group ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative w-full h-full transform transition-all duration-300 ease-out hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-black/50 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={title}
          className="content-card-image"
          loading="lazy"
        />
        
        <div className="content-card-overlay" />
        
        <div className="content-card-info">
          <h3 className="content-card-title">{title}</h3>
          
          <div className="content-card-meta">
            {year && <span>{year}</span>}
            {rating && <span className="ml-2">• {rating}</span>}
            {genres.length > 0 && (
              <span className="ml-2">• {genres.slice(0, 2).join(', ')}</span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-netflix-text-gray mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="content-card-actions">
            <PlayButton
              size="md"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
            />
            
            <Button
              variant="ghost"
              size="sm"
              icon={isInWatchlist ? <HeartSolidIcon className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.();
              }}
              aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            />
            
            <Button
              variant="ghost"
              size="sm"
              icon={<ShareIcon className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
              aria-label="Share content"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== HERO SECTION COMPONENT =====
interface HeroSectionProps {
  title: string;
  description: string;
  backgroundImage: string;
  onPlay?: () => void;
  onMoreInfo?: () => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  backgroundImage,
  onPlay,
  onMoreInfo,
  className = ''
}) => {
  return (
    <section className={`relative h-screen flex items-center justify-center ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        <div className="text-center md:text-left">
          <h1 className="text-display text-white mb-6 animate-fade-in">
            {title}
          </h1>
          
          <p className="text-body-large text-netflix-text-light mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <PlayButton
              size="lg"
              onClick={onPlay}
              className="mr-4"
            />
            
            <Button
              variant="secondary"
              size="lg"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={onMoreInfo}
            >
              More Info
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronRightIcon className="w-6 h-6 text-white rotate-90" />
      </div>
    </section>
  );
};

// ===== SECTION HEADER COMPONENT =====
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-heading-4 text-white mb-2">{title}</h2>
        {subtitle && subtitle.trim() && (
          <p className="text-body-small text-netflix-text-gray">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// ===== CONTENT GRID COMPONENT =====
interface ContentGridProps {
  items: Array<{
    id: string;
    title: string;
    image: string;
    year?: string | number;
    rating?: string;
    genres?: string[];
    description?: string;
  }>;
  onItemClick?: (item: any) => void;
  onPlay?: (item: any) => void;
  onAddToWatchlist?: (item: any) => void;
  onShare?: (item: any) => void;
  className?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  onItemClick,
  onPlay,
  onAddToWatchlist,
  onShare,
  className = ''
}) => {
  return (
    <div className={`grid-responsive ${className}`}>
      {items.map((item) => (
        <ContentCard
          key={item.id}
          title={item.title}
          image={item.image}
          year={item.year}
          rating={item.rating}
          genres={item.genres}
          description={item.description}
          onClick={() => onItemClick?.(item)}
          onPlay={() => onPlay?.(item)}
          onAddToWatchlist={() => onAddToWatchlist?.(item)}
          onShare={() => onShare?.(item)}
        />
      ))}
    </div>
  );
};

// ===== LOADING SPINNER COMPONENT =====
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-netflix-gray border-t-netflix-red ${sizeClasses[size]} ${className}`} />
  );
};

// ===== MODAL COMPONENT =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-netflix-dark-gray rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-netflix-gray">
            <h2 className="text-heading-5 text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-netflix-text-gray hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===== TOAST COMPONENT =====
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-green-900 border-green-500 text-green-200',
    error: 'bg-red-900 border-red-500 text-red-200',
    warning: 'bg-yellow-900 border-yellow-500 text-yellow-200',
    info: 'bg-blue-900 border-blue-500 text-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-toast max-w-sm w-full bg-opacity-90 backdrop-blur-sm border rounded-lg p-4 shadow-xl ${typeStyles[type]} animate-slide-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
