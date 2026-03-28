"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SparklesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner, { ShimmerLoader } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import IngredientCard from "@/components/features/IngredientCard";
import { useSearchIngredients } from "@/lib/hooks/useSearchIngredients";
import { Ingredient } from "@/types";
import Badge from "@/components/ui/Badge";

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { search, results, loading, error, selectedIngredient, setSelectedIngredient } =
    useSearchIngredients();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      await search(searchQuery);
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pale-green to-emerald-400 mb-6 opacity-20">
            <MagnifyingGlassIcon className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6 bg-gradient-to-r from-[#46a1a3] via-pale-green to-emerald-400 bg-clip-text text-transparent">
            Ingredient Intelligence
          </h1>
          <p className="text-lg md:text-xl text-pale-purple/80 max-w-3xl mx-auto font-inter leading-relaxed">
            Explore premium fragrance ingredients with detailed profiles, supplier pricing, availability, and substitution options.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <Card variant="luxury" className="p-8 md:p-12">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search ingredients... (e.g., bergamot, sandalwood, jasmine, iso-e-super)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!searchQuery.trim() || loading}
                  isLoading={loading}
                  variant="luxury"
                  size="lg"
                  className="min-w-fit !border-0 !text-white bg-gradient-to-r from-[#46a1a3] via-pale-green to-emerald-400 shadow-premium hover:shadow-luxury hover:brightness-110"
                >
                  {loading ? "Searching..." : "Explore"}
                </Button>
              </div>
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
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <Card variant="luxury" className="p-12 text-center">
              <p className="text-pale-blue font-playfair text-2xl font-bold mb-8">Searching ingredient database...</p>
              <ShimmerLoader />
            </Card>
          </motion.div>
        )}

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
                {results.length} Ingredient{results.length !== 1 ? "s" : ""}
              </h2>
              <SparklesIcon className="w-6 h-6 text-pale-green" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => handleSelectIngredient(ingredient)}
                  className="cursor-pointer"
                >
                  <IngredientCard ingredient={ingredient} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty States */}
        {!loading && results.length === 0 && hasSearched && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-16 h-16 mx-auto" />}
              title="Ingredient not found"
              description={`No results for "${searchQuery}". Try searching with a different ingredient name or common fragrance term.`}
            />
          </motion.div>
        )}

        {!loading && results.length === 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyState
              icon={<SparklesIcon className="w-16 h-16 mx-auto" />}
              title="Explore Fragrance Ingredients"
              description="Search for specific ingredients to discover their scent profiles, recommended usage percentages, volatility, suppliers, and cost-effective substitutes."
            />
          </motion.div>
        )}

        {/* Ingredient Details Modal */}
        {selectedIngredient && (
          <Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedIngredient(null);
            }}
            title={selectedIngredient.name}
            size="lg"
          >
            <div className="space-y-8">
              {/* Description */}
              {selectedIngredient.description && (
                <p className="text-slate-300 leading-relaxed font-inter">
                  {selectedIngredient.description}
                </p>
              )}

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Role",
                    value: `${selectedIngredient.role} Note`.charAt(0).toUpperCase() +
                      `${selectedIngredient.role} Note`.slice(1),
                    icon: "🎯",
                  },
                  {
                    label: "Volatility",
                    value: selectedIngredient.volatility.charAt(0).toUpperCase() +
                      selectedIngredient.volatility.slice(1),
                    icon: "💨",
                  },
                  {
                    label: "Typical Usage",
                    value: `${selectedIngredient.typicalUsagePercent}%`,
                    icon: "📊",
                  },
                  {
                    label: "Type",
                    value: selectedIngredient.id,
                    icon: "🔬",
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="card-luxury p-5">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      {stat.label}
                    </p>
                    <p className="text-lg font-playfair font-bold text-pale-blue">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Scent Profile */}
              <div>
                <h3 className="text-sm font-semibold text-perfume-accent uppercase tracking-wide mb-4">
                  Scent Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.scentProfile.map((profile, idx) => (
                    <Badge key={`profile-${idx}`} variant="secondary" size="md">
                      {profile}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Supplier & Pricing */}
              {selectedIngredient.supplier && (
                <div className="card-luxury p-6">
                  <h3 className="text-sm font-semibold text-perfume-accent uppercase tracking-wide mb-4">
                    Market Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Supplier</span>
                      <span className="font-semibold text-pale-blue">
                        {selectedIngredient.supplier.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Price (per 100ml)</span>
                      <span className="font-semibold text-pale-green">
                        ${selectedIngredient.supplier.price?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Availability</span>
                      <Badge
                        variant={
                          selectedIngredient.supplier.availability === "in-stock"
                            ? "success"
                            : selectedIngredient.supplier.availability === "limited"
                              ? "warning"
                              : "primary"
                        }
                        size="sm"
                      >
                        {selectedIngredient.supplier.availability === "in-stock"
                          ? "In Stock"
                          : selectedIngredient.supplier.availability === "limited"
                            ? "Limited"
                            : "Backordered"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Substitutes */}
              {selectedIngredient.substitutes && selectedIngredient.substitutes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-perfume-accent uppercase tracking-wide mb-4">
                    Substitutes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredient.substitutes.map((substitute, idx) => (
                      <Badge key={`sub-${idx}`} variant="secondary" size="md">
                        {substitute}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
