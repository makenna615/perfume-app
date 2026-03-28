"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import PerfumeCard from "@/components/features/PerfumeCard";
import { useSimilarPerfumes } from "@/lib/hooks/useSimilarPerfumes";

export default function DiscoverPage() {
  const [searchType, setSearchType] = useState<"perfume" | "notes">("perfume");
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { search, results, loading, error } = useSimilarPerfumes();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      await search(query, searchType);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pale-green via-perfume-accent to-pale-blue bg-clip-text text-transparent mb-4">
            🔍 Discover Similar Perfumes
          </h1>
          <p className="text-pale-purple/80 text-lg max-w-2xl">
            Find your next favorite fragrance by searching a perfume name or scent notes. Powered by AI.
          </p>
        </div>

        <Card className="p-8 mb-16 animate-scale-in">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-perfume-accent mb-4">
                Search by:
              </label>
              <div className="flex gap-4">
                {[
                  { value: "perfume", label: "Perfume Name" },
                  { value: "notes", label: "Scent Notes" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      value={option.value}
                      checked={searchType === option.value}
                      onChange={(e) => setSearchType(e.target.value as "perfume" | "notes")}
                      className="mr-3 w-4 h-4 rounded-full accent-perfume-accent"
                    />
                    <span className="text-perfume-accent/80 group-hover:text-perfume-accent transition-colors">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Input
                placeholder={
                  searchType === "perfume"
                    ? "e.g., Dior Sauvage, Chanel No. 5"
                    : "e.g., bergamot, vanilla, woody (comma-separated)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                label={searchType === "perfume" ? "Perfume Name" : "Scent Notes"}
              />
            </div>

            <Button
              type="submit"
              disabled={!query.trim() || loading}
              isLoading={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Searching..." : "Find Similar Perfumes"}
            </Button>
          </form>
        </Card>

        {error && (
          <Card className="p-6 bg-red-500/10 border border-red-500/30 mb-8 animate-fade-in">
            <p className="text-red-400 font-medium">{error}</p>
          </Card>
        )}

        {loading && <LoadingSpinner />}

        {!loading && results.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pale-green to-pale-purple bg-clip-text text-transparent mb-8">
              ✨ {results.length} similar perfume{results.length !== 1 ? "s" : ""} found
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((perfume, idx) => (
                <div key={perfume.id} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-fade-in-up">
                  <PerfumeCard
                    perfume={perfume}
                    showSimilarity={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && hasSearched && (
          <EmptyState
            icon="🔎"
            title="No results found"
            description={`We couldn't find any similar perfumes for "${query}". Try a different search term.`}
            action={{
              label: "Clear Search",
              onClick: () => {
                setQuery("");
                setHasSearched(false);
              },
            }}
          />
        )}

        {!loading && results.length === 0 && !hasSearched && (
          <EmptyState
            icon="🧴"
            title="Start discovering"
            description="Search for a perfume name or enter scent notes to find similar fragrances."
          />
        )}
      </div>
    </div>
  );
}
