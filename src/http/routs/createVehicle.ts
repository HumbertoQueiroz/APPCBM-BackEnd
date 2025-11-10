import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function createVehicle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create-vehicle",
    {
      schema: {
        body: z.object({
          email: z.string().trim(),
          placa: z.string().trim().min(6),
          type: z.string().trim().min(1),
          model: z.string().trim(),
          description: z.string().trim().optional(),
        }),
      },
    },
    async (request, response) => {
      try {
        const { email, placa, type, model, description } = request.body as {
          email: string;
          placa: string;
          type: string;
          model: string;
          description?: string;
        };

         // limpa a placa: remove caracteres especiais, mantém apenas letras e números e converte para maiúsculas
        const placaClean = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (placaClean.length !== 7) {
          console.log("Erro: ", placaClean)
          return response.status(400).send({ message: "Placa inválida. Deve conter 6 caracteres alfanuméricos após remover caracteres especiais." });
        }

        const emailLocaleLowerCase = email.toLocaleLowerCase();

        const userWhoIsCreatingRecord = await prisma.user.findUnique({
          where: { email: emailLocaleLowerCase },
        });

        if (!userWhoIsCreatingRecord) {
          console.log("======= //// Erro de Validação: Usuário solicitante não existe ///// =======");
          return response.status(401).send({ message: "cod09: Usuário que está criando veículo não existe." });
        }

        // Verifica placa duplicada
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { placa: placaClean },
        });

        if (existingVehicle) {
          return response.status(409).send({ message: "Veículo com mesma placa já existe." });
        }

        const created = await prisma.vehicle.create({
          data: {
            placa: placaClean,
            type,
            model: model,
            description: description ?? null,
            userId: userWhoIsCreatingRecord.id, // campo mapeado para createdBy
          },
        });

        return response.status(201).send(created);
      } catch (error) {
        console.error("Erro ao cadastrar veículo:", error);
        return response.status(500).send({ message: "Erro interno ao cadastrar veículo." });
      }
    }
  );
}