import fastify from "fastify";
import fastifyCors from "@fastify/cors";
//Jeito antigo
//import { PrismaClient } from '@prisma/client'
//const prisma = new PrismaClient()

import { prisma } from "../libe/prisma";
import { createUser } from "./routs/createUser";
import { loginUser } from "./routs/loginUser";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

//ZOD validador de dados
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

//necessário para aceitar rotas não locais
app.register(fastifyCors);

//Registra nova rota
app.register(createUser);
//Registra nova rota
app.register(loginUser);

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    /*
    async function main() {
      await prisma.user.create({
				data: {
					userName: 'Humberto',
					cpf:'04404846185',
					addressFull:'TES TES TESTE',
					telephone:'5565996452787',
					email: 'humberto@prisma.io',
					password:'123',
				}
			})
				
      const allUsers = await prisma.user.findMany()
      console.log(allUsers)
    }
    main()
    */
    console.log("HTTP server running!");
  });
