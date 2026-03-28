"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/solid";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center will-change-transform"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pale-green to-cyan-400 mb-6 opacity-20">
            <MagnifyingGlassIcon className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6 bg-gradient-to-r from-[#6c7ee7] via-[#4f9dd8] to-cyan-400 bg-clip-text text-transparent">
            Discover Your Signature Scent
          </h1>
          <p className="text-lg md:text-xl text-pale-purple/80 max-w-3xl mx-auto font-inter leading-relaxed">
            Find similar perfumes by searching a fragrance name or scent profile. Powered by advanced AI analysis.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-16 will-change-transform"
        >
          <Card variant="luxury" className="p-8 md:p-12">
            <form onSubmit={handleSearch} className="space-y-8">
              {/* Search Type Selector */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-pale-blue mb-5 tracking-wide">
                  Search by:
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "perfume" as const, label: "🧴 Perfume Name", desc: "Find similar fragrances" },
                    { value: "notes" as const, label: "🌸 Scent Notes", desc: "Search by fragrance profile" },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      className="flex-1 cursor-pointer group"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          searchType === option.value
                            ? "border-perfume-accent bg-perfume-accent/10 shadow-lg shadow-perfume-accent/20"
                            : "border-slate-700/50 bg-perfume-surface/30 hover:border-perfume-accent/70 hover:shadow-md hover:shadow-perfume-accent/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value={option.value}
                            checked={searchType === option.value}
                            onChange={(e) => setSearchType(e.target.value as "perfume" | "notes")}
                            className="w-4 h-4 accent-perfume-accent"
                          />
                          <div>
                            <div className="font-semibold text-pale-blue">{option.label}</div>
                            <div className="text-xs md:text-sm text-slate-400">{option.desc}</div>
                          </div>
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <Input
                placeholder={
                  searchType === "perfume"
                    ? "e.g., Dior Sauvage, Chanel No. 5, Creed Aventus"
                    : "e.g., bergamot, vanilla, woody, musk (comma-separated)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                label={searchType === "perfume" ? "Perfume Name" : "Scent Notes"}
              />

              {/* Search Button */}
              <Button
                type="submit"
                disabled={!query.trim() || loading}
                isLoading={loading}
                size="lg"
                variant="luxury"
                className="w-full !border-0 bg-gradient-to-r from-[#6c7ee7] via-[#4f9dd8] to-cyan-400 text-white shadow-premium hover:shadow-luxury hover:brightness-110"
              >
                {loading ? "Searching..." : "Discover Similar Perfumes"}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 font-medium">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner text="Finding similar perfumes..." />}

        {/* Results */}
        {!loading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-12">
              <SparklesIcon className="w-6 h-6 text-pale-green" />
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-pale-blue">
                {results.length} Similar Perfume{results.length !== 1 ? "s" : ""}
              </h2>
              <SparklesIcon className="w-6 h-6 text-pale-green" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((perfume, idx) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <PerfumeCard perfume={perfume} showSimilarity={true} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty States */}
        {!loading && results.length === 0 && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-16 h-16 mx-auto" />}
              title="No similar perfumes found"
              description={`We couldn't find any similar perfumes for "${query}". Try adjusting your search or browsing scent notes instead.`}
              action={{
                label: "Try Another Search",
                onClick: () => {
                  setQuery("");
                  setHasSearched(false);
                },
              }}
            />
          </motion.div>
        )}

        {!loading && results.length === 0 && !hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<SparklesIcon className="w-16 h-16 mx-auto" />}
              title="Start Your Discovery"
              description="Enter a perfume name or scent notes above to find similar fragrances matched by advanced AI analysis."
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
