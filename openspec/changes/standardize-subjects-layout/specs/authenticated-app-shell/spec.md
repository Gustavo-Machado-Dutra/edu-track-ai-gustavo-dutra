## Purpose

Provide one consistent authenticated application shell so every main product area shares navigation, spacing, responsive behavior, and visual identity.

## ADDED Requirements

### Requirement: Shared authenticated navigation shell
The system SHALL render Dashboard, Disciplinas, Tarefas, Sessões and Configurações inside one reusable authenticated layout that owns the sidebar and main content region.

#### Scenario: Open an authenticated area
- **WHEN** an authenticated user selects a main navigation item
- **THEN** the system displays that area's content inside the shared layout without rendering a second sidebar.

### Requirement: Active navigation state
The system SHALL visually identify the active main navigation item from the currently selected application page.

#### Scenario: Navigate to Disciplinas
- **WHEN** the user opens Disciplinas
- **THEN** the sidebar marks Disciplinas as active and renders all other main navigation items as inactive.

### Requirement: Responsive navigation behavior
The system SHALL preserve access to the authenticated navigation and page content at desktop, tablet, and small-screen widths.

#### Scenario: View on a small screen
- **WHEN** the viewport is smaller than the mobile breakpoint defined by the design system
- **THEN** the system presents navigation without horizontal page overflow and keeps the current page available.

### Requirement: Design system conformance
The system SHALL apply the color, typography, spacing, radius, surface, focus, and interaction rules defined in `DESIGN.md` to the shared shell.

#### Scenario: Inspect the authenticated layout
- **WHEN** the sidebar and main content are displayed
- **THEN** their dimensions, surfaces, labels, active state, hover state, and focus state conform to the documented design system.
