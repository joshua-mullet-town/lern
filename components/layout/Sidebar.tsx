'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Home, User, ClipboardList } from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: string; // Icon name as string
}

interface SidebarProps {
  navItems?: NavItem[];
}

// Default educator nav items
const defaultNavItems = [
  { href: '/learners', label: 'Learners', icon: 'Users' },
  { href: '/competencies', label: 'Competencies', icon: 'BookOpen' },
];

// Icon mapping
const iconMap = {
  Home,
  BookOpen,
  Users,
  User,
  ClipboardList,
};

export function Sidebar({ navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white z-50">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <Link href="/" className="flex items-center h-16 px-6 bg-slate-800 hover:bg-slate-700 transition-colors">
            <Image src="/lern-logo-white.png" alt="LERN" width={200} height={70} className="h-auto w-full max-w-[100px]" />
          </Link>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-slate-400"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
