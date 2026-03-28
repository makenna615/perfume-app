import { Perfume } from "@/types";
import { perfumeSimilarity } from "@/data/substitutes";
import { mockPerfumes } from "@/data/perfumes";

export function calculateNoteSimilarity(
  perfume1: Perfume,
  perfume2: Perfume
): { shared: string[]; percentage: number } {
  const allNotes1 = [
    ...perfume1.topNotes,
    ...perfume1.middleNotes,
    ...perfume1.baseNotes,
  ];
  const allNotes2 = [
    ...perfume2.topNotes,
    ...perfume2.middleNotes,
    ...perfume2.baseNotes,
  ];

  const shared = allNotes1.filter((note) =>
    allNotes2.some((n) => n.toLowerCase() === note.toLowerCase())
  );

  const percentage = (shared.length / Math.max(allNotes1.length, allNotes2.length)) * 100;

  return { shared, percentage: Math.round(percentage) };
}

export function getSimilarPerfumes(
  perfumeId: string
): { id: string; similarity: number }[] {
  const similarIds = perfumeSimilarity[perfumeId] || [];
  const basePerfume = mockPerfumes.find((p) => p.id === perfumeId);

  if (!basePerfume) return [];

  return similarIds
    .map((id) => {
      const otherPerfume = mockPerfumes.find((p) => p.id === id);
      if (!otherPerfume) return null;

      const { percentage } = calculateNoteSimilarity(basePerfume, otherPerfume);
      return { id, similarity: percentage };
    })
    .filter((item) => item !== null) as { id: string; similarity: number }[];
}
