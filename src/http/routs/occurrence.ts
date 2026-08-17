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
          user: z.string().trim().max(254, {message:"E-mail deve ter máximo de 254 caracteres"}).min(3,{message:"E-mail deve ter mínimo de 3 caracteres"}),
          natOco: z.string().trim().min(5,{message:"Natureza da Ocorrência deve ter no mínimo 5 caracteres"}).max(50,{message:"Natureza da Ocorrência deve ter no máximo 50 caracteres"}) ,
          geoLat: z.number().min(-90, {message:"Latitude deve estar entre -90 e 90"}).max(90, {message:"Latitude deve estar entre -90 e 90"}).optional(),
          geoLong: z.number().min(-180, {message:"Longitude deve estar entre -180 e 180"}).max(180, {message:"Longitude deve estar entre -180 e 180"}).optional(),
          addressNum: z.string().trim().max(254, {message:"Numero do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressLog: z.string().trim().max(500, {message:"Logradouro/Rua/Avenida do endereço deve ter máximo de 500 caracteres"}).optional(),
          addressBairro: z.string().trim().max(254, {message:"Bairro do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressCity: z.string().trim().max(254, {message:"Cidade do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressState: z.string().trim().max(254, {message:"Estado do endereço deve ter máximo de 254 caracteres"}).optional(),
          addressCEP: z.string().trim().max(9, {message:"CEP do endereço deve ter máximo de 9 caracteres"}).optional(),
          addressComp: z.string().trim().max(500, {message:"Complemento do endereço deve ter máximo de 500 caracteres"}).optional(),
          description: z.string().trim().max(1000, {message:"Descrição da ocorrência deve ter máximo de 1000 caracteres"}).min(7,{message:"Descrição da ocorrência deve ter mínimo de 7 caracteres"}),
          hasVictim: z.boolean(),
          victimsQuantity: z.number().max(999999, {message:"Quantidade de vítimas deve ter máximo de 999999 caracteres"}).optional(),
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
      console.log("emailLocaleLowerCase: ",emailLocaleLowerCase);

      // Validação para verificar se já existe um usuário com o Email informado
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { email: emailLocaleLowerCase },
      });
      console.log("existingUserWithEmail: ",existingUserWithEmail)

      
      if (!existingUserWithEmail) {
        //console.log("======= //// Erro de Validação: Usuário não existe ///// =======");
        return response.status(401).send({ message: "cod03: Não autorizado registrar ocorrência, usuário não registrado" });
      }
      // Coordenadas são gravadas como número (Float), permitindo cálculo de
      // distância no banco. Ausência de localização é gravada como null.
      const latitude = geoLat ?? null;
      const longitude = geoLong ?? null;
      
      if(hasVictim){
        if(!victimsQuantity )
        return response.status(400).send({ message: "cod04: Informado que tem vítima(s), mas não informado a quantidade, favor verificar." });
        if(!conditionVictim || conditionVictim.trim().length < 3 ){
          return response.status(400).send({ message: "cod05: Informado que tem vítima(s), mas não informado a condição da(s) vítima(s), favor verificar." });
        }
      }
      if(existingUserWithEmail){
        const dataOccurrence = {
          userId: existingUserWithEmail.id,
          natOco,
          geoLat: latitude,
          geoLong: longitude,
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

        //console.log("dados do user: ",existingUserWithEmail)
        // Verificação de duplicidade nos últimos 3 minutos
        const now = new Date();
        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

        const existingOccurrence = await prisma.occurrence.findFirst({
          where: {
            userId: existingUserWithEmail.id,
            natOco,
            geoLat: latitude,
            geoLong: longitude,
            addressNum,
            addressLog,
            addressBairro,
            createdAt: {
              gte: threeMinutesAgo,
            },
          },
        });

        if (existingOccurrence) {
          return response.status(409).send({ message: "Já existe uma ocorrência registrada com os mesmos dados nos últimos minutos." });
        }
        console.log("dados da ocorrência: ",dataOccurrence)
        await prisma.occurrence.create({
          data: dataOccurrence
        });
  

      
        return response.status(200).send({ message: "Ocorrência registrada." });
      }
    }
  )
}