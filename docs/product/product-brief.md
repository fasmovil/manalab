# ManaLab — Product Brief

**Status:** Draft  
**Version:** 0.1  
**Initial Format:** Magic: The Gathering — Commander

## Product Vision

ManaLab helps Magic: The Gathering players understand and improve their
decks through structured, deterministic, and explainable analysis.

The initial product focuses on Commander.

ManaLab aims to move beyond descriptive deck statistics toward evidence-based
deck understanding and diagnosis.

> From deck statistics to deck understanding.

## Problem

Existing Magic tools can provide deck lists, card information, mana curves,
prices, card-type distributions, and other descriptive statistics.

However, players still need to interpret those data points to understand
questions such as:

- Is the deck structurally balanced?
- Does it have adequate access to resources?
- Does it depend too heavily on its Commander?
- Where are its main structural weaknesses?
- What evidence supports a particular diagnosis?

ManaLab aims to reduce the gap between having data about a deck and
understanding what those data mean for how the deck functions.

## Initial Target User

A Commander player who:

- already owns or is building a deck;
- understands at least the fundamentals of Magic;
- wants to understand or refine that deck;
- may have different levels of deck-building experience.

ManaLab should make its analytical results understandable without requiring
advanced deck-building expertise.

## Primary Job To Be Done

> I have this deck. Help me understand how it is built, what it does well,
> and where it may have problems.

The initial product analyzes existing decks rather than building decks
automatically from scratch.

## Product Direction

The initial analytical flow is:

Deck
→ Import
→ Normalize and Resolve Cards
→ Commander Validation
→ Functional Classification
→ Structural Analysis
→ Explainable Findings

ManaLab should evolve from factual information toward increasingly useful
interpretation while preserving evidence and uncertainty.

The conceptual knowledge levels are:

1. Fact
2. Metric
3. Classification
4. Pattern
5. Strategy
6. Finding
7. Recommendation
8. Card Recommendation

The initial product should focus approximately on:

**Fact → Metric → Classification → Basic Finding**

More advanced levels should only be introduced when ManaLab can support them
with sufficient evidence.

## Candidate Initial Capabilities

These are product capabilities under consideration, not a committed feature
backlog.

### Card Explorer

Search for Magic cards and inspect their factual card data.

ManaLab may later enrich card information with functional roles, Commander
context, relationships, and other ManaLab-specific knowledge.

### Deck Import

Initial import mechanisms under consideration:

- text-based deck lists;
- public Archidekt decks.

Text import should be tolerant of reasonable formatting differences and
normalize card identities internally.

Other deck providers such as Moxfield may be supported later.

### Commander Deck Validation

Validate deterministically verifiable Commander constraints, including where
applicable:

- deck size;
- Commander identification;
- singleton restrictions and exceptions;
- color identity;
- card legality.

### Functional Card Classification

Classify cards according to deck-building functions such as:

- ramp;
- card draw;
- removal;
- board wipes;
- protection;
- tutors;
- recursion;
- token generation;
- mana fixing.

Cards may have multiple functional roles.

Classification should preserve evidence and should allow uncertainty when a
reliable classification cannot be made.

### Structural Deck Analysis

Analyze dimensions such as:

- mana base;
- mana curve;
- color requirements;
- ramp;
- card advantage;
- interaction;
- protection;
- recursion;
- consistency tools;
- functional distribution;
- potentially Commander dependency.

### Explainable Findings

Transform metrics and classifications into findings backed by evidence.

A finding should conceptually preserve information such as:

- finding type;
- severity or significance when appropriate;
- supporting evidence;
- explanation;
- relevant cards or metrics.

## Product Principles

### Explainability Over Opaque Scoring

ManaLab should prefer evidence-backed explanations over arbitrary aggregate
scores.

"Potential early-game ramp issue because of X, Y, and Z" is preferable to an
unexplained "Deck Score: 72/100".

### Deterministic Analytical Core

Core analytical capabilities should be deterministic, reproducible,
explainable, and testable whenever reasonably possible.

### Evidence Before Recommendation

Future recommendations should derive from identifiable findings and evidence.

The desired conceptual flow is:

Evidence → Finding → Recommendation

### Explicit Uncertainty

ManaLab should represent unknown or insufficiently supported conclusions
rather than manufacture confidence.

## Generative AI

Generative AI is not required for the initial product or for core analytical
correctness.

The core analysis engine should function without OpenAI, Anthropic, Gemini,
or another LLM provider.

AI may later be introduced as an optional capability where it provides clear
value, for example by converting structured analytical results into more
natural explanations.

An LLM should not become the source of truth for deterministic analytical
results.

## External Data Sources

### Scryfall

Candidate primary source for canonical card data.

### Archidekt

Candidate external source for importing public user decks.

ManaLab should not make its internal deck representation dependent on
Archidekt's data model.

### Moxfield

Potential future deck-import source.

### EDHREC

Potential future source of Commander community and popularity context.

Community popularity should not automatically be interpreted as optimality.

## Initial Scope Boundaries

The initial product does not require:

- user accounts or authentication;
- persistent user deck libraries;
- deck history or version comparison;
- assisted deck building;
- Moxfield integration;
- matchup analysis;
- metagame analysis;
- advanced combo detection;
- advanced anti-synergy/nonbo detection;
- graph-based deck analysis;
- Monte Carlo simulation;
- automatic deck optimization;
- specific card-for-card replacement recommendations;
- universal power-level scoring;
- AI-powered deck analysis or chat;
- general support for every Magic format.

These boundaries protect the initial product from scope creep. They do not
imply that these capabilities are permanently rejected.

## Future Directions

Potential future product directions include:

### Assisted Deck Building

Help construct a deck starting from a Commander, strategy, constraints, or
other user goals.

### User Workspace

Accounts, persistent deck libraries, ownership, deck history, versions, and
comparison between revisions.

### Advanced Deck Intelligence

Strategy detection, contextual synergy, combos, anti-synergies, card
relationships, and evidence-backed recommendations.

### Simulation

Opening-hand analysis, land-drop probability, mana availability, Commander
casting probability, and other simulations.

### Optional AI Assistance

Natural-language explanations or conversational interaction built on top of
structured ManaLab analytical results.

## Open Product Questions

Questions intentionally left unresolved include:

- What should the initial functional-role taxonomy contain?
- How reliably can functional roles be derived from structured card data and
  Oracle text?
- Which findings can the first analysis engine responsibly produce?
- Can Commander dependency be measured meaningfully in an early version?
- Should Archidekt import belong to the first release or follow text import?
- Should Card Explorer belong to the first vertical slice or immediately
  follow it?

These questions should be resolved when the relevant product capability or
feature is scoped rather than prematurely.
