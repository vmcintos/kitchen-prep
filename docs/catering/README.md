# Catering menu workbook: future plan

Status: planning and handoff only. The first deliverable is a standalone Excel workbook; a larger application or catalog integration is not required for that prototype. This document contains no production recipe, inventory, cost, customer, or personal data.

## Purpose

Reduce the work of translating an existing catering menu into specific, approved institutional recipes that use ingredients already stocked. Recipe selection and substitution are the main problem. Pricing calculations support that workflow; they are not a substitute for finding the right source recipes.

The planner should be able to start with a rough menu, identify suitable catalog recipes from a permitted subset, compare ingredient overlap and shortages, record verified food cost, and choose a customer selling price. Preserve the planner's menu and decisions rather than silently rewriting them.

## Working environment

- Excel is the working surface. A conventional workbook must remain useful without an AI subscription, macros, network access, or a command-line agent.
- Free Microsoft Copilot can optionally help interview the planner, organize a menu, or explain proposed substitutions. Do not assume licensed Copilot-in-Excel editing, agent mode, connectors, or unlimited usage.
- Treat PRIMA or another institutional recipe catalog as a separately controlled source. Catalog access, export formats, bulk export, pricing basis, and integration permissions are not yet verified.
- A workplace SharePoint assistant may provide information that Copilot cannot. Verify its approved capabilities before designing a handoff. Its existence is not evidence of an API or export permission.
- Start with permitted files or manual entry. Do not make the prototype depend on building a connector.

## First workbook boundary

The prototype should contain:

1. **Start Here:** concise instructions for the human and optional assistant; input sequence; source-data rules; what to do when information is missing.
2. **Menu:** desired dishes, category, servings, selected recipe identifier, permitted substitution notes, status, and final decision.
3. **Recipe records:** catalog identifier, approved subset, version or source date, yield and portion unit, recorded cost, cost basis, and source reference.
4. **Ingredient and inventory records:** recipe quantities, stock quantities, explicit units, supported conversion factors, and availability date where known.
5. **Pricing:** verified food cost per serving, selected target food-cost percentages, calculated selling-price scenarios, optional AI suggestion with rationale, and the human-approved final selling price.
6. **Review:** missing sources, inconsistent units, ambiguous matches, shortages, and decisions requiring human attention.

These are logical sections, not a requirement to rename or recreate an already delivered workbook. Inspect the current workbook before extending it. Preserve formulas, validation, formatting, and working examples.

## Data handoff to resolve later

| Input | First useful route | Unresolved question |
| --- | --- | --- |
| Draft menu | Paste or enter from Word/Excel | Which fields are worth standardizing? |
| Inventory | User-provided Excel export or manual rows | Exact columns, units, item identifiers, and stock freshness |
| Individual recipe | Permitted recipe export or manual entry | Yield, ingredient quantities, current cost basis, and revision fields |
| Catalog subset | User-selected permitted records | Can the exact institutional/K–12 subset be exported or filtered? |
| Larger catalog | Defer | Is an authorized bulk export or supported integration available? |
| Workplace assistant output | Optional user-mediated copy | What can it retrieve, cite, and export under workplace policy? |

Ask for one permitted sample export with operational content removed before building import code. A column-only example or sanitized schema is sufficient for initial mapping. Do not ask for credentials or use browser scraping to bypass the source system.

## Calculation and source rules

- Keep recorded source cost separate from calculated or suggested selling prices. Unknown recorded cost stays blank and is visibly flagged; never fill it with an AI guess.
- Record whether a cost is per batch, portion, weight, or package. Only convert it to cost per serving when yield and units are compatible.
- Target selling price = verified food cost per serving / target food-cost fraction. Fractions must be greater than zero and no greater than one. A food-cost target is not a markup percentage or a claim about net profit.
- Record AI-recommended customer price separately with its assumptions. It must not overwrite source cost or the human-approved final price.
- Include labor, packaging, delivery, overhead, and tax only when the planner provides the relevant assumptions. Label food-cost-only scenarios accordingly.
- Sum demand across all selected recipes before comparing it with inventory. Do not allocate the same stock independently to every dish.
- Convert ingredient units only through explicit compatible conversions. Missing conversions and ambiguous ingredient matches require review, not a plausible-looking result.
- Show stock overlap as an aid to selection, not proof that a menu is feasible. Dietary restrictions, allergens, equipment, preparation time, holding/service constraints, and food-safety requirements still need human review.

## Low-effort sequence after the prototype

1. **Try a small real menu in the workbook.** The planner selects a few permitted recipe records and checks the result. Fix the largest usability problems before adding infrastructure.
2. **Map one real export.** Build a simple import template or Power Query mapping only if the available Excel version supports it and the sample demonstrates a repeatable structure. Preserve the raw input unchanged in the authorized work environment.
3. **Add transparent recipe matching.** Filter by approved catalog subset, then compare normalized ingredient identifiers and available stock. Show a short ranked list with reasons, missing ingredients, and unresolved constraints. The planner chooses; no automatic substitution.
4. **Improve the repeat workflow.** Add only features demonstrated to save time: reusable menu templates, portion scaling, clear shortage lists, printable customer menu, or a costing summary.
5. **Consider an application or connector only after the file workflow works.** Confirm data access, workplace permissions, maintenance owner, actual usage, and cost before adding hosting, authentication, databases, or model calls.

Keep model inference optional and sparse. Use formulas and deterministic transformations for arithmetic, import normalization, and repeatable comparisons. Do not add autonomous purchasing, publishing, or customer outreach.

## Acceptance checks for later changes

- A person can complete a small menu without Copilot or a developer.
- Source recipe IDs, units, yields, costs, and dates remain traceable.
- Zero/missing yields, missing costs, invalid percentages, mixed units, duplicate records, and stale stock do not silently produce usable-looking totals.
- Shared ingredients consume stock once across the entire menu.
- Pricing scenarios are distinguishable from final prices and from actual source food costs.
- Suggested substitutions preserve dietary and service constraints or visibly flag what has not been checked.
- Workbook opening and formula recalculation are checked in the target Excel workflow. Any compatibility limit is documented; do not claim live workplace testing from synthetic examples.
- No private data enters Git history, public issues, test fixtures, screenshots, or AI services without the required authorization.

## Public repository boundary

This repository is public. Commit only sanitized instructions, schemas, generic code, and deliberately fictional test fixtures. Keep private conversation transcripts, workplace recipe exports, inventory, vendor prices, customer details, and credentials outside this repository. A filename or `.gitignore` entry does not make already committed information private.

## Legacy project and collaboration

Preserve the existing Kitchen Prep application and Git history. Do not move its root files merely to make the tree look tidy: framework, deployment, and package paths may depend on the current layout. New planning belongs under `docs/catering/`. New workbook tooling, if later requested, can use a dedicated subtree after checking the existing owner's work.

If a future migration to a `legacy/` or `apps/` layout is genuinely useful, make it a separate scoped change with the current app owner, preserving history and verifying build/deployment paths. It is not a prerequisite for this workbook.

Before editing, inspect current branches, open PRs, repository instructions, and the active handoff. Continue the existing task branch when appropriate. Do not overwrite another agent's changes, combine unrelated dependency updates, create a second implementation, or remove a worktree with unfiled work. Integrate through one small reviewable change and close out its branch after the approved integration.
