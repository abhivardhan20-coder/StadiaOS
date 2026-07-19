export interface OpsPolicyResult {
  level: "normal" | "suggest" | "escalate";
  reasons: string[];
  suggestedActions: string[];
}

const DENSITY_ESCALATE = 85;
const DENSITY_SUGGEST = 75;

export function evaluateOpsPolicy(liveContext?: { zones?: { name: string; density: number }[]; alerts?: string[] }): OpsPolicyResult {
  const reasons: string[] = [];
  const suggestedActions: string[] = [];
  let level: OpsPolicyResult["level"] = "normal";

  for (const zone of liveContext?.zones ?? []) {
    if (zone.density >= DENSITY_ESCALATE) {
      level = "escalate";
      reasons.push(`${zone.name} density at ${zone.density}% (>= ${DENSITY_ESCALATE}%)`);
      suggestedActions.push(`Dispatch security/medical to ${zone.name}`);
    } else if (zone.density >= DENSITY_SUGGEST && level !== "escalate") {
      level = "suggest";
      reasons.push(`${zone.name} density at ${zone.density}% (>= ${DENSITY_SUGGEST}%)`);
      suggestedActions.push(`Consider opening overflow route near ${zone.name}`);
    }
  }

  if ((liveContext?.alerts ?? []).length > 0) {
    level = "escalate";
    reasons.push(...(liveContext?.alerts ?? []));
  }

  return { level, reasons, suggestedActions };
}
