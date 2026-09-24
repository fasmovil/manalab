import type { ImportResult } from './import-result.js';

export interface ImportCoverage {
  importedCardQuantity: number;
  resolvedCardQuantity: number;
  unresolvedCardQuantity: number;
  hasUnresolvedCommander: boolean;
  status: 'complete' | 'partial';
}

export function importCoverage(result: ImportResult): ImportCoverage {
  const resolvedCardQuantity = result.resolvedContent.reduce((total, entry) => total + entry.quantity, 0);
  const unresolved = result.problems.filter(problem => problem.contributesToImportedCardQuantity && typeof problem.sourceEntry.parsedQuantity === 'number');
  const unresolvedCardQuantity = unresolved.reduce((total, problem) => total + problem.sourceEntry.parsedQuantity!, 0);
  return { resolvedCardQuantity, unresolvedCardQuantity, importedCardQuantity: resolvedCardQuantity + unresolvedCardQuantity, hasUnresolvedCommander: unresolved.some(problem => problem.sourceEntry.commanderDesignated), status: unresolvedCardQuantity === 0 ? 'complete' : 'partial' };
}
