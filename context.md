# Project Context

> Memória operacional condensada do `SPEC.md`.

> **Regra de fonte de verdade:** este arquivo não substitui `SPEC.md`. Quando houver necessidade de requisitos, regras de negócio, decisões arquiteturais ou detalhes específicos, consulte `SPEC.md`. Para regras visuais, consulte `DESIGN.md`. Para o modelo físico de dados, consulte `schema.prisma`.

---

# 1. Propósito do projeto

O projeto é uma aplicação multiplataforma para organização e acompanhamento acadêmico, composta por:

* Frontend Web em React + TypeScript;
* Aplicação Mobile em React Native + TypeScript;
* Backend em Node.js com NestJS + Fastify;
* PostgreSQL como banco de dados relacional;
* Prisma como ORM;
* serviço analítico em Python + FastAPI + Pandas;
* camada de Inteligência Artificial com Agente de IA.

O Backend centraliza autenticação, autorização, validação, regras de negócio, persistência, integrações e acesso aos dados.

Web e Mobile utilizam o mesmo Backend e não acessam diretamente o PostgreSQL.

O Agente de IA possui dois papéis principais:

1. gerar insights, análises e recomendações personalizadas a partir de dados estruturados;
2. atuar como assistente operacional, podendo executar ações autorizadas por meio de ferramentas controladas pelo Backend.

O `SPEC.md` é a fonte de verdade para os requisitos completos do produto.

---

# 2. Fontes de verdade

O projeto possui os seguintes artefatos canônicos:

| Arquivo         | Responsabilidade                                                                         |
| --------------- | ---------------------------------------------------------------------------------------- |
| `SPEC.md`       | Requisitos, regras de negócio, arquitetura, decisões e pendências do produto             |
| `DESIGN.md`     | Design System, identidade visual, tokens, componentes, estados e regras de UI/UX         |
| `schema.prisma` | Modelo físico persistente, modelos Prisma, tipos, enums, relações, índices e constraints |
| `context.md`    | Contexto operacional, convenções, governança e instruções para agentes                   |
| `openspec/`     | Mudanças significativas, seus artefatos e histórico de mudanças                          |

### Regra

Nenhum desses arquivos substitui os demais.

Cada arquivo possui uma responsabilidade específica.

Uma decisão deve ser registrada no artefato correspondente.

---

# 3. Protótipo oficial

O único protótipo oficial de frontend é:

`https://stitch.withgoogle.com/projects/13596816261153646269`

O protótipo orienta:

* composição das telas;
* fluxos de navegação;
* estrutura visual específica das telas.

O `DESIGN.md` define:

* Design System;
* tokens;
* cores;
* tipografia;
* espaçamento;
* grid;
* componentes;
* estados;
* acessibilidade;
* padrões visuais.

Em caso de conflito visual:

1. `DESIGN.md` prevalece para tokens, componentes e padrões visuais;
2. o protótipo oficial prevalece para composição e fluxo específico das telas.

---

# 4. Stack definida

As seguintes tecnologias estão definidas no estado atual do projeto:

| Camada                          | Tecnologia                |
| ------------------------------- | ------------------------- |
| Web                             | React + TypeScript        |
| Mobile                          | React Native + TypeScript |
| Runtime                         | Node.js                   |
| Backend                         | NestJS                    |
| HTTP Adapter                    | Fastify                   |
| API                             | REST + JSON + HTTPS       |
| API Version                     | `/api/v1`                 |
| Database                        | PostgreSQL                |
| ORM                             | Prisma                    |
| Analytics                       | Python + FastAPI + Pandas |
| Authentication                  | JWT + Refresh Tokens      |
| Password Hashing                | Argon2id                  |
| Cache / infraestrutura de apoio | Redis                     |
| Jobs assíncronos                | BullMQ                    |
| Push Notifications              | FCM                       |
| Object Storage                  | S3-compatible             |
| API Documentation               | OpenAPI / Swagger         |
| Version Control                 | Git / GitHub              |
| Design System                   | Cyber-Academic System     |

