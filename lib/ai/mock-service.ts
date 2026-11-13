import { AIRequest, AIService, AIServiceError, WebJSONResult } from "./types";

// Offline fallback used when AI_PROVIDER=mock or no API key is configured.
// The sample data is factually accurate so the UI can be developed against it.

const SIMILAR = {
  found: true,
  reference: {
    name: "Aventus",
    brand: "Creed",
    concentration: "Eau de Parfum",
    releaseYear: 2010,
    fragranceFamily: "Chypre Fruity",
    keyNotes: ["pineapple", "bergamot", "black currant", "birch", "musk", "oakmoss"],
    character: "Juicy pineapple and citrus over a smoky birch and musky-mossy base.",
  },
  results: [
    {
      name: "Club de Nuit Intense Man",
      brand: "Armaf",
      relationship: "dupe",
      matchPercentage: 90,
      priceTier: "budget",
      sharedNotes: ["pineapple", "bergamot", "black currant", "birch"],
      keyDifference: "Smokier, more lemony opening and a less refined dry-down.",
      explanation: "One of the most widely compared Aventus alternatives, built on the same pineapple-birch structure.",
    },
    {
      name: "Explorer",
      brand: "Montblanc",
      relationship: "close-alternative",
      matchPercentage: 78,
      priceTier: "designer",
      sharedNotes: ["bergamot", "patchouli"],
      keyDifference: "Less fruity; leans on vetiver and ambroxan instead of pineapple.",
      explanation: "Shares the smoky-woody, ambery dry-down that many people associate with Aventus.",
    },
  ],
};

const FORMULA = {
  formulaName: "Lantern Rain",
  concept: "A walk through a wet pine forest at dusk, cool and resinous.",
  olfactiveFamily: "Woody Aromatic",
  description: "Crisp bergamot and fir needles → a cool, airy heart of Hedione and lavender → damp vetiver, cedar and soft ambery musk.",
  ingredients: [
    { name: "Bergamot oil FCF", role: "top", percentage: 12, dilution: "100%", reason: "Bright, slightly green citrus lift without phototoxicity.", substitutes: ["Lemon oil", "Petitgrain oil"], costTier: "medium", safetyNote: null },
    { name: "Fir balsam absolute", role: "top", percentage: 4, dilution: "10%", reason: "Resinous, jammy forest-needle note.", substitutes: ["Pine needle oil", "Siberian fir oil"], costTier: "medium", safetyNote: null },
    { name: "Lavender oil", role: "middle", percentage: 8, dilution: "100%", reason: "Herbal coolness that reads as evening air.", substitutes: ["Lavandin grosso oil"], costTier: "medium", safetyNote: "Contains linalool and limonene (declarable allergens)." },
    { name: "Hedione", role: "middle", percentage: 22, dilution: "100%", reason: "Transparent, airy radiance that diffuses the blend.", substitutes: ["Hedione HC"], costTier: "low", safetyNote: null },
    { name: "Iso E Super", role: "base", percentage: 20, dilution: "100%", reason: "Velvety cedar-like woodiness that wraps everything together.", substitutes: ["Georgywood"], costTier: "low", safetyNote: null },
    { name: "Vetiver oil (Haiti)", role: "base", percentage: 8, dilution: "100%", reason: "Earthy, damp-root character for the rainy feel.", substitutes: ["Vetiveryl acetate"], costTier: "medium", safetyNote: null },
    { name: "Cedarwood oil (Virginia)", role: "base", percentage: 10, dilution: "100%", reason: "Dry pencil-shaving wood for structure.", substitutes: ["Atlas cedarwood oil"], costTier: "low", safetyNote: null },
    { name: "Ambroxan", role: "base", percentage: 4, dilution: "10%", reason: "Mineral, ambery glow that boosts longevity.", substitutes: ["Cetalox"], costTier: "low", safetyNote: null },
    { name: "Galaxolide 50", role: "base", percentage: 12, dilution: "100%", reason: "Clean, soft musk to round off the dry-down.", substitutes: ["Habanolide", "Ethylene brassylate"], costTier: "low", safetyNote: null },
  ],
  timeline: {
    opening: "Sparkling citrus and crushed fir needles.",
    heart: "Cool lavender and airy floral transparency.",
    drydown: "Damp vetiver, cedar and a soft, skin-like ambery musk.",
  },
  recommendedConcentration: { type: "Eau de Parfum", percent: 18, why: "Enough woody base to last 6–8 hours without being heavy." },
  maceration: "Rest the concentrate 48 hours, then dilute in perfumer's alcohol and macerate 3–4 weeks in a cool, dark place.",
  tips: ["Pre-dilute fir balsam and Ambroxan to 10% before weighing.", "Weigh in grams on a 0.01 g scale rather than counting drops."],
  warnings: [],
};

