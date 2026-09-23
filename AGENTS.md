# EduTrack AI — Agent Instructions

Antes de modificar o projeto:

1. Leia `SPEC.md`.
2. Leia `context.md`.
3. Leia `IMPLEMENTATION.md`.
4. Consulte `schema.prisma` para alterações de banco.
5. Consulte `DESIGN.md` para alterações visuais.
6. Consulte `openspec/` para mudanças em andamento.

Use TLC Spec-Driven Development e OpenSpec conforme as instruções disponíveis no ambiente.

O estado real da implementação deve ser verificado no código, testes, migrations e infraestrutura.

Trabalhe em tarefas pequenas e verificáveis.

Não invente requisitos ou decisões.

Após implementar uma task, execute os testes e faça a verificação antes de avançar.

Continue para a próxima tarefa implementável até concluir o MVP ou encontrar um bloqueio real.

## Terminal

O ambiente de desenvolvimento é Windows/PowerShell.

Prefira comandos compatíveis com PowerShell.

Não use sintaxe Bash/Linux como `|| true`, `ls -la` ou `2>/dev/null` quando houver equivalente PowerShell.

Quando um comando falhar por sintaxe do shell, corrija o comando e continue a tarefa; não trate isso como bloqueio do projeto.
