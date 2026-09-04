# Recuperação de Sessão Autenticada

## Problem Statement

O frontend considera o usuário autenticado apenas porque existe um access token no `localStorage`. Como o access token expira em 15 minutos, as telas protegidas passam a responder `Unauthorized` sem tentar usar o refresh token disponível. O usuário fica preso em uma aplicação que parece autenticada, embora a sessão já não seja válida.

## Goals

- [ ] Renovar automaticamente uma sessão quando uma requisição protegida receber `401`.
- [ ] Encerrar a sessão local e exibir o login quando a renovação falhar.
- [ ] Impedir loops de renovação e preservar o comportamento normal de login e cadastro.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Alterar validade dos tokens no backend | A API já fornece access token e refresh token com expirações definidas. |
| Controle de permissões por papel | O problema é a validade da sessão, não autorização por recurso. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Uma resposta `401` em uma requisição protegida indica sessão possivelmente expirada | Tentar `/auth/refresh` uma vez | O backend já expõe essa rota e o frontend já armazena o refresh token | y |
| O refresh pode retornar um novo access token e refresh token | Substituir os dois tokens salvos | Mantém a sessão alinhada com a resposta da API | y |
| Refresh inválido ou ausente | Limpar tokens e mostrar login | Evita manter uma sessão impossível de recuperar | y |
| Login e cadastro não devem disparar refresh automático | Excluir rotas `/auth/login`, `/auth/register` e `/auth/refresh` | Credenciais inválidas devem ser apresentadas ao usuário sem outra chamada | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Renovar sessão expirada ⭐ MVP

**User Story**: As a usuário autenticado, I want minhas requisições renovarem a sessão quando o access token expirar so that eu possa continuar usando as telas sem fazer login novamente.

**Why P1**: Sem essa recuperação, todas as telas protegidas ficam inutilizáveis após a expiração normal do token.

**Acceptance Criteria**:

1. WHEN uma requisição protegida receber `401` e existir um refresh token THEN o sistema SHALL chamar `POST /auth/refresh` uma única vez.
2. WHEN o refresh retornar sucesso THEN o sistema SHALL salvar os novos tokens e repetir a requisição original uma única vez com o novo access token.
3. IF o refresh retornar erro ou não existir refresh token THEN o sistema SHALL remover os tokens locais e sinalizar que a sessão expirou.
4. The system SHALL not attempt a second refresh for the same requisição original.
5. WHEN uma requisição de login, cadastro ou refresh receber `401` THEN o sistema SHALL retornar o erro original sem iniciar outro refresh.

**Independent Test**: Simular um `401` na primeira chamada, responder o refresh com novos tokens e verificar a repetição autorizada; depois simular falha no refresh e verificar que os tokens foram removidos e o evento de expiração foi emitido.

---

## Edge Cases

- IF o access token estiver ausente, mas houver refresh token THEN o sistema SHALL tentar renovar a sessão antes da requisição protegida.
- IF a resposta `401` vier da própria rota de refresh THEN o sistema SHALL limpar a sessão sem repetir o refresh.
- IF várias requisições expirarem simultaneamente THEN cada requisição SHALL ter no máximo uma tentativa de refresh e não SHALL entrar em loop.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| AUTH-01 | P1: Renovar sessão expirada | Verified | Verified |
| AUTH-02 | P1: Renovar sessão expirada | Verified | Verified |
| AUTH-03 | P1: Renovar sessão expirada | Verified | Verified |
| AUTH-04 | P1: Renovar sessão expirada | Verified | Verified |
| AUTH-05 | P1: Renovar sessão expirada | Verified | Verified |

**ID format:** `AUTH-[NUMBER]`

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] Uma tela protegida continua carregando depois que o access token expira, desde que o refresh token seja válido.
- [x] Uma sessão irrecuperável retorna o usuário ao login sem erro `Unauthorized` persistente.
- [x] Nenhuma requisição de autenticação entra em loop de refresh.
