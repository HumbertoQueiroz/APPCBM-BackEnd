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
          user: z.string().email().trim().max(254, {message:"E-mail deve ter máximo de 254 caracteres"}).min(7,{message:"E-mail deve ter mínimo de 7 caracteres"}),
          natOco: z.string().trim().min(5,{message:"Natureza da Ocorrência deve ter no mínimo 5 caracteres"}).max(50,{message:"Natureza da Ocorrência deve ter no máximo 50 caracteres"}) ,
          geoLat: z.number().optional(),
          geoLong: z.number().optional(),
          addressNum: z.string().trim().max(254, {message:"Numero do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressLog: z.string().trim().max(500, {message:"Logradouro/Rua/Avenida do endereço deve ter máximo de 500 caracteres"}).optional(),
          addressBairro: z.string().trim().max(254, {message:"Bairro do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressCity: z.string().trim().max(254, {message:"Cidade do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressState: z.string().trim().max(254, {message:"Estado do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressCEP: z.string().trim().max(9, {message:"CEP do endereço deve ter máximo de 9 caracteres"}).optional(),
          addressComp: z.string().trim().max(500, {message:"Complemento do endereço deve ter máximo de 500 caracteres"}).optional(),
          description: z.string().trim().max(1000, {message:"Descrição da ocorrência deve ter máximo de 1000 caracteres"}).min(7,{message:"Descrição da ocorrência deve ter mínimo de 7 caracteres"}),
          hasVictim: z.boolean(),
          victimsQuantity: z.number().optional(),
          conditionVictim: z.string().trim().max(254, {message:"Condição da(s) vítima(s) deve ter máximo de 254 caracteres"}).optional(),
        }),
      },
    },
    async (request, response) => {
      //desestruturação da requisição recebida, para pegar os campos
      const {
          user,
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
        const dataOccurrence = {
          userId: existingUserWithEmail.id,
          natOco,geoLat,
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

        }
        
        console.log("dados do user: ",existingUserWithEmail)
        console.log("dados da ocorrência: ",dataOccurrence)
      
        return response.status(200).send({ message: "Autorizado login." });
      }
    }
  )
}