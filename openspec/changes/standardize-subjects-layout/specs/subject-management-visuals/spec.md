## Purpose

Present the user's real subject data in a high-fidelity, responsive management view that follows the approved EduTrack visual system and supports existing subject actions.

## ADDED Requirements

### Requirement: Subject page composition
The system SHALL display the Disciplinas area with a page header, a primary Nova disciplina action, and a responsive grid of subject cards inside the authenticated application shell.

#### Scenario: Open Disciplinas with saved subjects
- **WHEN** an authenticated user opens Disciplinas and subjects are available
- **THEN** the system displays the header, creation action, and one card for each returned subject.

### Requirement: Subject card content
The system SHALL display each subject card using real subject data, including its name and available professor, description, workload, task count, period, and progress information.

#### Scenario: Subject has optional metadata
- **WHEN** a returned subject omits optional metadata
- **THEN** the system preserves the card layout and does not display fabricated subject values.

### Requirement: Subject management actions
The system SHALL expose existing create, edit, and delete subject flows through controls styled with the documented design system.

#### Scenario: Create a subject
- **WHEN** the user selects Nova disciplina and submits valid information
- **THEN** the system creates the subject through the existing data flow and displays it in the subject grid.

#### Scenario: Edit or delete a subject
- **WHEN** the user selects Editar or Excluir on a subject card
- **THEN** the system invokes the existing update or deletion flow for that subject without affecting unrelated cards.

### Requirement: Progress presentation
The system SHALL present a circular subject progress indicator that communicates a percentage derived from available real task data.

#### Scenario: Subject has no tasks
- **WHEN** a subject has no associated tasks
- **THEN** the system displays a zero-progress indicator and does not claim completed work.

### Requirement: Subject page responsiveness
The system SHALL adapt the subject-card grid and management controls to the documented responsive breakpoints without card overlap or content clipping.

#### Scenario: Resize the subject page
- **WHEN** the viewport changes between desktop, tablet, and mobile widths
- **THEN** the system adjusts grid columns, header actions, and card content while retaining all available actions.
