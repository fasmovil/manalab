export type ColorIdentitySymbol = 'W' | 'U' | 'B' | 'R' | 'G';

export interface CardCharacteristics {
  canonicalManaValue: number;
  normalTopLevelTypes: readonly string[];
  colorIdentity: readonly ColorIdentitySymbol[];
  hasAlternativeLandFace: boolean;
}

const colors = new Set<ColorIdentitySymbol>(['W', 'U', 'B', 'R', 'G']);

export function isCardCharacteristics(value: unknown): value is CardCharacteristics {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const types = candidate.normalTopLevelTypes;
  const identity = candidate.colorIdentity;
  return typeof candidate.canonicalManaValue === 'number' && Number.isFinite(candidate.canonicalManaValue) && candidate.canonicalManaValue >= 0
    && typeof candidate.hasAlternativeLandFace === 'boolean'
    && Array.isArray(types) && types.length > 0 && types.every(type => typeof type === 'string' && type.trim().length > 0) && new Set(types).size === types.length
    && Array.isArray(identity) && identity.every(color => typeof color === 'string' && colors.has(color as ColorIdentitySymbol)) && new Set(identity).size === identity.length;
}
