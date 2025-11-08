import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function listOccurrence(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/list-occurrence",
    {
      schema: {
       body: z.object({
           email: z.string().trim(),
        }),
      },
    },
    async (request, response) => {
       const {
        email,
      } = request.body;
      const emailLocaleLowerCase = email.toLocaleLowerCase()

       const userWhoIsCreatingRecord = await prisma.user.findUnique({
        where: { email: emailLocaleLowerCase },
      });

      if (!userWhoIsCreatingRecord) {
        console.log("======= //// Erro de Validação: Usuário que está solicitando informação não existe ///// =======");
        return response.status(401).send({ message: 'cod07: Usuário que está solicitando informação não existe.' });
      }

      const userCreatingHasPermission = await prisma.master.findUnique({
        where: { userId: userWhoIsCreatingRecord.id },
      });

      if(!userCreatingHasPermission){

        console.log("======= //// Erro de Validação: Usuário que está solicitando informação não tem permissão ///// =======");
        return response.status(401).send({ message: 'cod08: Usuário que está solicitando informação não tem permissão.' });
      }

const listOccurrence = await prisma.occurrence.findMany({
  orderBy: {
    id: 'desc', // Assume que o 'id' é autoincremental e representa a ordem de criação
  },
  take: 50,
  include: {
    user: {
      select: {
        id: true,
        userName: true,
        email: true,
        phone: true,
        cpf: true,
        addressStreet: true,
        addressNumber: true,
        addressDistrict: true,
        addressCity: true,
        addressState: true,
      },
    },
  },
});

      return response.status(200).send({ listOccurrence });
    }
  );
}