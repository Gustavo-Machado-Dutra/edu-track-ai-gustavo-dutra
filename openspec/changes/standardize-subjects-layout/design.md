## Context

The authenticated frontend currently keeps its sidebar and page switch in `App.tsx`; page composition and styles are centralized in `global.css`. Disciplinas currently uses basic cards and its `Subject` client type does not include the API relation data required by the requested visual metadata. See `proposal.md` for motivation and the two change specs for observable behavior.

## Goals / Non-Goals

**Goals:**
- Centralize the authenticated shell and its sidebar in reusable frontend components.
- Rebuild the Disciplinas composition with the `DESIGN.md` tokens, existing button/card primitives, and responsive layout rules.
- Extend only the frontend data shaping required to show real task-derived counts and progress.

**Non-Goals:**
- Add a client-side router, alter API endpoints, create schema migrations, or introduce fabricated academic data.
- Change the existing create, edit, delete, authentication, or task-completion business flows.

## Decisions

### Reusable application shell
Create `AppLayout` and `Sidebar` components and keep the existing application page state as the navigation source. This removes duplicate sidebar markup while avoiding a router dependency that is not present in the project.

Alternative considered: introduce React Router. Rejected because the requested active state can be driven by the existing selected-page state and route infrastructure is outside this visual change.

### Subject view model from existing API data
Load the existing subjects and tasks client resources, then derive task count and completion percentage in the subject page from task statuses already returned by the API. Optional subject metadata is rendered only when the backend provides it.

Alternative considered: hardcode descriptions, workloads, dates, and progress values from the reference. Rejected because the requested view must use real data and the current subject model does not provide all optional fields.

### Design system implementation
Move shared visual values into CSS custom properties sourced directly from `DESIGN.md`, then compose the shell and cards with those tokens. Use CSS grid, flexbox, and responsive breakpoints rather than absolute positioning.

Alternative considered: page-local inline styles. Rejected because the sidebar must be a global single source of truth and visual values need consistent reuse.

### Visual reference validation
Use the supplied request details and the tracked historical subject reference markup as composition guidance. The supplied screenshot is unavailable to the current visual toolchain, so final implementation validation will use rendered local screenshots plus the documented checklist and request a user visual review if a direct comparison remains unavailable.

## Risks / Trade-offs

- [The current API may not provide description, workload, or period on every subject] → Render each field only when returned and preserve the card composition with real task metrics.
- [Existing CSS is a compact global stylesheet] → Isolate new shell and subject selectors with explicit component class names and avoid restyling unrelated page selectors.
- [No router exists] → Keep active navigation state in one owner and add route migration only in a future navigation-focused change.
- [Reference screenshot cannot be inspected directly] → Validate against `DESIGN.md`, historical reference markup, responsive renders, and the supplied visual checklist.

## Migration Plan

1. Introduce reusable shell components without changing data APIs.
2. Move authenticated pages into the shell and retain their existing selected-page behavior.
3. Rebuild Disciplinas and extend frontend types/hooks only as required for returned subject and task data.
4. Run focused component tests, frontend typecheck, production build, and desktop/tablet/mobile visual checks.
5. Roll back by reverting the frontend-only change; no persisted data or API migration is involved.

## Open Questions

None. The absent optional subject metadata is explicitly handled by rendering only real fields.
