# Project Context

> Memória operacional condensada do `SPEC.md`.
>
> **Regra de fonte de verdade:** este arquivo não substitui `SPEC.md`. Quando houver necessidade de detalhes, requisitos específicos ou decisões não resumidas aqui, consulte `SPEC.md`. Para regras visuais, consulte também `DESIGN.md`.

---

## 1. Visão geral

O projeto é uma aplicação multiplataforma composta por:

- Frontend Web em React;
- Aplicação Mobile em React Native;
- Backend em Node.js com NestJS + Fastify;
- PostgreSQL como banco relacional;
- Prisma como ORM;
- processamento e preparação de dados analíticos com Python + Pandas;
- camada de Inteligência Artificial com um Agente de IA integrado.

O sistema deverá centralizar regras de negócio no Backend e disponibilizar as mesmas regras e APIs para Web e Mobile.

O Agente de IA possui dois papéis principais:

1. gerar insights, análises e recomendações personalizadas a partir de dados preparados;
2. atuar como assistente operacional, podendo executar ações autorizadas, incluindo a criação de tarefas solicitadas pelo usuário.

O problema específico de negócio, o conjunto completo de funcionalidades e os critérios de aceite ainda não estão totalmente definidos no `SPEC.md`.

### Protótipo oficial de frontend

O único protótipo oficial é:

https://stitch.withgoogle.com/projects/13596816261153646269

O protótipo orienta a composição das telas e os fluxos de navegação.

O `Cyber-Academic System`, definido no `DESIGN.md`, é a fonte de verdade para regras visuais, tokens e componentes.

---

## 2. Requisitos principais

### 2.1 Aplicações cliente

- Web deve ser implementada com React.
- Mobile deve ser implementado com React Native.
- Web e Mobile devem utilizar o mesmo Backend.
- Operações sobre dados persistidos devem passar pelas APIs do Backend.
- A aplicação Web deve ser responsiva para Mobile, Tablet, Desktop e Large Desktop.
- Mobile deve manter consistência visual e conceitual com Web, adaptando interações para Android e iOS.

### 2.2 Backend

O Backend deve concentrar:

- autenticação;
- autorização;
- validação;
- regras de negócio;
- persistência;
- consultas;
- relacionamentos entre entidades;
- integrações externas;
- logs;
- tratamento de erros;
- documentação da API.

A organização deve ser orientada por módulos/domínios, evitando concentrar toda a lógica em controllers ou services genéricos.

### 2.3 API

A comunicação deve utilizar:

- REST;
- JSON;
- HTTPS;
- versionamento `/api/v1`.

O padrão conceitual de resposta é:

- sucesso: `{ "data": ... }`;
- erro: `{ "error": { "code": ..., "message": ... } }`.

A API deve ser documentada com OpenAPI/Swagger.

### 2.4 Dados e Analytics

Python + Pandas será utilizado para processamento e preparação de dados analíticos.

O Analytics Service deverá cuidar de consultas analíticas, agregações, filtros, agrupamentos, métricas, séries temporais, comparações, indicadores, preparação/normalização de datasets e validação dos dados antes do envio à IA.

O frontend não deve implementar separadamente as mesmas regras de cálculo de métricas.

### 2.5 Inteligência Artificial

A IA deve:

- interpretar dados estruturados e previamente processados;
- gerar insights;
- gerar análises personalizadas;
- contextualizar e explicar resultados;
- gerar recomendações quando permitido;
- interagir com o usuário;
- executar ações autorizadas por meio de ferramentas do Backend.

O modelo não deve acessar diretamente o PostgreSQL.

### 2.6 Agente de IA e tarefas

O Agente deve identificar a intenção do usuário antes de executar ações.

Quando o usuário solicitar explicitamente uma tarefa/atividade:

1. interpretar a solicitação;
2. identificar título, descrição, prioridade, prazo e demais campos disponíveis;
3. pedir esclarecimento somente se faltar informação obrigatória que não possa ser inferida com segurança;
4. validar permissões;
5. chamar a ferramenta de criação de tarefas;
6. persistir a tarefa pelo Backend;
7. confirmar a criação ao usuário.

A criação de tarefas solicitadas explicitamente é considerada ação de baixo risco e pode ocorrer após a validação necessária.

Ações destrutivas, irreversíveis ou que afetem dados importantes exigem confirmação explícita.

---

## 3. Arquitetura e componentes

### 3.1 Arquitetura principal

