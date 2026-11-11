import Link from "next/link";
import type { Material } from "@/types";
import Tag, { LAYER_DOT, LAYER_LABEL } from "@/components/ui/Tag";
import Notice from "@/components/ui/Notice";
import { COST_LABEL, capitalize } from "@/lib/format";

function Fact({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="border-t border-line py-3">
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

function MaterialLinks({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {items.map((item) => (
        <Link key={item} href={`/ingredients?q=${encodeURIComponent(item)}`} className="link">
          {item}
        </Link>
      ))}
    </span>
  );
}

export default function MaterialDetail({ material }: { material: Material }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        <Tag tone={material.role}>
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${LAYER_DOT[material.role]}`} />
          {LAYER_LABEL[material.role]} note
        </Tag>
        <Tag>{capitalize(material.type)}</Tag>
        {material.family && <Tag>{capitalize(material.family)}</Tag>}
      </div>

      <p className="leading-relaxed text-ink-soft">{material.description}</p>

      {material.scentProfile.length > 0 && (
        <p className="font-display text-xl italic text-resin">{material.scentProfile.join(" · ")}</p>
      )}

      {material.safety && (
        <Notice tone="warning" title="Safety & IFRA">
          {material.safety}
        </Notice>
      )}

      <dl>
        <Fact label="Typical use" value={material.typicalUsage} />
        <Fact label="Evaluate at" value={material.recommendedDilution} />
        <Fact label="Life on a smelling strip" value={material.tenacity} />
        <Fact label="Volatility" value={capitalize(material.volatility)} />
        <Fact
          label="Cost"
          value={material.costTier && `${COST_LABEL[material.costTier].symbol} · ${COST_LABEL[material.costTier].label}`}
        />
        <Fact label="Also known as" value={material.otherNames.length > 0 && material.otherNames.join(", ")} />
        <Fact label="Pairs with" value={material.pairsWith.length > 0 && <MaterialLinks items={material.pairsWith} />} />
        <Fact label="Substitutes" value={material.substitutes.length > 0 && <MaterialLinks items={material.substitutes} />} />
        <Fact
          label="Famously used in"
          value={
            material.foundIn.length > 0 && (
              <span className="flex flex-wrap gap-x-3 gap-y-1">
                {material.foundIn.map((p) => (
                  <Link
                    key={`${p.name}-${p.brand}`}
                    href={`/discover?mode=details&q=${encodeURIComponent(`${p.name} by ${p.brand}`)}`}
                    className="link"
                  >
                    {p.name}
                    {p.brand && <span className="text-ink-faint"> ({p.brand})</span>}
                  </Link>
                ))}
              </span>
            )
          }
        />
        <Fact
          label="EU-declarable allergens"
          value={material.allergens.length > 0 && material.allergens.join(", ")}
        />
      </dl>

      <Link
        href={`/builder?mode=ingredients&q=${encodeURIComponent(material.name)}`}
        className="link inline-block text-sm"
      >
        Start a formula with {material.name} →
      </Link>
    </div>
  );
}
