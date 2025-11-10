import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function listVehicles(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/list-vehicles",
    {
      schema: {
        querystring: z.object({
          email: z.string().trim(),
        }),
      },
    },
    async (request, response) => {
      try {
        const { email } = request.query as { email: string };
        const emailLocaleLowerCase = email.toLocaleLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: emailLocaleLowerCase },
        });

        if (!user) {
          return response.status(401).send({ message: "cod07: Usuário que está solicitando informação não existe." });
        }

        const isMaster = await prisma.master.findUnique({
          where: { userId: user.id },
        });

        if (!isMaster) {
          return response.status(401).send({ message: "cod08: Usuário que está solicitando informação não tem permissão." });
        }

        const vehicles = await prisma.vehicle.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        return response.status(200).send(vehicles);
      } catch (error) {
        console.error("Erro ao listar veículos:", error);
        return response.status(500).send({ message: "Erro interno ao listar veículos." });
      }
    }
  );
}