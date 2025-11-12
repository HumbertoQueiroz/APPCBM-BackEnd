import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function createStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create-status",
    {
      schema: {
        body: z.object({
          email: z.string().email().trim(),
          incidentResponseId: z.number().int(),
          statusIncidentResponse: z.enum([
            "COMUNICACAO",
            "OBSERVACAO",
            "LIGACAO",
          ]),
          description: z.string().trim().min(1),
          // flags opcionais: se true -> grava data atual para o respectivo campo
          dateArrivalOccurrence: z.boolean().optional(),
          arrivalHospital: z.boolean().optional(),
          dateReturn: z.boolean().optional(),
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
        } = request.body as {
          email: string;
          incidentResponseId: number;
          statusIncidentResponse: "COMUNICACAO" | "OBSERVACAO" | "LIGACAO";
          description: string;
          dateArrivalOccurrence?: boolean;
          arrivalHospital?: boolean;
          dateReturn?: boolean;
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

        // cria novo status
        const createdStatus = await prisma.status.create({
          data: {
            incidentResponseId: incidentResponseId,
            statusIncidentResponse: statusIncidentResponse,
            description,
          },
        });

        return response.status(201).send({
          message: "Status criado com sucesso.",
          status: createdStatus,
          incidentResponse: updatedIncidentResponse,
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
