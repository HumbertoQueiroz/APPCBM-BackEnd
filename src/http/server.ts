import fastify from "fastify";
//import { PrismaClient } from '@prisma/client'
import { prisma } from "../libe/prisma";

//const prisma = new PrismaClient()

const app = fastify();

app
	.listen({
		port: 3333,
	})
	.then(() => {
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
		console.log("HTTP server running!2");
	});
