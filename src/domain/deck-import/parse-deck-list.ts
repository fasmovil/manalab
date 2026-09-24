import type { ImportProblem, SourceEntry } from './import-result.js';

export interface ParseResult { entries: SourceEntry[]; problems: ImportProblem[] }
export function parseDeckList(rawText: string): ParseResult {
  let inCommanderSection = false; const entries: SourceEntry[] = []; const problems: ImportProblem[] = [];
  for (const [offset, sourceLine] of rawText.split(/\r?\n/).entries()) {
    const lineNumber = offset + 1; const trimmed = sourceLine.trim(); if (!trimmed) continue;
    if (/^(#|\/\/|;)/.test(trimmed)) { const entry: SourceEntry = { lineNumber, rawText: sourceLine, commanderDesignated: false, inlineCategoryMetadata: [] }; entries.push(entry); problems.push({ sourceEntry: entry, category: 'unsupported-syntax', explanation: 'Comments are not card entries.', contributesToImportedCardQuantity: false }); continue; }
    if (/^(commander|commanders)$/i.test(trimmed)) { inCommanderSection = true; continue; }
    if (/^(deck|mainboard|sideboard)$/i.test(trimmed)) { inCommanderSection = false; continue; }
    const categories = [...trimmed.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
    let body = trimmed.replace(/\s*\[[^\]]+\]/g, '').trim();
    const commanderDesignated = inCommanderSection || categories.some(c => /^commander(?:\{[^}]*\})?$/i.test(c.trim()));
    body = body.replace(/\s+\([^)]+\)\s+\d+$/i, '').trim();
    const entry: SourceEntry = { lineNumber, rawText: sourceLine, commanderDesignated, inlineCategoryMetadata: categories };
    const quantity = body.match(/^(\d+)\s*[xX]?\s+(.+)$/);
    if (quantity) { const parsedQuantity = Number(quantity[1]); if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity < 1) { problems.push({ sourceEntry: entry, category: 'invalid-quantity', explanation: 'Quantity must be a positive whole number.', contributesToImportedCardQuantity: false }); entries.push(entry); continue; } entry.parsedQuantity = parsedQuantity; entry.suppliedName = quantity[2].trim(); }
    else if (/^[-+]?\d+(?:\.\d+)?\s*[xX]?(?:\s|$)/.test(body)) { problems.push({ sourceEntry: entry, category: 'invalid-quantity', explanation: 'Quantity must be a positive whole number.', contributesToImportedCardQuantity: false }); entries.push(entry); continue; }
    else entry.parsedQuantity = 1, entry.suppliedName = body;
    if (entry.parsedQuantity !== undefined && entry.parsedQuantity < 1) problems.push({ sourceEntry: entry, category: 'invalid-quantity', explanation: 'Quantity must be a positive whole number.', contributesToImportedCardQuantity: false });
    else if (!entry.suppliedName) problems.push({ sourceEntry: entry, category: 'malformed-entry', explanation: 'A card entry requires a card name and positive quantity.', contributesToImportedCardQuantity: false });
    entries.push(entry);
  }
  return { entries, problems };
}
