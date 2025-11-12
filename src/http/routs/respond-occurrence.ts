import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";
import type { Prisma } from "@prisma/client";

export async function respondOccurrence(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/respond-occurrence",
    {
      schema: {
        body: z.object({
          email: z.string().trim(),
          occurrenceId: z.number().int(),
          vehicleIds: z.array(z.number().int()).optional(),
          statusOccurrence: z.enum(["REGISTRADO", "ATENDENDO", "FINALIZADO"]),
          description: z.string().trim().min(1),
        }),
      },
    },
    async (request, response) => {
      try {
        const { email, occurrenceId, vehicleIds, statusOccurrence, description } =
          request.body as {
            email: string;
            occurrenceId: number;
            vehicleIds?: number[];
            statusOccurrence: "REGISTRADO" | "ATENDENDO" | "FINALIZADO";
            description: string;
          };

        const emailLocaleLowerCase = email.toLowerCase();

        const user = await prisma.user.findUnique({ where: { email: emailLocaleLowerCase } });
        if (!user) {
          return response.status(404).send({ message: "Usuário não encontrado." });
        }

        const masterRecord = await prisma.master.findUnique({ where: { userId: user.id } });
        if (!masterRecord) {
          console.log("======= //// Erro de Validação: Usuário não tem registro Master ///// =======");
          return response.status(401).send({ message: "cod06: Usuário não tem permissão." });
        }

        const occurrence = await prisma.occurrence.findUnique({ where: { id: occurrenceId } });
        if (!occurrence) {
          return response.status(404).send({ message: "Ocorrência não encontrada." });
        }

        const createdResponses = await prisma.$transaction(async (tx) => {
          // Atualiza status da ocorrência
          await tx.occurrence.update({
            where: { id: occurrenceId },
            data: { statusOccurrence },
          });

          const results: Prisma.IncidentResponseGetPayload<{
            include: { incidentVehicles: { include: { vehicle: true } }; Status: true };
          }>[] = [];

          // Cria um IncidentResponse único ligado à ocorrência e ao usuário (incluindo veículos se fornecidos)
          const ir = await tx.incidentResponse.create({
            data: {
              userId: user.id,
              occurrenceId,
              dateStartDisplacement: new Date(),
            },
          });

          // cria registros na tabela de junção para cada veículo (se houver)
          if (vehicleIds && vehicleIds.length > 0) {
            for (const vid of vehicleIds) {
              await tx.incidentResponseVehicle.create({
                data: {
                  incidentResponseId: ir.id,
                  vehicleId: vid,
                },
              });
            }
          };

          // Cria status inicial vinculado ao IncidentResponse
          await tx.status.create({
            data: {
              incidentResponseId: ir.id,
              statusIncidentResponse: "INICIO",
              description,
            },
          });

          // Recupera o IncidentResponse com relacionamentos para retorno
          const irWithRelations = await tx.incidentResponse.findUnique({
            where: { id: ir.id },
            include: {
              incidentVehicles: { include: { vehicle: true } },
              Status: true,
            },
          });

          if (irWithRelations) results.push(irWithRelations);

          return results;
        });

        return response.status(201).send({ incidentResponses: createdResponses });
      } catch (error) {
        console.error("Erro em respond-occurrence:", error);
        return response.status(500).send({ message: "Erro interno." });
      }
    }
  );
}