### Regra

Não substituir tecnologias definidas sem alteração formal da especificação.

Tecnologias ainda marcadas como `TBD` no `SPEC.md` não devem ser escolhidas arbitrariamente pelo agente.

---

# 5. Arquitetura

## 5.1 Arquitetura principal

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

## 5.2 Analytics

```text
Backend / Analytics Service
            ↓
     Python / FastAPI
            ↓
          Pandas
            ↓
   Dataset / Resultado
            ├──► Dashboard
            └──► AI Agent
```

O mecanismo de comunicação de alto nível está definido no `SPEC.md`:

* HTTP interno para operações analíticas síncronas;
* processamento assíncrono para operações pesadas;
* Redis + BullMQ para jobs assíncronos.

Contratos, schemas, timeouts, retries e idempotência ainda devem ser definidos antes da implementação das integrações correspondentes.

## 5.3 Agente de IA

```text
Usuário
   ↓
Web / Mobile
   ↓
AI Agent API
   ↓
Agent Orchestrator
   ├── Context Manager
   ├── LLM Provider Adapter
   ├── Analytics Tools
   ├── Task Tools
   └── Application Tools
   ↓
Validação
   ↓
Autorização
   ↓
Execução
   ↓
Resposta estruturada
   ↓
Web / Mobile
```

O Agente nunca acessa diretamente o PostgreSQL.

---

# 6. Regras arquiteturais invariáveis

As seguintes regras devem ser preservadas durante o desenvolvimento:

1. Frontend Web não acessa diretamente o PostgreSQL.
2. Mobile não acessa diretamente o PostgreSQL.
3. Agente de IA não acessa diretamente o PostgreSQL.
4. IA não executa SQL diretamente.
5. Alterações persistentes passam pelo Backend.
6. Ações da IA são executadas por Tools controladas pelo Backend.
7. Tools devem respeitar autenticação e autorização.
8. Regras críticas de negócio permanecem determinísticas.
9. Métricas oficiais são calculadas pelo sistema.
10. A IA interpreta e contextualiza dados calculados.
11. A IA não deve inventar métricas, números ou informações ausentes.
12. Dados enviados ao modelo devem respeitar minimização e políticas de privacidade.
13. Ações realizadas pelo Agente devem ser auditáveis.
14. Web e Mobile utilizam as mesmas regras de negócio.
15. Alterações de banco utilizam migrations versionadas.
16. Secrets não podem ser versionados.
17. Dados recebidos pelo Backend devem ser validados.
18. O Backend não deve confiar em dados fornecidos pelo cliente.
19. Componentes existentes devem ser reutilizados quando apropriado.
20. Não devem ser criados padrões visuais fora do Design System sem decisão formal.
21. Não devem ser inventados endpoints, métricas, schemas ou regras de negócio.
22. Decisões marcadas como `TBD` não devem ser escolhidas arbitrariamente pelo agente.

---

# 7. Backend

O Backend é organizado por módulos/domínios.

Exemplos:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── subjects/
│   ├── tasks/
│   ├── study-sessions/
│   ├── analytics/
│   ├── ai/
│   ├── insights/
│   ├── reports/
│   └── notifications/
│
├── common/
├── config/
├── database/
└── main.ts
```

A estrutura exata deve ser validada contra o estado real do repositório antes da implementação.

Controllers não devem concentrar regras de negócio.

A separação conceitual é:

```text
Controller
    ↓
Service / Domain Service
    ↓
Repository / ORM
    ↓
