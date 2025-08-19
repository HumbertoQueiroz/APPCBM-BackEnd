import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";

export async function occurrence (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create-occurrence",
    {
      schema: {
        body: z.object({
          user: z.string().trim(),
          /*
          natOco: z.string().trim(),
          geoLat: z.number(),
          geoLong: z.number(),
          addressNum: z.string().trim(),
          addressLog: z.string().trim(),
          addressBairro: z.string().trim(),
          addressCity: z.string().trim(),
          addressState: z.string().trim(),
          addressCEP: z.string().trim(),
          addressComp: z.string().trim(),
          description: z.string().trim(),
          hasVictim: z.boolean(),
          victimsQuantity: z.number(),
          conditionVictim: z.string().trim(),
          */
        }),
      },
    },
    async (request, response) => {
      //desestruturação da requisição recebida, para pegar os campos
      const {
          user,
          /*
          natOco,
          geoLat,
          geoLong,
          addressNum,
          addressLog,
          addressBairro,
          addressCity,
          addressState,
          addressCEP,
          addressComp,
          description,
          hasVictim,
          victimsQuantity,
          conditionVictim,
          */
      } = request.body;

      const emailLocaleLowerCase = user.toLocaleLowerCase()

      // Validação para verificar se já existe um usuário com o Email informado
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: emailLocaleLowerCase },
      });

      if (!existingUserWithEmail) {
        console.log("======= //// Erro de Validação: Usuário não existe ///// =======");
        return response.status(401).send({ message: "cod03: Não autorizado registrar ocorrência, usuário não registrado" });
      }

      if(existingUserWithEmail){
        
        console.log(existingUserWithEmail)
      
        return response.status(200).send({ message: "Autorizado login." });
      }
    }
  )
}