'use client';

import { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface IndexedJob {
  jobId: string;
  title: string;
  description: string;
}

interface MatchResult {
  jobId: string;
  response: string;
  match: number;
}

export default function JobMatchingPage() {
  const { user } = useAuth();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shortlistedJobs, setShortlistedJobs] = useState<IndexedJob[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data.tags))
      .catch(() => toast.error('Failed to fetch tags'));
  }, []);

  useEffect(() => {
    const input = searchTerm.trim().toLowerCase();
    if (!input) {
      setSuggestions(allTags.filter((tag) => !selectedTags.includes(tag)));
      return;
    }
    const filtered = allTags.filter((tag) =>
      tag.toLowerCase().includes(input) && !selectedTags.includes(tag)
    );
    setSuggestions(filtered);
  }, [searchTerm, allTags, selectedTags]);

  const addTag = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchTerm('');
    setDropdownOpen(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const fetchShortlistedJobs = async () => {
    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag.');
      return;
    }
    try {
      const res = await fetch('/api/jobmatch/indexed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags })
      });
      const data = await res.json();
      setShortlistedJobs(data.indexedJobs);
      if (data.indexedJobs.length === 0) {
        toast.warning('No jobs found for the selected filters. Try broadening your tags.');
      } else {
        toast.success(`${data.indexedJobs.length} jobs potentially match your requirements.`);
      }
    } catch (err) {
      toast.error('Error fetching shortlisted jobs');
    }
  };

  const runLLMMatching = async () => {
    if (!user?.resumeUrl) {
      toast.error('Please upload a resume first.');
      return;
    }
    if (!shortlistedJobs.length) {
      toast.error('Please shortlist jobs before running matching.');
      return;
    }
    setLoadingMatch(true);
    try {
      const cvRes = await fetch('/api/jobmatch/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl: user.resumeUrl })
      });
      const { text: cvText } = await cvRes.json();

      const aiRes = await fetch('/api/jobmatch/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobs: shortlistedJobs.map(({ jobId, description }) => ({ jobId, description }))
        })
      });
      const { matches } = await aiRes.json();

      if (!Array.isArray(matches)) {
        toast.warning('No valid job matches returned.');
        setMatches([]);
        return;
      }

      if (!matches.length) {
        toast.warning('No jobs matched your experience. Try adjusting your filters.');
      }
      setMatches(matches);
    } catch (err) {
      toast.error('AI matching failed');
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <main className="px-4 py-10 sm:px-8 flex justify-center">
      <div className="w-full sm:w-[80vw] lg:w-[50vw] space-y-8">
        <h1 className="text-2xl font-bold text-center">Gradsearch Demo AI: Personalized Job Matching</h1>

        <div ref={containerRef} className="relative w-full">
          <div
            className="flex flex-wrap min-h-[44px] items-center gap-2 border px-3 py-2 rounded-md bg-white text-black w-full focus-within:ring-2 ring-ring"
            onClick={() => {
              document.getElementById('tag-input')?.focus();
              setDropdownOpen(true);
            }}
          >
            <div className="flex flex-wrap gap-2 w-full">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ✕
                </Badge>
              ))}
              <input
                id="tag-input"
                type="text"
                className="flex-1 min-w-[200px] bg-transparent text-sm focus:outline-none"
                placeholder="Which fields are you interested in? (Start typing...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDropdownOpen(true);
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
                className="ml-auto text-gray-500 hover:text-black"
              >
                {dropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {dropdownOpen && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 border rounded-md max-h-60 overflow-y-auto bg-faintwhite text-sm text-black shadow-md z-10">
              {suggestions.map((tag) => (
                <li
                  key={tag}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button onClick={fetchShortlistedJobs}>Shortlist Jobs</Button>
          {shortlistedJobs?.length > 0 && (
            <span className="text-sm text-muted-foreground">
{shortlistedJobs.length} job{shortlistedJobs.length !== 1 ? 's' : ''} found, let's see what the AI has to say!
</span>
          )}
          {shortlistedJobs?.length > 0 && (
            <Button onClick={runLLMMatching} disabled={loadingMatch}>
              {loadingMatch ? 'Matching...' : 'Consult GradsearchAI'}
            </Button>
          )}
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {matches.map((match) => {
            const job = shortlistedJobs.find((j) => j.jobId === match.jobId);
            if (!job) return null;
            return (
              <Card key={match.jobId} className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{match.response}</p>
                  </CardContent>
                </div>
                <CardContent className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => window.open(`/jobs/apply/${match.jobId}`, '_blank')}
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
export const getServerSideProps = async () => ({ props: {} });
