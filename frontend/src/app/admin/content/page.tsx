'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminContentManagement() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main admin page since we already have content management there
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center">
      <div className="text-white">Redirecting to Admin Dashboard...</div>
    </div>
  );
}
