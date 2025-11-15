'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Competency, Rating, User } from '@/types';
import { CompetencyConverter, RatingConverter, UserConverter } from '@/lib/converters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { POCNotes } from '@/components/ui/poc-notes';

interface CompetencyFilter {
  competency_id: string;
  min_rating: number;
}

interface LearnerMatch {
  learner: User;
  matchedCompetencies: Array<{
    competency: Competency;
    average: number;
  }>;
}

export default function MasterSearchPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<CompetencyFilter[]>([]);
  const [currentCompetency, setCurrentCompetency] = useState('');
  const [currentMinRating, setCurrentMinRating] = useState<number>(2.0);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LearnerMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch competencies on mount
  useEffect(() => {
    const fetchCompetencies = async () => {
      const competenciesRef = collection(db, COLLECTION_NAMES.competencies).withConverter(CompetencyConverter);
      const snapshot = await getDocs(competenciesRef);
      setCompetencies(snapshot.docs.map(doc => doc.data()));
    };
    fetchCompetencies();
  }, []);

  const addFilter = () => {
    if (!currentCompetency) return;

    // Don't add duplicates
    if (selectedFilters.some(f => f.competency_id === currentCompetency)) return;

    const competencyTitle = competencies.find(c => c.id === currentCompetency)?.title || 'Competency';

    setSelectedFilters([...selectedFilters, {
      competency_id: currentCompetency,
      min_rating: currentMinRating,
    }]);

    // Reset form
    setCurrentCompetency('');
    setCurrentMinRating(2.0);

    // Show feedback
    toast.success(`Added: ${competencyTitle} (≥${currentMinRating.toFixed(1)})`);
  };

  const removeFilter = (competencyId: string) => {
    setSelectedFilters(selectedFilters.filter(f => f.competency_id !== competencyId));
  };

  const handleSearch = async () => {
    if (selectedFilters.length === 0) return;

    setSearching(true);
    setHasSearched(true);

    try {
      // Fetch all learners
      const usersRef = collection(db, COLLECTION_NAMES.users).withConverter(UserConverter);
      const learnersQuery = query(usersRef, where('roles', 'array-contains', 'learner'));
      const learnersSnap = await getDocs(learnersQuery);
      const learners = learnersSnap.docs.map(doc => doc.data());

      // Fetch all ratings
      const ratingsRef = collection(db, COLLECTION_NAMES.ratings).withConverter(RatingConverter);
      const ratingsSnap = await getDocs(ratingsRef);
      const allRatings = ratingsSnap.docs.map(doc => doc.data());

      // Filter learners based on criteria
      const matches: LearnerMatch[] = [];

      for (const learner of learners) {
        // Get this learner's completed ratings
        const learnerRatings = allRatings.filter(
          r => r.learner_id === learner.id && r.status === 'completed' && r.score !== undefined
        );

        // Group by competency and calculate averages
        const ratingsByCompetency = new Map<string, number[]>();
        for (const rating of learnerRatings) {
          if (!ratingsByCompetency.has(rating.competency_id)) {
            ratingsByCompetency.set(rating.competency_id, []);
          }
          ratingsByCompetency.get(rating.competency_id)!.push(rating.score!);
        }

        const averages = new Map<string, number>();
        for (const [compId, scores] of ratingsByCompetency) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          averages.set(compId, avg);
        }

        // Check if learner meets all filter criteria
        let meetsAllCriteria = true;
        const matchedCompetencies: Array<{ competency: Competency; average: number }> = [];

        for (const filter of selectedFilters) {
          const average = averages.get(filter.competency_id);

          // Check if competency is hidden
          const hiddenIds = learner.hidden_competency_ids || [];
          const isHidden = hiddenIds.includes(filter.competency_id);

          if (!average || average < filter.min_rating || isHidden) {
            meetsAllCriteria = false;
            break;
          }

          const competency = competencies.find(c => c.id === filter.competency_id);
          if (competency) {
            matchedCompetencies.push({ competency, average });
          }
        }

        if (meetsAllCriteria) {
          matches.push({ learner, matchedCompetencies });
        }
      }

      setResults(matches);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const getCompetencyTitle = (competencyId: string) => {
    return competencies.find(c => c.id === competencyId)?.title || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search for Talent</h1>
        <POCNotes>
          <p className="text-slate-600 mb-3 max-w-3xl">
            Search the student talent pool by specific skill requirements. Set competency thresholds (e.g., "Collaboration" ≥ 3.0) to find qualified candidates whose verified skills match your job or internship needs. This directly leverages the LERN's triple-rating system to answer the employer's biggest question: "How do I know this resume is real?"
          </p>
          <p className="text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <strong className="text-blue-900">How to use:</strong> Select a competency and set a minimum rating (0-4) to add search criteria.
            You can add multiple competencies to find candidates who meet all requirements.
            Click Search to see matching learner profiles.
          </p>
        </POCNotes>
      </div>

      {/* Search Form */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Build Your Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* Add Filter Form - Compact centered form */}
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white w-full max-w-md">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Competency</Label>
                  <Select value={currentCompetency} onValueChange={setCurrentCompetency}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select a competency" />
                    </SelectTrigger>
                    <SelectContent>
                      {competencies
                        .filter(c => !selectedFilters.some(f => f.competency_id === c.id))
                        .map(competency => (
                          <SelectItem key={competency.id} value={competency.id}>
                            {competency.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Minimum Rating: <span className="text-blue-600 font-bold">{currentMinRating.toFixed(1)}</span></Label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={currentMinRating}
                    onChange={(e) => setCurrentMinRating(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <Button
                  onClick={addFilter}
                  disabled={!currentCompetency}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Criteria
                </Button>
              </div>
            </div>
          </div>

          {/* Selected Filters as Tokens */}
          {selectedFilters.length > 0 && (
            <div>
              <Label className="text-slate-700 mb-2 block">Selected Criteria</Label>
              <div className="flex flex-wrap items-center gap-2">
                {selectedFilters.map(filter => (
                  <div key={filter.competency_id} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
                    <span className="font-medium">{getCompetencyTitle(filter.competency_id)}</span>
                    <span className="inline-flex items-center gap-1 bg-white border border-blue-300 text-blue-900 px-2 py-0.5 rounded font-bold text-xs">
                      <span className="text-blue-600">≥</span>
                      {filter.min_rating.toFixed(1)}
                    </span>
                    <button
                      onClick={() => removeFilter(filter.competency_id)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Button - Always visible */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button
              onClick={handleSearch}
              disabled={selectedFilters.length === 0 || searching}
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              {searching ? 'Searching...' : 'Search for Candidates'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Results */}
      {hasSearched && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {results.length === 0 ? 'No matches found' : `${results.length} ${results.length === 1 ? 'match' : 'matches'} found`}
          </h2>

          {results.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map(({ learner, matchedCompetencies }) => (
                <Link key={learner.id} href={`/profile/${learner.id}`} target="_blank" rel="noopener noreferrer">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{learner.display_name}</CardTitle>
                          <p className="text-sm text-slate-500">{learner.email}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">Matching Competencies:</p>
                        {matchedCompetencies.map(({ competency, average }) => (
                          <div key={competency.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{competency.title}</span>
                            <span className="font-medium text-blue-600">{average.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
