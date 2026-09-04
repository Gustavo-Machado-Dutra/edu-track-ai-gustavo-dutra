## 1. Shared Application Shell

- [ ] 1.1 Extract the authenticated sidebar and content frame into reusable layout components, then verify every authenticated page renders through one sidebar source.
- [ ] 1.2 Connect selected-page navigation to the shared shell active state, then verify Dashboard, Disciplinas, Tarefas, Sessões, and Configurações each mark only their own item active.
- [ ] 1.3 Apply `DESIGN.md` shell tokens and responsive rules, then verify desktop, tablet, and mobile navigation has no content overflow.

## 2. Subject Management Experience

- [ ] 2.1 Extend frontend subject/task view data only as needed for real card metadata, then verify optional fields remain absent when the API does not return them.
- [ ] 2.2 Rebuild the Disciplinas header, creation action, responsive card grid, and task-derived circular progress indicator, then verify cards display returned subject data without hardcoded academic content.
- [ ] 2.3 Integrate existing create, edit, and delete flows into the redesigned subject controls, then verify each action updates only the relevant subject card.

## 3. Quality Verification

- [ ] 3.1 Add focused component or hook tests for navigation state and subject progress behavior, then verify the web test suite passes.
- [ ] 3.2 Run frontend typecheck and production build, then verify both commands pass without introducing generated files to the change.
- [ ] 3.3 Render desktop, tablet, and mobile subject views and compare sidebar, header, cards, progress, controls, surfaces, spacing, and typography against `DESIGN.md` and the supplied visual checklist.