const MATERIALS = {
  query: "iso e super",
  interpretation: "Iso E Super is a specific aroma chemical; related woody-ambery materials follow.",
  ingredients: [
    {
      id: "iso-e-super",
      name: "Iso E Super",
      otherNames: ["OTNE", "Tetramethyl acetyloctahydronaphthalenes"],
      type: "synthetic",
      family: "woody",
      scentProfile: ["velvety", "cedar-like", "ambery", "dry", "transparent"],
      description: "A soft, radiant woody-ambery material that smells of cedar and velvet. Used in large amounts to add volume and a 'skin halo'.",
      role: "base",
      volatility: "low",
      tenacity: "over 400 hours on a strip",
      typicalUsage: "5–25% of concentrate",
      typicalUsagePercent: 15,
      recommendedDilution: null,
      safety: "IFRA restricted at high levels in some categories; check the current IFRA standard.",
      allergens: [],
      pairsWith: ["Hedione", "Ambroxan", "Bergamot oil FCF"],
      substitutes: ["Georgywood", "Orbitone"],
      foundIn: [
        { name: "Molecule 01", brand: "Escentric Molecules" },
        { name: "Terre d'Hermès", brand: "Hermès" },
      ],
      costTier: "low",
    },
  ],
};

const DETAILS = {
  found: true,
  confidence: "high",
  perfume: {
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    concentration: "Eau de Parfum",
    releaseYear: 2015,
    perfumers: ["Francis Kurkdjian"],
    gender: "unisex",
    fragranceFamily: "Amber Floral",
    accords: [
      { name: "amber", strength: "dominant" },
      { name: "woody", strength: "prominent" },
      { name: "warm spicy", strength: "prominent" },
    ],
    notesStructure: "pyramid",
    notes: { top: ["saffron", "jasmine"], middle: ["amberwood", "ambergris"], base: ["fir resin", "cedar"] },
    performance: { longevity: "very long-lasting", sillage: "strong" },
    description: "Opens with an airy, burnt-sugar saffron and jasmine glow, settles into a mineral, ambery-woody heart, and dries down to a resinous cedar trail.",
    seasons: ["autumn", "winter", "spring"],
    occasions: ["evening", "date night", "office"],
    priceTier: "luxury",
  },
  sameNameAlternatives: [],
  suggestions: [],
};

export class MockAIService implements AIService {
  // Offline: no web access, so web lookups always come back "not found".
  async renderFromReference(): Promise<Buffer> {
    throw new AIServiceError("Bottle renders need an OpenAI API key.", 503);
  }

  async searchWebJSON(): Promise<WebJSONResult> {
    return { data: { found: false, perfume: null }, sources: [] };
  }

  async generateJSON(request: AIRequest): Promise<Record<string, unknown>> {
    switch (request.task) {
      case "similar-perfumes":
      case "notes-search":
        return structuredClone(SIMILAR);
      case "formula":
        return structuredClone(FORMULA);
      case "ingredient-search":
        return structuredClone(MATERIALS);
      case "perfume-details":
        return structuredClone(DETAILS);
      case "page-extraction":
      default:
        return {};
    }
  }
}
