import fastify from "fastify";
import fastifyCors from "@fastify/cors";
//Jeito antigo
//import { PrismaClient } from '@prisma/client'
//const prisma = new PrismaClient()

import { prisma } from "../libe/prisma";
import { createUser } from "./routs/createUser";
import { loginUser } from "./routs/loginUser";
import { occurrence } from "./routs/occurrence";
import { loginAdmin } from "./routs/loginAdmin";
import { createAdmin } from "./routs/createAdmin";
import { listOccurrence } from "./routs/listOccurrence";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createVehicle } from "./routs/createVehicle";
import { listVehicles } from "./routs/listVehicles";
import { respondOccurrence } from "./routs/respond-occurrence";

const app = fastify().withTypeProvider<ZodTypeProvider>();

//ZOD validador de dados
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

//necessário para aceitar rotas não locais
app.register(fastifyCors);

// Rota GET para a página inicial com verificação do banco de dados
app.get("/", async (request, reply) => {
  console.log("Get in API rota: '/' \n API Backend online");
  let dbStatus = "";
  try {
    // Testa conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "Banco de dados online";
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    dbStatus = `Banco de dados OFF: ${errMsg}`;
  }
  return {
    message: "API backend online.",
    db: dbStatus,
  };
});

//Registra nova rota
app.register(createUser);
//Registra nova rota
app.register(loginUser); 
//Registra nova rota
app.register(occurrence);
app.register(loginAdmin);
app.register(createAdmin);
app.register(createVehicle);
app.register(listOccurrence);
app.register(listVehicles);
app.register(respondOccurrence);

app
  .listen({
    port: 8080,
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