PostgreSQL
```

---

# 8. Analytics

Python + Pandas é a camada oficial de processamento e preparação analítica.

Responsabilidades:

* agregações;
* filtros;
* agrupamentos;
* métricas;
* séries temporais;
* comparações;
* preparação de datasets;
* normalização;
* validação;
* preparação de dados para IA;
* geração de dados para relatórios.

O Python não substitui:

* Backend;
* regras de negócio;
* autenticação;
* autorização;
* persistência principal.

O Frontend não deve duplicar cálculos oficiais realizados pelo Backend/Analytics.

---

# 9. Inteligência Artificial

A arquitetura de IA é provider-agnostic.

O código não deve ficar diretamente acoplado a um único provedor de LLM.

A integração deve ocorrer por meio de um Provider Adapter.

O Agente deve:

* identificar intenção;
* consultar dados por ferramentas;
* interpretar dados estruturados;
* gerar análises;
* gerar insights;
* gerar recomendações quando permitido;
* executar ações autorizadas;
* produzir respostas estruturadas quando aplicável;
* registrar execuções de ferramentas;
* respeitar limites de contexto;
* respeitar políticas de segurança e privacidade.

O modelo não possui autoridade própria sobre o banco ou domínio.

A autoridade pertence ao Backend.

---

# 10. Tools do Agente

A lista atual de ferramentas previstas no `SPEC.md` inclui:

```text
create_task
list_tasks
get_task
update_task
complete_task
get_user_metrics
get_dashboard_data
generate_analysis
```

Essa lista representa o estado atual previsto e deve ser validada antes da implementação definitiva.

Cada Tool deve possuir:

* identificação;
* finalidade;
* input definido;
* output definido;
* validação;
* autorização;
* tratamento de erro;
* classificação de risco;
* auditoria quando aplicável.

O Agente não pode criar ferramentas arbitrárias durante a execução.

---

# 11. Ações do Agente

## Leitura

Operações de leitura podem ser executadas sem confirmação adicional quando:

* o usuário está autenticado;
* a operação é autorizada;
* a ferramenta é permitida;
* os dados pertencem ao usuário ou estão disponíveis segundo as regras do domínio.

## Escrita

Ações de escrita devem:

1. identificar a intenção;
2. validar os parâmetros;
3. validar autorização;
4. utilizar uma Tool aprovada;
5. executar pelo Backend;
6. registrar a execução quando aplicável.

## Ações de alto risco

Ações destrutivas, irreversíveis ou que afetem dados importantes exigem confirmação explícita.

A criação explícita de tarefas solicitada pelo usuário é considerada ação de baixo risco após validação.

---

# 12. Estado real do projeto

O estado de implementação nunca deve ser inferido apenas a partir do `SPEC.md`, `context.md` ou qualquer documentação.

Antes de afirmar que algo está implementado, o agente deve verificar:

* código;
* estrutura de diretórios;
* configurações;
* dependências;
* migrations;
* banco quando disponível;
* testes;
* pipelines;
* integrações.

Classificações possíveis:

* Implementado;
* Parcialmente implementado;
* Não implementado;
* Não verificável.

Quando não houver evidência suficiente, utilizar `Não verificável`.

---

# 13. Pendências

O agente deve consultar `SPEC.md` para identificar as pendências atuais.

Decisões marcadas como:

* `TBD`;
* `A DEFINIR`;
* `PENDENTE`;

não devem ser inventadas.

Quando uma pendência impedir a implementação segura de uma funcionalidade, o agente deve interromper a implementação daquela parte e solicitar ou formalizar a decisão necessária.

---

# 14. Regras de documentação

Quando uma decisão permanente for tomada:

* requisitos → atualizar `SPEC.md`;
* Design System → atualizar `DESIGN.md`;
* modelo físico → atualizar `schema.prisma`;
* regras operacionais para agentes → atualizar `context.md`;
* mudança significativa → registrar no OpenSpec.

Não utilizar `context.md` para substituir decisões detalhadas do `SPEC.md`.

Não alterar documentação apenas para justificar uma implementação incorreta.

---

# 15. TLC Spec-Driven Development

O TLC Spec-Driven Development é o processo principal de desenvolvimento.

O TLC deve ser utilizado para:

1. especificar;
2. analisar;
3. projetar quando necessário;
4. decompor em tarefas;
5. executar;
6. testar;
7. validar;
8. manter rastreabilidade.

O agente deve evitar iniciar implementação significativa enquanto requisitos necessários ainda estiverem indefinidos.

Para mudanças pequenas, o fluxo pode ser:

```text
TLC
 ↓