```text
React Web ───────┐
                 │
                 ├── HTTPS / REST / JSON ──► NestJS + Fastify
                 │                                  │
React Native ────┘                                  │
                                                    ▼
                                                  Prisma
                                                    │
                                                    ▼
                                                PostgreSQL
```

### 3.2 Arquitetura analítica e de IA

```text
PostgreSQL
    ↓
Prisma
    ↓
Analytics Service
    ↓
Python Data Service
    ↓
Pandas
    ↓
Dataset / Resultado Analítico
    ├──► Dashboard
    └──► AI Agent / Insight Engine
```

Princípio central:

> **Dados são calculados deterministicamente pelo sistema; IA interpreta os dados; Frontend apresenta os resultados.**

### 3.3 Agente

```text
Usuário
   ↓
Web / Mobile
   ↓
AI Agent API
   ↓
Agent Orchestrator
   ├── Context Manager
   ├── LLM Provider
   ├── Analytics Tools
   ├── Task Tools
   └── Application Tools
   ↓
Validação de permissões
   ↓
Execução
   ↓
Resposta estruturada
   ↓
Web / Mobile
```

O Agent Orchestrator controla contexto, memória necessária à sessão, seleção de ferramentas, chamadas ao modelo, validação, autorização, erros, resposta estruturada e auditoria.

### 3.4 Ferramentas previstas para o Agente

Exemplos definidos no `SPEC.md`:

- `create_task`
- `list_tasks`
- `update_task`
- `complete_task`
- `get_user_metrics`
- `get_dashboard_data`
- `generate_analysis`

A lista definitiva de ferramentas ainda não está definida.

### 3.5 Dashboards

Dashboards podem apresentar:

- KPIs;
- indicadores;
- métricas;
- gráficos;
- tabelas;
- comparações;
- tendências;
- distribuição;
- evolução temporal;
- alertas;
- insights de IA.

As métricas oficiais não devem ser inventadas pelo agente/desenvolvedor; devem vir dos requisitos do produto.

Componentes de visualização devem ser reutilizáveis, incluindo os padrões conceituais:

- `LineChart`
- `BarChart`
- `PieChart`
- `AreaChart`
- `KPI`
- `DataTable`

---

## 4. Stack e tecnologias

| Camada | Tecnologia/definição |
|---|---|
| Web | React |
| Mobile | React Native |
| Linguagem | TypeScript |
| Runtime | Node.js |
| Backend | NestJS |
| HTTP Adapter | Fastify |
| API | REST/JSON/HTTPS |
| Banco | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT/OAuth ou serviço especializado |
| API Docs | OpenAPI/Swagger |
| Controle de versão | Git |
| CI/CD | Pipeline automatizado |
| Analytics/Data Processing | Python + Pandas |
| Design System | Cyber-Academic System (`DESIGN.md`) |

### Tecnologias ainda não definitivas

O `SPEC.md` não fecha:

- provedor de IA;
- modelo de IA;
- embedding provider;
- vector database;
- framework/orquestrador do agente;
- biblioteca de gráficos Web;
- biblioteca de gráficos Mobile;
- estratégia de comunicação NestJS ↔ Python;
- serviço de execução Python;
- versão do Python;
- versão do Pandas;
- Redis;
- message broker/queue;
- provedor de cloud;
- ferramentas específicas de observabilidade.

**Não assumir fornecedores ou bibliotecas como decisões definitivas sem aprovação.**

---

## 5. Modelo de dados e conceitos

### 5.1 Domínios principais

O projeto contempla conceitualmente:

- usuários;
- autenticação;
- perfis/permissões;
- dashboards;
- analytics;
- insights;
- tarefas/atividades;
- Agente de IA;
- ferramentas do agente;
- auditoria das ações do agente.

### 5.2 Tarefas

A entidade de tarefas deverá avaliar, no mínimo:

- `id`;
- `user_id`;
- `title`;
- `description`;
- `status`;
- `priority`;
- `due_date`;
- `created_at`;
- `updated_at`;
- `completed_at`;
- `created_by`;
- origem da criação;
- identificador da execução do agente, quando aplicável.

A modelagem definitiva ainda depende dos requisitos do produto.

### 5.3 Insights

Quando aplicável, a rastreabilidade de um insight deverá manter:

- ID;
- timestamp;
- dataset utilizado;
- período analisado;
- métricas utilizadas;
- modelo utilizado;
- versão do prompt;
- resultado.

