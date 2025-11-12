import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";
import { occurrence } from "./occurrence";

export async function isTrote(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trote",
    {
      schema: {
        body: z.object({
          email: z.string().email().trim(),
          occurrenceId: z.number().int(),
          value: z.boolean(),
        }),
      },
    },
    async (request, response) => {
      try {
        const { email, occurrenceId, value } = request.body as {
          email: string;
          occurrenceId: number;
          value: boolean;
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

        // verifica ocorrência
        const occurrence = await prisma.occurrence.findUnique({
          where: { id: occurrenceId },
        });
        if (!occurrence) {
          return response
            .status(404)
            .send({ message: "Ocorrência não encontrada." });
        }

        // se já estiver no mesmo estado solicitado, retorna informação
        if (occurrence.isTrote === value) {
          const msg = value
            ? "Ocorrência já marcada como trote."
            : "Ocorrência já desmarcada como trote.";
          return response.status(200).send({ message: msg, occurrence });
        }

        const updated = await prisma.occurrence.update({
          where: { id: occurrenceId },
          data: { isTrote: value },
        });

        const successMsg = value
          ? "Ocorrência marcada como trote."
          : "Ocorrência desmarcada como trote.";

        return response
          .status(200)
          .send({ message: successMsg, occurrence: updated });
      } catch (error) {
        console.error("Erro ao marcar trote:", error);
        return response
          .status(500)
          .send({ message: "Erro interno ao processar requisição." });
      }
    }
  );
}