Tasks
 ↓
Execute
 ↓
Tests
```

Para mudanças maiores:

```text
TLC Specify
 ↓
Design
 ↓
Tasks
 ↓
Execute
 ↓
Tests
 ↓
Verification
```

A necessidade de cada etapa deve ser avaliada conforme o tamanho e risco da mudança.

---

# 16. OpenSpec

OpenSpec é o mecanismo de governança para mudanças significativas.

Utilizar OpenSpec quando uma mudança:

* adiciona funcionalidade;
* remove funcionalidade;
* altera comportamento;
* altera requisitos;
* altera arquitetura;
* altera contratos de API;
* altera modelo de dados;
* altera autenticação/autorização;
* altera segurança relevante;
* adiciona integração externa;
* altera fluxos críticos;
* exige nova decisão arquitetural;
* exige atualização significativa do estado permanente.

O OpenSpec deve representar o delta entre o estado atual e o estado desejado.

Uma change não deve copiar integralmente:

* `SPEC.md`;
* `DESIGN.md`;
* `context.md`;
* `schema.prisma`.

---

# 17. Relação entre TLC e OpenSpec

TLC e OpenSpec são complementares.

```text
TLC
 ↓
Define e conduz o desenvolvimento

OpenSpec
 ↓
Formaliza e governa mudanças significativas
```

Fluxo recomendado para uma mudança significativa:

```text
TLC / identificação do problema
          ↓
OpenSpec Explore
          ↓
OpenSpec Propose
          ↓
Revisão
          ↓
OpenSpec Apply
          ↓
TLC Execute
          ↓
Testes
          ↓
Verification
          ↓
OpenSpec Archive / Sync
          ↓
Consolidação no estado permanente
```

O workflow exato de artefatos deve seguir as skills e a versão do OpenSpec instalada no projeto.

O agente não deve inventar artefatos ou etapas que não existam na instalação utilizada.

---

# 18. Classificação de mudanças

## Mudanças pequenas

Podem utilizar diretamente TLC quando não alterarem significativamente o comportamento, requisitos, arquitetura ou contratos.

Exemplos:

* correção localizada;
* refatoração sem alteração de comportamento;
* expansão de testes;
* correção de documentação;
* melhoria interna de implementação.

Fluxo:

```text
TLC → Tasks → Execute → Tests
```

## Mudanças significativas

Devem utilizar OpenSpec.

Exemplos:

* nova funcionalidade;
* novo requisito;
* alteração de API;
* alteração de banco;
* nova integração;
* mudança de autenticação;
* mudança arquitetural;
* alteração de comportamento da IA;
* nova Tool do Agente;
* mudança importante de segurança.

Fluxo:

```text
TLC
 ↓
OpenSpec
 ↓
Review
 ↓
Apply
 ↓
TLC Execute
 ↓
Tests
 ↓
Verification
 ↓
