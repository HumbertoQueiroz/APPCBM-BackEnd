# Prisma — comandos de referência

## Criar uma migration

Após alterar `prisma/schema.prisma`, gera o arquivo de migração e aplica as
mudanças no banco de desenvolvimento:

```bash
npx prisma migrate dev
```

## Aplicar migrations pendentes

Aplica apenas as migrations ainda não executadas, sem criar novas. É o comando
usado em produção e em pipelines de deploy:

```bash
npx prisma migrate deploy
```

## Ver o estado das migrations

Mostra quais migrations já foram aplicadas no banco:

```bash
npx prisma migrate status
```

## Resetar o banco

Apaga o banco e recria aplicando todas as migrations desde o início.
**Destrutivo — nunca rode em produção.**

```bash
npx prisma migrate reset
```

## Regenerar o client

Necessário sempre que o schema mudar, para que os tipos do TypeScript
acompanhem:

```bash
npx prisma generate
```

## Migrations com conversão de tipo

Quando a mudança de tipo exige transformação dos dados existentes, a migration
gerada automaticamente falha — ela emite um `ALTER COLUMN` simples, sem saber
converter o conteúdo. Nesse caso, escreva o arquivo à mão com uma cláusula
`USING`.

Exemplo, de `20260816120000_geolocation_string_to_float`:

```sql
ALTER TABLE "public"."Occurrence"
  ALTER COLUMN "geoLat" TYPE DOUBLE PRECISION
    USING NULLIF(TRIM(REPLACE("geoLat", ',', '.')), '')::DOUBLE PRECISION;
```

Antes de aplicar, verifique se todos os valores convertem:

```sql
SELECT count(*) FROM "Occurrence"
WHERE "geoLat" IS NOT NULL
  AND "geoLat" !~ '^-?[0-9]+([.,][0-9]+)?$';
```

Se o retorno for maior que zero, a migration abortaria no meio — trate esses
registros antes.

## Deploy na VPS (DigitalOcean)

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

> A CLI do Prisma deve estar fixada nas `devDependencies` do projeto
> (`npm i -D prisma@6.19.0`). Sem isso, o `npx prisma` baixa a última versão
> publicada, que pode ser incompatível com o schema.
