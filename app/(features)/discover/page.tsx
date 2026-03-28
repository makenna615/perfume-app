"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ShimmerLoader } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import SimilarPerfumeCard from "@/components/features/PerfumeCard";
import PerfumeCard from "@/components/features/perfume-intelligence/PerfumeCard";
import NotesBreakdown from "@/components/features/perfume-intelligence/NotesBreakdown";
import AccordTags from "@/components/features/perfume-intelligence/AccordTags";
import PerformanceStats from "@/components/features/perfume-intelligence/PerformanceStats";
import BuyLinks from "@/components/features/perfume-intelligence/BuyLinks";
import { useSimilarPerfumes } from "@/lib/hooks/useSimilarPerfumes";
import { usePerfumeIntelligence } from "@/lib/hooks/usePerfumeIntelligence";

type SearchMode = "similar" | "notes" | "details";

export default function DiscoverPage() {
  const [searchType, setSearchType] = useState<SearchMode>("similar");
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const similarPerfumes = useSimilarPerfumes();
  const perfumeIntelligence = usePerfumeIntelligence();

  const isDetailsMode = searchType === "details";
  const loading = isDetailsMode ? perfumeIntelligence.loading : similarPerfumes.loading;
  const error = isDetailsMode ? perfumeIntelligence.error : similarPerfumes.error;

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setHasSearched(true);

    if (isDetailsMode) {
      try {
        await perfumeIntelligence.search(trimmed);
      } catch {
        // hook sets error state
      }
      return;
    }

    await similarPerfumes.search(trimmed, searchType === "similar" ? "perfume" : "notes");
  };

  const detailsResult = perfumeIntelligence.result;

  const handleSuggestionSelect = async (name: string, brand: string) => {
    const selectedQuery = `${name} ${brand}`.trim();
    setSearchType("details");
    setQuery(selectedQuery);
    setHasSearched(true);

    try {
      await perfumeIntelligence.search(selectedQuery);
    } catch {
      // hook sets error state
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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
            Find similar perfumes or explore perfume intelligence with notes, accords, performance, and buying options.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-16 will-change-transform"
        >
          <Card variant="luxury" className="p-8 md:p-12">
            <form onSubmit={handleSearch} className="space-y-8">
              <div>
                <label className="block text-sm md:text-base font-semibold text-pale-blue mb-5 tracking-wide">
                  Search by:
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      value: "similar" as const,
                      label: "Similar Perfumes",
                      desc: "Find fragrances with similar DNA",
                    },
                    {
                      value: "notes" as const,
                      label: "Scent Notes",
                      desc: "Search by fragrance profile",
                    },
                    {
                      value: "details" as const,
                      label: "Perfume Details",
                      desc: "Search by perfume name for in-depth analysis",
                    },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      className="cursor-pointer group"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
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
                            onChange={(e) => {
                              setSearchType(e.target.value as SearchMode);
                              setHasSearched(false);
                            }}
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

              <Input
                autoFocus
                placeholder={
                  searchType === "similar"
                    ? "e.g., Dior Sauvage, Chanel No. 5, Creed Aventus"
                    : searchType === "notes"
                      ? "e.g., bergamot, vanilla, woody, musk (comma-separated)"
                      : "e.g., Dior Sauvage, Baccarat Rouge 540, Black Orchid"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                label={
                  searchType === "similar"
                    ? "Similar Perfumes"
                    : searchType === "notes"
                      ? "Scent Notes"
                      : "Perfume Details"
                }
              />

              <Button
                type="submit"
                disabled={!query.trim() || loading}
                isLoading={loading}
                size="lg"
                variant="luxury"
                className="w-full !border-0 bg-gradient-to-r from-[#6c7ee7] via-[#4f9dd8] to-cyan-400 text-white shadow-premium hover:shadow-luxury hover:brightness-110"
              >
                {loading
                  ? "Searching..."
                  : searchType === "details"
                    ? "Search Perfume Details"
                    : "Discover Similar Fragrances"}
              </Button>
            </form>
          </Card>
        </motion.div>

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

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Card variant="luxury" className="p-8 md:p-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 border-4 border-slate-700/40 border-t-cyan-400 rounded-full animate-spin" />
              </div>
              <p className="text-center text-pale-blue font-semibold mb-6">
                {searchType === "details"
                  ? "Analyzing perfume details..."
                  : searchType === "notes"
                    ? "Analyzing scent notes..."
                    : "Finding similar perfumes..."}
              </p>
              <ShimmerLoader />
            </Card>
          </motion.div>
        )}

        {!loading && searchType !== "details" && similarPerfumes.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-12">
              <SparklesIcon className="w-6 h-6 text-pale-green" />
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-pale-blue">
                {similarPerfumes.results.length} Similar Perfume{similarPerfumes.results.length !== 1 ? "s" : ""}
              </h2>
              <SparklesIcon className="w-6 h-6 text-pale-green" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPerfumes.results.map((perfume, idx) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <SimilarPerfumeCard perfume={perfume} showSimilarity={true} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && searchType === "details" && hasSearched && detailsResult?.found && detailsResult.perfume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <PerfumeCard perfume={detailsResult.perfume} />

            <Card variant="luxury" className="p-6 md:p-8">
              <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-5">Notes Breakdown</h3>
              <NotesBreakdown
                top={detailsResult.perfume.notes.top}
                middle={detailsResult.perfume.notes.middle}
                base={detailsResult.perfume.notes.base}
              />
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card variant="luxury" className="p-6 md:p-8">
                <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-5">Accords</h3>
                <AccordTags accords={detailsResult.perfume.accords} />
              </Card>

              <Card variant="luxury" className="p-6 md:p-8">
                <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-5">Performance</h3>
                <PerformanceStats performance={detailsResult.perfume.performance} />
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card variant="luxury" className="p-6 md:p-8">
                <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-5">Pricing</h3>
                {detailsResult.perfume.pricing ? (
                  <div className="space-y-2 text-slate-300">
                    <p className="text-lg">
                      Average: <span className="text-pale-blue font-semibold">${detailsResult.perfume.pricing.averageUSD}</span>
                    </p>
                    <p>Size: {detailsResult.perfume.pricing.size}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No pricing data available.</p>
                )}
              </Card>

              <Card variant="luxury" className="p-6 md:p-8">
                <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-5">Where to Buy</h3>
                <BuyLinks availability={detailsResult.perfume.availability} />
              </Card>
            </div>
          </motion.div>
        )}

        {!loading && searchType === "details" && hasSearched && detailsResult && !detailsResult.found && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="luxury" className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-playfair font-bold text-pale-blue mb-2">
                {detailsResult.ambiguous ? "Multiple perfumes match this name" : "Perfume not found"}
              </h3>
              <p className="text-slate-300 mb-6">
                {detailsResult.ambiguous
                  ? "Please choose the correct brand option below and search again with the full name + brand."
                  : "We could not confidently identify that fragrance. Try one of these popular alternatives:"}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {detailsResult.suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.name}-${suggestion.brand}`}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion.name, suggestion.brand)}
                    className="text-left rounded-xl border border-slate-700/40 bg-perfume-surface/40 p-4 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-colors"
                  >
                    <p className="text-pale-blue font-semibold">{suggestion.name}</p>
                    <p className="text-sm text-pale-purple/80 mb-2">{suggestion.brand}</p>
                    <p className="text-sm text-slate-300">{suggestion.reason}</p>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {!loading && searchType !== "details" && similarPerfumes.results.length === 0 && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-16 h-16 mx-auto" />}
              title="No similar perfumes found"
              description={`We couldn't find any similar perfumes for "${query}". Try adjusting your search.`}
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

        {!loading && !hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<SparklesIcon className="w-16 h-16 mx-auto" />}
              title="Start Your Discovery"
              description="Search similar perfumes, explore note-based matches, or get detailed perfume intelligence."
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
