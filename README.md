# App193 — API

API do sistema de acionamento de emergências do **Corpo de Bombeiros Militar de
Campo Verde (MT)**. Recebe as ocorrências registradas pelos cidadãos no
aplicativo mobile e serve o painel de despacho utilizado pela guarnição.

Trabalho de conclusão do curso de Análise e Desenvolvimento de Sistemas —
IFMT Câmpus Campo Verde. Trabalho reconhecido com **Troféu de Mérito
Estudantil** na 1ª Jornada de Ensino, Pesquisa e Extensão do câmpus, em 2025.
![alt text](IMG_20251206_095643.jpg)

## Stack

Node.js · TypeScript · Fastify 5 · Prisma 6 · PostgreSQL · Zod · bcrypt · Docker · Biome

## Rodando localmente

Requisitos: Node.js 20+ e Docker.

```bash
git clone https://github.com/HumbertoQueiroz/APPCBM-BackEnd
cd APPCBM-BackEnd
npm install

docker compose up -d          # sobe o PostgreSQL na porta 5444
```

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5444/appcbm?schema=public"
```

Aplique as migrations, popule a base e suba o servidor:

```bash
npx prisma migrate deploy
npm run seed
npm run dev                   # http://localhost:8080
```

O endpoint raiz (`GET /`) responde com o status da API e a conectividade com o
banco — use para verificar se subiu corretamente.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |

## Endpoints

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/login-user` | Login do cidadão |
| `POST` | `/login-admin` | Login do militar |

### Cadastros

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/create-user` | Cadastro de cidadão |
| `POST` | `/create-admin` | Cadastro de militar |
| `POST` | `/create-vehicle` | Cadastro de viatura |
| `GET` | `/list-vehicles` | Listagem da frota |

### Ocorrências

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/create-occurrence` | Registro de ocorrência pelo cidadão |
| `POST` | `/list-occurrence` | Listagem de ocorrências |
| `POST` | `/trote` | Marcação de ocorrência como trote |
| `POST` | `/finished-occurrence` | Encerramento da ocorrência |

### Atendimento

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/respond-occurrence` | Despacho de atendimento |
| `POST` | `/create-status` | Registro de mudança de status |
| `GET` | `/incident-response/:id/responses` | Atendimentos de uma ocorrência |

## Modelo de dados

| Modelo | Responsabilidade |
|---|---|
| `User` | Cidadão ou militar, com papel `ADM`, `USR` ou `SUPPORT` |
| `Master` | Dados funcionais do militar (matrícula, posto) |
| `Occurrence` | Ocorrência registrada pelo cidadão |
| `IncidentResponse` | Atendimento despachado para uma ocorrência |
| `IncidentResponseVehicle` | Viaturas empenhadas no atendimento (N:N) |
| `Vehicle` | Frota de viaturas |
| `Status` | Histórico de mudanças de status do atendimento |

## Decisões de projeto

**Login sem enumeração de usuários.** "Usuário não encontrado" e "senha
incorreta" retornam a mesma mensagem e o mesmo status. Revelar qual dos dois
falhou permitiria descobrir quais e-mails existem na base.

**Senhas com bcrypt**, nunca em texto puro.

**Validação e serialização com Zod** via `fastify-type-provider-zod`: o mesmo
schema valida a entrada e tipa a resposta, eliminando divergência entre o que a
API aceita e o que ela devolve.

**Trilha de auditoria.** Data e usuário de inclusão são imutáveis; alterações
posteriores gravam em campos próprios. Em um sistema de emergência o histórico
de uma ocorrência precisa ser reconstituível — quem registrou, quando, e o que
mudou depois.

**Bloqueio de ocorrências duplicadas.** Registros idênticos do mesmo usuário
dentro de 3 minutos são rejeitados, evitando chamados repetidos por toque
acidental ou instabilidade de rede.

**Coordenadas como `Float`.** Latitude e longitude são gravadas como
`double precision`, permitindo cálculo de distância e ordenação por
proximidade diretamente no banco.

## Documentação adicional

- [Comandos do Prisma](docs/prisma.md)

## Projeto completo

| Camada | Repositório |
|---|---|
| App mobile | [APP-CBM-CAMPO-VERDE](https://github.com/HumbertoQueiroz/APP-CBM-CAMPO-VERDE) |
| API | este repositório |
| Painel web | [AppCbmWeb](https://github.com/HumbertoQueiroz/AppCbmWeb) |
