# Catering planning handoff

## Assignment

Extend the catering workflow only when the owner requests the next step. Start from the delivered Excel prototype and [future plan](README.md). The objective is less manual work selecting approved recipes that fit an existing menu and stocked ingredients. Do not replace it with a generic pricing calculator or a new hosted application.

## Current boundary

- Documentation-only addition; no new application, PRIMA integration, deployment, or source-system validation is claimed.
- A workbook prototype was prepared separately. Obtain the current authorized artifact from the project coordinator rather than reconstructing it from this plan.
- The source catalog and export route remain open questions. Permitted individual records and inventory files are enough for a first practical trial.
- Public repository content must remain sanitized. Private operational inputs and transcripts belong in the owner's approved private storage, not in this repository.

## Repository checkpoint

Inspected baseline: `main` at `6b67778707a6951d586ce37a2bc18d7571880b96` on 2026-11-05. The pre-existing `working` branch was at `ee93f669505ef74ec517f37048c80fb66233ab82`, with a dependency-update commit. Open dependency PR [#5](https://github.com/vmcintos/kitchen-prep/pull/5) is unrelated and remains untouched. These pins describe that inspection, not future freshness or a running service.

No catering-specific branch or PR appeared in the inspected remote branch and PR inventory. Saved-conversation search did not identify a separate active catering chat; that is not proof none exists. Coordinate with the project owner before implementing or reorganizing the application. This handoff does not assign exclusive implementation ownership.

## Best next action

Use the workbook with a small authorized menu, inventory export, and a handful of selected recipes. Record concrete friction, then make the smallest improvement that removes it. If the next issue is import effort, obtain a sanitized sample schema and document its exact column mapping before coding.

## Return packet for the next worker

Provide the exact branch/commit, changed files, current artifact, validation performed and its limits, unresolved source questions, and the next action. Say explicitly whether changes are merely prepared, under review, merged, or delivered. Preserve working legacy code and unrelated branches. Do not claim integration or a tested source-system connection from a plan alone.
