'use client';

import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPlayerSettings() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Player Settings</h1>
          <p className="text-netflix-text-gray">Toggle autoplay, watermarking, DRM, subtitles (coming soon).</p>
        </div>
      </div>
    </div>
  );
}


