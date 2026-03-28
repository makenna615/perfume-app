import { mockPerfumes } from "@/data/perfumes";
import { mockIngredients } from "@/data/ingredients";
import { Perfume, Ingredient } from "@/types";

export async function getPerfumeById(id: string): Promise<Perfume | null> {
  return mockPerfumes.find((p) => p.id === id) || null;
}

export async function getPerfumeByName(name: string): Promise<Perfume | null> {
  return (
    mockPerfumes.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
    null
  );
}

export async function getAllPerfumes(): Promise<Perfume[]> {
  return mockPerfumes;
}

export async function searchPerfumesByNotes(notes: string[]): Promise<Perfume[]> {
  const normalizedNotes = notes.map((n) => n.toLowerCase());
  return mockPerfumes.filter((perfume) => {
    const allNotes = [
      ...perfume.topNotes,
      ...perfume.middleNotes,
      ...perfume.baseNotes,
    ].map((n) => n.toLowerCase());
    return normalizedNotes.some((note) =>
      allNotes.some((pNote) => pNote.includes(note) || note.includes(pNote))
    );
  });
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  return mockIngredients.find((i) => i.id === id) || null;
}

export async function getIngredientByName(name: string): Promise<Ingredient | null> {
  return (
    mockIngredients.find((i) => i.name.toLowerCase() === name.toLowerCase()) ||
    null
  );
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  return mockIngredients;
}

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  const q = query.toLowerCase();
  return mockIngredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(q) ||
      ing.scentProfile.some((profile) => profile.toLowerCase().includes(q)) ||
      ing.description?.toLowerCase().includes(q)
  );
}
