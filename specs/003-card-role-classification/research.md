# Research: Card Functional Role Classification

## Decision 1: Introduce a narrow intrinsic-card input boundary

**Decision**: Expose a pure card-level operation over an `IntrinsicCard` value
containing only canonical card identity and normalized intrinsic behavior.
`ResolvedDeckContent` remains an upstream source from which this input is
projected, but it is not passed to the classifier. No existing domain value
combines those two required facts without deck-context fields, so this narrow
value is necessary to enforce the boundary structurally.

**Rationale**: Import already owns parsing, exact resolution, aggregation, and
provider interaction. The narrowed input makes quantity, commander designation,
source-entry history, and all other deck facts inaccessible to the classifier,
directly enforcing the required deck-context independence.

**Alternatives considered**: Re-parsing or resolving during classification
duplicates import behavior and makes the result depend on provider state. A
deck-level analyzer would encourage strategic inference and obscures the
per-card output required now.

## Decision 2: Extend provider-neutral card facts with intrinsic behavior

**Decision**: Carry a ManaLab-owned intrinsic-behavior value alongside the
existing structural characteristics on exact resolution and resolved content.
The adapter translates provider-specific rules text, relevant keyword facts,
faces, behavior availability, and canonical observable Magic concepts into
that value. Raw provider records, layout labels, and DTO fields remain
adapter-only; Taxonomy v1 role interpretation remains outside the adapter.

**Rationale**: The current characteristics contain only mana value, types,
color identity, and a land-face flag. They cannot establish any Taxonomy v1
capability, nor explain a conclusion. Explicitly incomplete behavior permits
Unknown results without inventing facts.

**Alternatives considered**: Passing raw source cards violates provider
isolation. Rejecting a resolved card with absent behavior discards useful
identity and conflicts with explicit uncertainty. Supplying a fabricated empty
behavior would incorrectly make the card unclassified.

## Decision 3: Use a bounded deterministic taxonomy policy

**Decision**: Implement a deterministic domain policy limited to the 14
approved roles and the Magic semantics they require. It interprets the
adapter's provider-neutral observable facts across faces, modes, and alternate
costs, including Taxonomy v1 mappings such as Treasure to Mana Acceleration
and Clue/investigate to Card Draw. It does not attempt a general Magic rules
interpreter.

**Rationale**: The approved semantics require more than literal matching but
expressly bound the scope. Keeping provider normalization separate from
ManaLab-role interpretation gives a small reviewable policy ownership of
effect direction, controller ownership, stack behavior, and the required
token/keyword meaning without introducing opaque classification.

**Alternatives considered**: Literal text alone misses defined mechanics and
produces incorrect roles. A complete rules engine is unnecessary scope. AI or
LLM classification is prohibited and would violate determinism.

## Decision 4: Make roles additive and evaluate effect direction

**Decision**: Evaluate every relevant available behavior and union its
confirmed roles in canonical taxonomy order. Each rule checks who receives or
controls a resource or benefit. Ordinary land mana alone, incidental
conditional damage, and benefits granted only to another player do not qualify
on their own.

**Rationale**: This handles Ashnod's Altar, Faithless Looting, Cyclonic Rift,
Path to Exile, and Beast Within according to the specification without a
primary-role shortcut.

**Alternatives considered**: Choosing one dominant role loses card utility.
Ignoring recipients incorrectly labels Path to Exile as acceleration and Beast
Within as token generation.

## Decision 5: Scope uncertainty to the affected behavior

**Decision**: Emit a confirmed-role collection plus zero or more scoped
Unknown/Ambiguous issues. Emit an explicit unclassified conclusion only when
the available behavior was sufficient and no v1 role applies. Retain confirmed
roles even when another behavior is unresolved.

**Rationale**: A card can be partly understood. A global card status would
hide which conclusion is certain and conflicts with the specification's partial
classification requirement.

**Alternatives considered**: Failing the whole card loses confirmed value;
treating an incomplete card as no-role fabricates certainty; a single status
cannot faithfully represent a multi-role card with one uncertain aspect.

## Decision 6: Make explanations human-readable and domain-owned

**Decision**: Every result conclusion references a concise behavior summary and
its face or available behavior source. Unknown explanations name unavailable
behavior; Ambiguous explanations name the available behavior and why the
bounded policy cannot decide it. Explanations are not provider fields and do
not require separate evidence and inference object types.

**Rationale**: This meets traceability while keeping the public domain result
simple and stable for later presentation.

**Alternatives considered**: Opaque booleans are not reviewable. Exposing raw
provider payloads leaks the boundary. A mandatory two-object evidence model
adds representation requirements the product has not chosen.

## Decision 7: Separate legacy catalog incompatibility from missing behavior

**Decision**: Treat a persisted catalog generated before the required
intrinsic-behavior schema as incompatible and rebuild it through the existing
catalog compatibility policy. Separately, preserve a genuinely unavailable or
incomplete behavior source from current normalized card data as explicit
unavailable behavior so it can generate a scoped Unknown issue. New catalog
records preserve per-face behavior availability.

**Rationale**: A stale catalog schema is infrastructure/data freshness, not a
fact about a card. Rebuilding it prevents a legacy record from masquerading as
card uncertainty. Explicit availability states still let the classifier
truthfully distinguish genuinely missing current behavior from an understood
no-role card.

**Alternatives considered**: Synthesizing unavailable behavior for legacy
records confuses an upgrade requirement with an Unknown result. Treating any
absence as empty behavior mislabels cards as unclassified. Rejecting genuinely
incomplete current source data would discard valid resolved information that
the product requires to be reported as Unknown.

## Decision 8: Reuse library and testing seams

**Decision**: Export the pure operation and its types from `src/index.ts`.
Use the existing Node built-in test runner with pure classifier unit tests,
adapter-boundary catalog tests, and import-to-classification integration tests.

**Rationale**: ManaLab is a strict TypeScript Node library with deterministic
in-memory fixtures, not an application requiring an HTTP, UI, or persistence
contract.

**Alternatives considered**: A new service, UI, database, or test dependency
would introduce unsupported scope and duplicate the established architecture.
