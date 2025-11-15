'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after 3 seconds
    const timeout = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Logo in top left */}
      <Link
        href="/"
        className="inline-flex items-center px-8 py-5 bg-white border-r-2 border-b-2 border-slate-200 rounded-br-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
      >
        <Image
          src="/lern-logo-black.png"
          alt="LERN"
          width={200}
          height={65}
          className="h-16 w-auto"
        />
      </Link>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">

        {/* 404 Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-900">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700">Page Not Found</h2>
          <p className="text-slate-600">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Redirect message */}
        <p className="text-sm text-slate-500">
          Redirecting to home page in 3 seconds...
        </p>

        {/* Home button */}
        <Link href="/">
          <Button className="mt-4">
            <Home className="w-4 h-4 mr-2" />
            Go Home Now
          </Button>
        </Link>
        </div>
      </div>
    </div>
  );
}
