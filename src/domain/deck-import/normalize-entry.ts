import type { SourceEntry } from './import-result.js';
export const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
export const resolvableEntries = (entries: SourceEntry[]) => entries.filter(e => e.parsedQuantity && e.suppliedName).map(e => ({ entry: e, lookupName: normalizeName(e.suppliedName!) }));