A implementação definitiva ainda precisa ser especificada.

---

## 6. Regras e invariantes

Estas regras não devem ser quebradas durante alterações futuras:

1. **Frontend e Mobile não acessam diretamente o PostgreSQL.**
2. **A IA não acessa diretamente o PostgreSQL.**
3. Alterações de dados devem passar pelo Backend.
4. O Agente executa ações somente por ferramentas controladas pelo Backend.
5. Python/Pandas processa e prepara dados analíticos; não substitui o Backend ou o banco.
6. Cálculos críticos e regras de negócio permanecem determinísticos no Backend.
7. A IA interpreta dados; não deve substituir cálculos determinísticos.
8. A IA não deve inventar métricas, números ou informações ausentes dos dados.
9. Dados enviados ao modelo devem seguir minimização, autorização e políticas de privacidade.
10. Toda ação realizada pelo Agente deve ser auditável.
11. Web e Mobile devem consumir as mesmas regras de negócio e APIs.
12. Serviços pesados podem exigir processamento assíncrono.
13. Secrets não devem ser armazenados no código ou versionados no Git.
14. Dados recebidos pelo Backend devem ser validados.
15. O Backend não deve confiar em dados enviados pelo cliente.
16. Alterações de banco devem utilizar migrations versionadas.
17. Nenhum código deve ir para produção sem as verificações automatizadas definidas no pipeline.
18. Componentes visuais existentes devem ser reutilizados em vez de duplicados.
19. Não criar padrões visuais isolados quando já existir token ou componente correspondente no Design System.
20. Não inventar métricas ou endpoints definitivos a partir de exemplos conceituais do `SPEC.md`.

---

## 7. Convenções e padrões

### Backend

Estrutura sugerida:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   └── ...
├── database/
│   └── prisma/
├── common/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   └── pipes/
├── config/
├── app.module.ts
└── main.ts
```

Organização orientada a módulos/domínios.

### Web

```text
src/
├── components/
├── pages/
├── layouts/
├── routes/
├── hooks/
├── services/
├── stores/
├── types/
├── utils/
├── assets/
└── App.tsx
```

- `components`: componentes reutilizáveis;
- `pages`: telas completas;
- `services`: comunicação com API;
- `hooks`: lógica React reutilizável;
- `stores`: estado global quando necessário;
- `routes`: navegação.

### Mobile

```text
src/
├── components/
├── screens/
├── navigation/
├── hooks/
├── services/
├── stores/
├── utils/
├── types/
├── assets/
└── App.tsx
```

### Git

Branches previstas:

```text
main
production

