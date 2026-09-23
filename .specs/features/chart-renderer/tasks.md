# Chart Renderer Tasks

## Test Coverage Matrix

> Generated from AGENTS.md, IMPLEMENTATION.md, the existing Vitest tests in apps/web/src, apps/web/package.json and the Chart Renderer specification.

| Code Layer | Required Test Type | Evidence |
| --- | --- | --- |
| React renderer | Unit | apps/web/src/components/AgentChart.spec.tsx asserts chart markup and safe field selection. |
| Page integration | Typecheck/build | apps/web/src/pages/AIAssistantPage.tsx imports and renders AgentChart; workspace gates compile the integration. |

## Gate Check Commands

- Quick: npm.cmd run typecheck and npm.cmd run lint in apps/web.
- Full: npm.cmd run test and npm.cmd run build in apps/web.
- Workspace: npm.cmd run typecheck, npm.cmd run lint, npm.cmd run test, npm.cmd run build at repository root.

## Execution Plan

1. Implement AgentChart with native SVG/HTML renderers for every allowed chart type.
2. Render analysis.chart from AIAssistantPage and keep the existing validated text path.
3. Add unit tests for chart families, undeclared fields and invalid measures.
4. Run all Web and workspace gates, then record evidence.

## Task Breakdown

### T1: Create the AgentChart renderer

**What**: Create the React component that renders every allowed ChartSpecification type using only declared fields.
**Where**: apps/web/src/components/AgentChart.tsx
**Depends on**: None
**Reuses**: apps/web/src/types/chart-specification.ts and existing Card/CSS conventions.
**Requirement**: CHART-01, CHART-02, CHART-03, CHART-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] All eleven ChartType values have a render path.
- [x] No dangerouslySetInnerHTML, code evaluation or arbitrary field iteration is used.
- [x] Empty and non-numeric data produce stable output.
- [x] Web typecheck and lint pass.

**Tests**: unit
**Gate**: quick

---

### T2: Integrate the renderer in the Copilot

**What**: Render message.chartSpec inside validated analysis messages and apply the chart layout styles.
**Where**: apps/web/src/pages/AIAssistantPage.tsx
**Depends on**: T1
**Reuses**: normalizeAgentResponse, existing message layout and apps/web/src/styles/global.css.
**Requirement**: CHART-01, CHART-02, CHART-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Analysis messages with chart display AgentChart.
- [x] Text and action messages do not create a chart.
- [x] Workspace typecheck and build pass.

**Tests**: unit
**Gate**: full

---

### T3: Add renderer tests

**What**: Add unit coverage for chart families, field allowlisting and invalid numeric values.
**Where**: apps/web/src/components/AgentChart.spec.tsx
**Depends on**: T1
**Reuses**: Vitest and renderToStaticMarkup patterns from existing component specs.
**Requirement**: CHART-01, CHART-02, CHART-03, CHART-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Four renderer tests pass.
- [x] Extra data fields are asserted absent.
- [x] Non-numeric data is asserted to produce the empty state.

**Tests**: unit
**Gate**: quick

---

### T4: Run final validation and update evidence

**What**: Run the Web and workspace gates and record validation evidence.
**Where**: .specs/features/chart-renderer/validation.md
**Depends on**: T2, T3
**Reuses**: openspec/changes/2026-09-23-chart-renderer/tasks.md, package scripts and OpenSpec validation.
**Requirement**: CHART-01, CHART-02, CHART-03, CHART-04

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven, openspec-apply-change

**Done when**:

- [x] Workspace typecheck, lint, test and build exit with code 0.
- [x] Web suite reports 13 passing tests and API suite reports 81 passing tests.
- [x] OpenSpec change validates without errors.

**Tests**: full
**Gate**: full

## Phase Execution Map


```
T1 -> T2
T1 -> T3
T2 -> T4
T3 -> T4
```

## Status

All tasks implemented and verified on 2026-09-23.
