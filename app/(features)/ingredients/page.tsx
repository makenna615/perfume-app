"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const { search, results, loading, error, selectedIngredient, setSelectedIngredient } =
    useSearchIngredients();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await search(searchQuery);
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pale-blue via-perfume-accent to-pale-green bg-clip-text text-transparent mb-4">
            Ingredient Intelligence
          </h1>
          <p className="text-pale-purple/80 text-lg max-w-2xl">
            Search fragrance ingredients and inspect role, volatility,
            substitutes, supplier pricing, and availability.
          </p>
        </div>

        <Card className="p-8 mb-12 animate-scale-in">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <Input
                placeholder="Search ingredients... (e.g., bergamot, sandalwood, javanol)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!searchQuery.trim() || loading}
                isLoading={loading}
                size="lg"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
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
              {results.length} ingredient{results.length !== 1 ? "s" : ""} found
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((ingredient, idx) => (
                <div
                  key={ingredient.id}
                  onClick={() => handleSelectIngredient(ingredient)}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="animate-fade-in-up"
                >
                  <IngredientCard ingredient={ingredient} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && searchQuery && (
          <EmptyState
            icon="?"
            title="No ingredients found"
            description={`No result for "${searchQuery}". Try another ingredient name.`}
          />
        )}

        {!loading && results.length === 0 && !searchQuery && (
          <EmptyState
            icon="i"
            title="Start exploring"
            description="Search for fragrance ingredients to inspect profile, role, and supplier information."
          />
        )}

        {selectedIngredient && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={selectedIngredient.name}
            size="lg"
          >
            <div className="space-y-6">
              <p className="text-pale-purple/80 leading-relaxed">
                {selectedIngredient.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-perfume-surface rounded-lg p-4 border border-slate-700">
                  <p className="text-xs font-semibold text-perfume-accent/70 uppercase mb-1">
                    Role
                  </p>
                  <p className="text-lg font-bold text-pale-purple capitalize">
                    {selectedIngredient.role} Note
                  </p>
                </div>
                <div className="bg-perfume-surface rounded-lg p-4 border border-slate-700">
                  <p className="text-xs font-semibold text-perfume-accent/70 uppercase mb-1">
                    Volatility
                  </p>
                  <p className="text-lg font-bold text-pale-blue capitalize">
                    {selectedIngredient.volatility}
                  </p>
                </div>
                <div className="bg-perfume-surface rounded-lg p-4 border border-slate-700">
                  <p className="text-xs font-semibold text-perfume-accent/70 uppercase mb-1">
                    Typical Usage
                  </p>
                  <p className="text-lg font-bold text-pale-green">
                    {selectedIngredient.typicalUsagePercent}%
                  </p>
                </div>
                <div className="bg-perfume-surface rounded-lg p-4 border border-slate-700">
                  <p className="text-xs font-semibold text-perfume-accent/70 uppercase mb-1">
                    ID
                  </p>
                  <p className="text-sm font-mono text-pale-purple/70">
                    {selectedIngredient.id}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-perfume-accent mb-3">
                  Scent Profile
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.scentProfile.map((profile, idx) => (
                    <Badge key={`profile-${idx}`} variant="secondary" size="sm">
                      {profile}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedIngredient.supplier && (
                <div className="bg-perfume-surface rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-semibold text-perfume-accent mb-3">
                    Supplier & Availability
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-pale-purple/80">
                      Supplier:{" "}
                      <span className="font-semibold text-pale-blue">
                        {selectedIngredient.supplier.name}
                      </span>
                    </p>
                    <p className="text-pale-purple/80">
                      Price (per 100ml):{" "}
                      <span className="font-semibold text-pale-green">
                        ${selectedIngredient.supplier.price?.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-pale-purple/80">
                      Availability:{" "}
                      <span className="font-semibold text-pale-blue capitalize">
                        {selectedIngredient.supplier.availability}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {selectedIngredient.substitutes && selectedIngredient.substitutes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-perfume-accent mb-3">
                    Substitutes
                  </p>
                  <p className="text-pale-purple/80">
                    {selectedIngredient.substitutes.join(" • ")}
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
