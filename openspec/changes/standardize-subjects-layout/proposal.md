## Why

A navegação autenticada está concentrada em `App.tsx` e a página de Disciplinas exibe cartões mínimos que não representam a composição visual aprovada. A mudança cria um shell reutilizável e eleva a área de Disciplinas ao padrão do `DESIGN.md`, preservando os dados e fluxos já expostos pela API.

## What Changes

- Criar um layout autenticado reutilizável com uma única sidebar, navegação ativa definida pela página atual e comportamento responsivo consistente.
- Migrar Dashboard, Disciplinas, Tarefas, Sessões e Configurações para o layout compartilhado sem duplicar a navegação.
- Reestruturar a tela de Disciplinas com cabeçalho, ação de criação, grade responsiva e cartões com metadados, ações e indicador de progresso compatíveis com o Design System.
- Usar apenas dados já disponíveis no frontend ou derivados de listas já carregadas; não alterar API, banco, schema Prisma ou regras de negócio.
- Manter criação, edição e exclusão de disciplinas funcionais dentro da composição redesenhada.

## Capabilities

### New Capabilities
- `authenticated-app-shell`: Layout autenticado reutilizável com sidebar e estado visual da navegação.
- `subject-management-visuals`: Experiência visual de Disciplinas com cartões responsivos, progresso e ações de gerenciamento.

### Modified Capabilities
- Nenhuma.

## Impact

- Frontend React: `App.tsx`, páginas autenticadas, componentes compartilhados, hooks de dados e `global.css`.
- Não há alteração de contrato HTTP, dependência, modelo de dados, migração ou serviço de backend.
- A navegação atual baseada em estado será encapsulada em um layout compartilhado; não será introduzido roteador externo nesta mudança.
