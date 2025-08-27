# Backend APPCBM

Será utilizado `node.js`com `typescript` e framework `fastify` [documentação](https://fastify.dev/docs/latest/Guides/Getting-Started/).

## Prisma e Postgresql

### Criar arquivo de migração

Quando realizar uma alteração no  no arquivo `schema.prisma`  executar `npx prisma migrate dev` pois ele verifica o arquivo e se teve alteração cria um arquivo de migração e aplica no banco de dados as alterações.

### Enviar migrações ao banco

Para enviar ao postgresql as migrations do banco (alterações realizadas no arquivo `schema.prisma`) executar:
Este comando é usado para aplicar migrations em ambiente de produção. Ele apenas aplica as migrations que ainda não foram executadas e não cria novas.

Para desenvolvimento:
`npx prisma migrate deploy`

### Mostrar status atual das migrações no banco de dados

Este comando mostra o estado atual das suas migrations, indicando quais já foram aplicadas no banco de dados.

`npx prisma migrate status`

### Resetar o banco de dados

Apaga o banco de dados e recriar aplicando as migrações
`npx prisma migrate reset`