Archive / Sync
```

Na dúvida, tratar a mudança como significativa.

---

# 19. Regra de conflito

Quando houver divergência entre:

* requisito;
* `SPEC.md`;
* `DESIGN.md`;
* `schema.prisma`;
* `context.md`;
* OpenSpec;
* código;
* testes;

o agente não deve assumir automaticamente qual está correto.

Deve:

1. identificar a divergência;
2. identificar os artefatos envolvidos;
3. verificar se existe uma OpenSpec Change relacionada;
4. determinar qual é o estado desejado;
5. verificar a autoridade do artefato afetado;
6. corrigir a implementação ou documentação;
7. executar os testes necessários;
8. atualizar os artefatos permanentes quando a decisão estiver consolidada.

Código existente não substitui automaticamente a especificação.

Documentação também não deve ser alterada apenas para justificar código incorreto.

---

# 20. Ordem de autoridade

A ordem de autoridade deve ser interpretada por responsabilidade, e não como uma hierarquia absoluta entre arquivos.

## Requisitos e produto

`SPEC.md`

## Design visual

`DESIGN.md`

## Modelo físico de dados

`schema.prisma`

## Mudança em andamento

`OpenSpec change`

## Regras operacionais do agente

`context.md`

## Implementação

Código existente

Quando houver conflito, deve ser analisado o tipo de decisão envolvida.

`context.md` não pode sobrescrever uma decisão permanente registrada no `SPEC.md`.

---

# 21. Regra antes de implementar

Antes de iniciar uma implementação significativa, o agente deve:

1. ler `context.md`;
2. ler as partes relevantes do `SPEC.md`;
3. consultar `DESIGN.md` se houver impacto visual;
4. consultar `schema.prisma` se houver impacto no modelo de dados;
5. verificar o estado real do código;
6. verificar se existe OpenSpec Change relacionada;
7. identificar pendências que bloqueiam a implementação;
8. verificar componentes, módulos e serviços existentes;
9. evitar duplicação;
10. não inventar requisitos;
11. não escolher decisões marcadas como `TBD`;
12. definir ou validar as tasks antes da execução.

---

# 22. Regra durante a implementação

Durante a execução:

* implementar somente o escopo definido;
* não expandir funcionalidades por iniciativa própria;
* não alterar arquitetura sem formalização;
* não alterar contratos sem especificação;
* respeitar o Design System;
* respeitar o modelo Prisma;
* validar entradas;
* validar autorização;
* manter logs e auditoria quando aplicável;
* escrever testes para comportamento relevante;
* evitar código duplicado;
* preservar compatibilidade quando necessária.

Se surgir uma decisão não especificada que seja necessária para continuar, o agente deve parar naquela parte e registrar a pendência em vez de inventar uma solução.

---

# 23. Regra após a implementação

Após implementar uma mudança:

1. executar testes;
2. verificar tipos;
3. executar lint quando configurado;
4. validar comportamento;
5. verificar impactos em documentação;
6. atualizar `SPEC.md` quando uma decisão permanente tiver sido consolidada;
7. atualizar `DESIGN.md` quando houver alteração permanente no Design System;
8. atualizar `schema.prisma` quando houver alteração permanente no modelo físico;
9. atualizar `context.md` quando houver nova regra operacional relevante;
10. concluir ou arquivar a OpenSpec Change conforme o workflow instalado.

---

# 24. Princípios fundamentais

O projeto segue estes princípios:

```text
SPEC.md
   ↓
Requisitos e regras
   ↓
Backend
   ↓
Domínio
   ↓
PostgreSQL / Analytics
   ↓
Dados estruturados
   ↓
Dashboard / AI
   ↓
Web / Mobile
```

Para ações da IA:

```text
Usuário
   ↓
AI Agent
   ↓
Tool
   ↓
Backend
   ↓
Domain Service
   ↓
PostgreSQL
```

A IA não substitui:

* banco de dados;
* Backend;
* regras de negócio;
* autorização;
* cálculos determinísticos.

A IA atua como camada de interpretação, assistência e execução controlada.

---

# 25. Regra final para agentes

O agente deve sempre preferir:

**especificar antes de implementar;**

**verificar antes de assumir;**

**reutilizar antes de duplicar;**

**formalizar antes de alterar decisões;**

**testar antes de considerar concluído;**

**consolidar antes de considerar uma mudança permanente.**

Quando houver dúvida relevante, o agente deve apresentar a dúvida e não inventar uma decisão.
