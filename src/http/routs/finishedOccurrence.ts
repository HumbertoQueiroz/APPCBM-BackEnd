import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function finishedOccurrence(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/finished-occurrence",
    {
      schema: {
        body: z.object({
          email: z.string().email().trim(),
          incidentResponseId: z.number().int(),
          statusIncidentResponse: z.enum(["FINALIZACAO", "OBSERVACAO"]),
          description: z.string().trim().min(1),
          // flags opcionais: se true -> grava data atual para o respectivo campo
          dateArrivalOccurrence: z.boolean().optional(),
          arrivalHospital: z.boolean().optional(),
          dateReturn: z.boolean().optional(),
          // flag to indicate finalization (true) or reopening (false). Default = true
          finalize: z.boolean().optional(),
        }),
      },
    },
    async (request, response) => {
      try {
        const {
          email,
          incidentResponseId,
          statusIncidentResponse,
          description,
          dateArrivalOccurrence,
          arrivalHospital,
          dateReturn,
          finalize,
        } = request.body as {
          email: string;
          incidentResponseId: number;
          statusIncidentResponse: "FINALIZACAO" | "OBSERVACAO";
          description: string;
          dateArrivalOccurrence?: boolean;
          arrivalHospital?: boolean;
          dateReturn?: boolean;
          finalize?: boolean;
        };

        const emailLocaleLowerCase = email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: emailLocaleLowerCase },
        });
        if (!user) {
          return response
            .status(404)
            .send({ message: "Usuário não encontrado." });
        }

        const masterRecord = await prisma.master.findUnique({
          where: { userId: user.id },
        });
        if (!masterRecord) {
          console.log(
            "======= //// Erro de Validação: Usuário não tem registro Master ///// ======="
          );
          return response
            .status(401)
            .send({ message: "cod06: Usuário não tem permissão." });
        }

        // verifica incidentResponse
        const incidentResponse = await prisma.incidentResponse.findUnique({
          where: { id: incidentResponseId },
        });
        if (!incidentResponse) {
          return response
            .status(404)
            .send({ message: "Resposta de incidente não encontrada." });
        }

        // se enviaram flags opcionais === true, atualize IncidentResponse com data atual
        const incidentUpdates: { [k: string]: Date } = {};
        if (dateArrivalOccurrence === true) {
          incidentUpdates.dateArrivalOccurrence = new Date();
        }
        if (arrivalHospital === true) {
          incidentUpdates.arrivalHospital = new Date();
        }
        if (dateReturn === true) {
          incidentUpdates.dateReturn = new Date();
        }

        let updatedIncidentResponse = null;
        if (Object.keys(incidentUpdates).length > 0) {
          updatedIncidentResponse = await prisma.incidentResponse.update({
            where: { id: incidentResponseId },
            data: incidentUpdates,
          });
        }

        // marcar ocorrência como finalizada
        const occurrenceId = incidentResponse.occurrenceId;
        const occurrence = await prisma.occurrence.findUnique({
          where: { id: occurrenceId },
        });
        if (!occurrence) {
          return response
            .status(404)
            .send({ message: "Ocorrência relacionada não encontrada." });
        }
        const shouldFinalize = finalize !== false; // default true

        if (shouldFinalize) {
          // cria status de finalização (mantendo lógica atual)
          const createdStatus = await prisma.status.create({
            data: {
              incidentResponseId: incidentResponseId,
              statusIncidentResponse,
              description,
            },
          });

          const updatedOccurrence = await prisma.occurrence.update({
            where: { id: occurrenceId },
            data: { statusOccurrence: "FINALIZADO", finishedIn: true },
          });

          return response.status(201).send({
            message: "Finalizado ocorrência com sucesso.",
            status: createdStatus,
            incidentResponse: updatedIncidentResponse,
            occurrence: updatedOccurrence,
          });
        }
        // Reabrir ocorrência: setar statusOccurrence = ATENDENDO e criar novo status com texto "OCORRÊNCIA REABERTA" + descrição
        const updatedOccurrence = await prisma.occurrence.update({
          where: { id: occurrenceId },
          data: { statusOccurrence: "ATENDENDO" },
        });

        const reopenDescription = `OCORRÊNCIA REABERTA\n${description}`;

        const createdStatus = await prisma.status.create({
          data: {
            incidentResponseId: incidentResponseId,
            statusIncidentResponse: "OBSERVACAO",
            description: reopenDescription,
          },
        });

        return response.status(200).send({
          message: "Ocorrência reaberta com sucesso.",
          status: createdStatus,
          incidentResponse: updatedIncidentResponse,
          occurrence: updatedOccurrence,
        });
      } catch (error) {
        console.error("Erro ao criar status:", error);
        return response
          .status(500)
          .send({ message: "Erro interno ao processar requisição." });
      }
    }
  );
}
