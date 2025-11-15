import { Sidebar } from '@/components/layout/Sidebar';

const learnerNavItems = [
  { href: '/learner', label: 'My Competencies', icon: 'BookOpen' },
  { href: '/learner/portfolio', label: 'Portfolio', icon: 'User' },
];

export default function LearnerLayout({ children }: { children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar navItems={learnerNavItems} />
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
