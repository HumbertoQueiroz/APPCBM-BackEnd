import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function getIncidentResponse(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/incident-response/:id/responses",
    {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/, "id deve ser inteiro"),
        }),
        querystring: z.object({
          email: z.string().trim(),
        }),
      },
    },
    async (request, response) => {
      try {
        const { id } = request.params as { id: string };
        const { email } = request.query as { email: string };
        const occurrenceId = Number(id);
        const emailLocaleLowerCase = email.toLowerCase();
        // verifica se usuário existe
        const user = await prisma.user.findUnique({
          where: { email: emailLocaleLowerCase },
        });

        if (!user) {
          console.log("Usuário solicitante não encontrado:", emailLocaleLowerCase);
          return response.status(404).send({ message: "cod07: Usuário que está solicitando informação não existe." });
        }

        // verifica se é master (permissão)
        const isMaster = await prisma.master.findFirst({
          where: { userId: user.id },
        });

        if (!isMaster) {
          console.log("Usuário sem permissão (não é master):", user.id);
          return response.status(403).send({ message: "cod08: Usuário que está solicitando informação não tem permissão." });
        }


         // busca incident responses associados
        const incidentResponses = await prisma.incidentResponse.findMany({
          where: { occurrenceId },
          orderBy: { dateInit: "desc" },
          include: {
            incidentVehicles: { include: { vehicle: true } },
            Status: { orderBy: { date: "asc" } },
            userResponse: { select: { id: true, userName: true, email: true, phone: true } },
          },
        });

        return response.status(200).send(incidentResponses);
      } catch (error) {
        console.error("Erro ao buscar IncidentResponses por Occurrence:", error);
        return response.status(500).send({ message: "Erro interno." });
      }
    }
  );
}