develop
├── feature/*
├── fix/*
└── refactor/*
```

Exemplos:

- `feature/user-authentication`
- `feature/dashboard`
- `fix/login-validation`
- `refactor/api-client`

Pull Requests devem ser utilizados para revisão.

---

## 8. Design System e frontend

O Design System oficial é o **Cyber-Academic System**, definido em `DESIGN.md`.

O `DESIGN.md` é a fonte de verdade para:

- identidade visual;
- tokens;
- cores;
- tipografia;
- espaçamento;
- grid;
- formas;
- glassmorphism;
- componentes;
- estados;
- acessibilidade.

Principais definições:

- Sora para headings;
- Inter para corpo;
- JetBrains Mono para métricas, timestamps e metadados;
- unidade de espaçamento de 4px;
- Desktop com grid de 12 colunas;
- Tablet com grid de 8 colunas;
- Mobile com coluna única;
- contraste mínimo de 4.5:1;
- componentes reutilizáveis.

O Design System inclui componentes para navegação, formulários, data display, feedback, visualização de dados, IA e tarefas.

### Relação com o protótipo

```text
Protótipo Oficial do Stitch
        ↓
Cyber-Academic Design System
        ↓
Design Tokens
        ↓
Componentes
        ↓
Telas e fluxos
```

O protótipo oficial define composição e fluxos específicos das telas.

O Design System define regras visuais, tokens e componentes.

Em conflito visual:

- Design System prevalece para tokens e padrões de UI;
- protótipo oficial prevalece para composição e fluxo específico da tela.

---

## 9. Decisões já tomadas

### D1 — React para Web
- **Decisão:** React + TypeScript.
- **Impacto:** interface Web deve seguir a arquitetura e organização definidas para React.

### D2 — React Native para Mobile
- **Decisão:** React Native + TypeScript.
- **Impacto:** Android e iOS compartilharão a base da aplicação Mobile.

### D3 — Backend centralizado
- **Decisão:** Node.js com recomendação de NestJS + Fastify.
- **Impacto:** regras de negócio, autenticação, autorização, validações e persistência ficam centralizadas.

### D4 — PostgreSQL + Prisma
- **Decisão recomendada:** PostgreSQL + Prisma.
- **Impacto:** acesso persistente deve ocorrer através do Backend/ORM.

### D5 — API REST versionada
- **Decisão:** REST/JSON/HTTPS com `/api/v1`.
- **Impacto:** Web e Mobile compartilham a mesma API.

### D6 — Python + Pandas
- **Decisão:** Python + Pandas para processamento/preparação analítica.
- **Impacto:** exige uma estratégia de comunicação entre NestJS e o serviço Python, ainda não definida.

### D7 — IA controlada pelo Backend
- **Decisão:** IA não acessa diretamente o PostgreSQL.
- **Impacto:** dados devem ser preparados e fornecidos por camadas controladas.

### D8 — Agente com Tool Calling
- **Decisão:** ações do Agente são executadas por ferramentas controladas pelo Backend.
- **Impacto:** o agente não executa SQL nem chamadas arbitrárias diretamente.

### D9 — Criação de tarefas pela IA
- **Decisão:** o Agente pode criar tarefas quando solicitado explicitamente pelo usuário, após validações.
- **Impacto:** o domínio de tarefas e as ferramentas correspondentes precisam existir no Backend.

### D10 — Cyber-Academic System
- **Decisão:** Design System oficial.
- **Impacto:** interfaces devem seguir `DESIGN.md`.

### D11 — Protótipo oficial único
- **Decisão:** apenas o projeto Stitch indicado no `SPEC.md` é o protótipo oficial de frontend.
- **Impacto:** outros projetos do Stitch não devem ser tratados como referência oficial.

---

## 10. Restrições e limitações

### Segurança

- HTTPS em produção.
- Validar entradas.
- Não confiar no cliente.
- Secrets em variáveis de ambiente/secrets.
- Nunca versionar senhas ou tokens.
- Rate limiting em endpoints sensíveis.
- Hash seguro para senhas.
- Controle de permissões.
- Não expor dados sensíveis em erros.
- Registrar eventos importantes de autenticação.
- Banco com controle de acesso, credenciais seguras, backups e migrations.

### IA

- Não enviar secrets/credenciais ao modelo.
- Avaliar dados pessoais, sensíveis, financeiros e confidenciais antes do envio.
- Aplicar minimização/anonimização quando aplicável.
- Não permitir que a IA invente números.
- Validar respostas quando possível.
- Identificar informações inferidas.
- Quando não houver dados suficientes, a IA deve indicar essa insuficiência.
- Não assumir provedor/modelo de IA definitivo.

### Performance

- Evitar dados desnecessários.
- Usar paginação quando aplicável.
- Agregar no Backend.
- Evitar consultas repetidas.
- Considerar cache.
- Utilizar índices adequados.
- Evitar datasets gigantes no Frontend e na IA.
- Considerar processamento assíncrono para operações pesadas.

---

## 11. Estado atual

O `SPEC.md` é uma especificação técnica/arquitetural e **não fornece evidência suficiente para determinar o estado real de implementação do código**.

Portanto:

- **Implementado:** não verificável apenas pelo `SPEC.md`.
- **Parcialmente implementado:** não verificável apenas pelo `SPEC.md`.
- **Ainda não implementado:** não deve ser presumido apenas porque aparece como requisito.

O agente deve verificar o código e os arquivos reais do projeto antes de afirmar que uma funcionalidade está implementada.

---

## 12. Pendências

As seguintes decisões permanecem explicitamente em aberto no `SPEC.md`:

### Produto e domínio
- lista completa de funcionalidades;
- perfis e permissões;
- fluxos de autenticação;
- mapa de telas Web;
- mapa de telas Mobile;
- entidades e relacionamentos definitivos;
- endpoints definitivos;
- regras de negócio;
- integrações externas;
- critérios de aceite.

### IA e Analytics
- provedor de IA;
- modelo principal;
- modelo secundário/fallback;
- embedding provider;
- vector database;
- framework/orquestrador;
- estratégia de tool calling;
- lista oficial de ferramentas;
- autorização por ferramenta;
- memória;
- histórico;
- limites de contexto/tokens;
- estratégia e versionamento de prompts;
- Structured Output;
- avaliação do agente;
- confirmação de ações;
- auditoria;
- rate limiting;
- controle de custos;
- fallback do provedor;
- métricas oficiais;
- KPIs;
- regras de detecção de anomalias;
- observabilidade da IA.

### Python/Pandas
- comunicação NestJS ↔ Python;
- serviço Python;
- versão do Python;
- versão do Pandas;
- formato de datasets;
- síncrono vs. assíncrono;
- biblioteca adicional de análise;
- jobs agendados;
- cache;
- necessidade futura de warehouse/lake.

### Tasks
- modelo definitivo;
- status;
- prioridades;
- regras de prazo;
- recorrência;
- notificações;
- permissões;
- histórico de alterações.

### Infraestrutura
- cloud;
- hospedagem Web;
- hospedagem API;
- hospedagem Python;
- PostgreSQL gerenciado/próprio;
- Redis;
- queue/message broker;
- object storage;
- DNS;
- CDN;
- TLS/HTTPS;
- secrets manager;
- autoscaling.

### Observabilidade
- logs;
- monitoramento de erros;
- APM/tracing;
- métricas da API;
- métricas Python/Pandas;
- métricas do Agente;
- custos de IA;
- alertas;
- correlation/trace ID.

### Qualidade e segurança
- testes do pipeline Pandas;
- testes das tools;
- testes de prompt/LLM;
- testes de autorização;
- testes contra prompt injection;
- proteção contra vazamento de dados;
- retenção de conversas;
- LGPD;
- mascaramento/anonimização;
- disaster recovery.

---

## 13. Conflitos e pontos a esclarecer

1. **Autenticação ainda não está fechada.** O `SPEC.md` considera JWT, OAuth e serviço especializado; não tratar nenhuma alternativa como definitiva sem decisão formal.

2. **NestJS + Fastify é recomendação arquitetural**, embora apareça na stack recomendada. Não substituir por outra solução sem decisão.

3. **Prisma é a recomendação inicial**, mas Drizzle foi considerado como alternativa. Não tratar Drizzle como stack ativa.

4. **Endpoints de Analytics são exemplos conceituais**, não contratos definitivos.

5. **Schemas de dados da IA são exemplos conceituais**, não devem ser implementados como contratos finais sem especificação.

6. **Cache e processamento assíncrono são condicionais**: devem ser adotados conforme requisitos de custo, volume e performance, não automaticamente.

7. **A lista de ferramentas do Agente é exemplificativa**; a lista oficial ainda precisa ser definida.

8. **O estado de implementação não pode ser inferido do `SPEC.md`.**

9. O `SPEC.md` contém uma seção final com texto legado que menciona novamente “as três telas/projetos do Stitch”. Isso conflita com a definição anterior de que existe apenas um protótipo oficial. Para o contexto atual, deve prevalecer a decisão explícita de que o projeto Stitch `13596816261153646269` é o único protótipo oficial.

10. O `SPEC.md` utiliza numeração duplicada em algumas seções (`# 59` aparece mais de uma vez). Isso é um problema de organização documental, não uma decisão arquitetural.

---

## 14. Checklist para futuras alterações

Antes de modificar o projeto:

- [ ] Consulte `context.md`.
- [ ] Consulte `SPEC.md` para requisitos e decisões detalhadas.
- [ ] Consulte `DESIGN.md` para qualquer alteração de UI/UX.
- [ ] Verifique o estado real do código antes de assumir que algo existe.
- [ ] Confirme se a funcionalidade já possui componente, serviço, módulo ou API reutilizável.
- [ ] Não crie acesso direto do Frontend/Mobile ao PostgreSQL.
- [ ] Não permita acesso direto da IA ao PostgreSQL.
- [ ] Para ações da IA, utilize Tools controladas pelo Backend.
- [ ] Mantenha cálculos críticos determinísticos no Backend.
- [ ] Use Python/Pandas para processamento analítico conforme definido.
- [ ] Não invente métricas, endpoints, schemas ou regras de negócio.
- [ ] Não escolha tecnologias marcadas como `A DEFINIR` sem decisão.
- [ ] Respeite o Cyber-Academic System.
- [ ] Use o protótipo oficial do Stitch como referência de composição/fluxo.
- [ ] Garanta validação, autorização e auditoria de ações críticas.
- [ ] Atualize a documentação quando uma decisão arquitetural for formalmente tomada.
