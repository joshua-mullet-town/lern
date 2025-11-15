'use client';

import { useState, useEffect } from 'react';
import { User, Competency, Rating, Artifact } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Copy, Check, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { CompetencyWithTrustBadges } from '@/components/public/CompetencyWithTrustBadges';
import { POCNotes } from '@/components/ui/poc-notes';

interface PortfolioManagerProps {
  learnerId: string;
  learner: User;
  competencies: { competency: Competency; ratings: Rating[]; average: number }[];
  artifacts: Artifact[];
}

export function PortfolioManager({ learnerId, learner, competencies, artifacts }: PortfolioManagerProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(
    new Set(learner.hidden_competency_ids || [])
  );
  const [displayOrder, setDisplayOrder] = useState<string[]>(
    learner.competency_display_order || competencies.map(c => c.competency.id)
  );
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    // Set URL only on client side to avoid SSR window reference
    setPublicUrl(`${window.location.origin}/profile/${learnerId}`);
  }, [learnerId]);

  const toggleVisibility = async (competencyId: string) => {
    const newHiddenIds = new Set(hiddenIds);
    if (newHiddenIds.has(competencyId)) {
      newHiddenIds.delete(competencyId);
    } else {
      newHiddenIds.add(competencyId);
    }

    setHiddenIds(newHiddenIds);

    // Save to Firestore
    setSaving(true);
    try {
      const response = await fetch('/api/learner/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          hiddenCompetencyIds: Array.from(newHiddenIds),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save visibility settings');
      }
    } catch (error) {
      console.error('Error saving visibility:', error);
      // Revert on error
      setHiddenIds(hiddenIds);
    } finally {
      setSaving(false);
    }
  };

  const moveCompetency = async (competencyId: string, direction: 'up' | 'down') => {
    const currentIndex = displayOrder.indexOf(competencyId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= displayOrder.length) return;

    const newOrder = [...displayOrder];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    setDisplayOrder(newOrder);

    // Save to Firestore
    setSaving(true);
    try {
      const response = await fetch('/api/learner/display-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          displayOrder: newOrder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save display order');
      }
    } catch (error) {
      console.error('Error saving display order:', error);
      // Revert on error
      setDisplayOrder(displayOrder);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleCount = competencies.length - hiddenIds.size;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Manager</h1>
        <POCNotes>
          <p>
            Control which competencies appear on your public profile. Toggle visibility, reorder items, and generate a shareable link to include in job applications or resumes. Employers visiting your link will see your verified ratings and work artifacts.
          </p>
        </POCNotes>
      </div>

      {/* Public Portfolio Preview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Public Portfolio
          </CardTitle>
          <CardDescription>
            Share your verified competencies with employers and educators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
            />
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-3">
            <Link href={`/profile/${learnerId}`} target="_blank">
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Portfolio
              </Button>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-slate-200">
              <Badge variant="secondary">{visibleCount}</Badge>
              <span className="text-sm text-slate-600">
                visible competenc{visibleCount === 1 ? 'y' : 'ies'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Manager */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Competencies</h2>
        {competencies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">No competencies with ratings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayOrder
              .map(id => competencies.find(c => c.competency.id === id))
              .filter(Boolean)
              .map((item, index) => {
                const { competency, ratings, average } = item!;
                const isVisible = !hiddenIds.has(competency.id);
                const competencyArtifacts = artifacts.filter(a =>
                  a.competency_ids.includes(competency.id)
                );
                const isFirst = index === 0;
                const isLast = index === displayOrder.length - 1;

                return (
                  <div
                    key={competency.id}
                    className="relative transition-all duration-300 ease-in-out"
                    style={{
                      transform: `translateY(0)`,
                      transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out'
                    }}
                  >
                    {/* Controls - attached to top right */}
                    <div className="flex justify-end relative z-10 pr-4">
                      <div className="flex items-center gap-3 bg-white rounded-t-lg border-2 border-b-white px-3 py-2">
                        {/* Reorder buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCompetency(competency.id, 'up')}
                            disabled={isFirst || saving}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCompetency(competency.id, 'down')}
                            disabled={isLast || saving}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Visibility toggle */}
                        <div className="flex items-center gap-3 border-l pl-3">
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-700">
                              {isVisible ? 'Visible' : 'Hidden'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {isVisible ? 'Public' : 'Private'}
                            </p>
                          </div>
                          <Switch
                            checked={isVisible}
                            onCheckedChange={() => toggleVisibility(competency.id)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Competency Card */}
                    <div className={`transition-opacity ${!isVisible ? 'opacity-40' : ''}`}>
                      <CompetencyWithTrustBadges
                        competency={competency}
                        ratings={ratings}
                        average={average}
                        artifacts={competencyArtifacts}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
