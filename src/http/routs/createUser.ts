import type { FastifyInstance } from "fastify";
import { prisma } from "../../libe/prisma";
import bcrypt from "bcrypt";
import z from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/user",
    {
      schema: {
        body: z.object({
          userName: z.string(),
          cpf: z.string(),
          addressLog: z.string().optional(),
          addressNum: z.string().optional(),
          addressBai: z.string().optional(),
          addressCit: z.string().optional(),
          addressEst: z.string().optional(),
          addressCEP: z.string().optional(),
          addressComp: z.string().optional(),
          telephone: z.string(),
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, response) => {
      //desestruturação da requisição recebida, para pegar os campos
      const {
        userName,
        cpf,
        addressLog,
        addressNum,
        addressBai,
        addressCit,
        addressEst,
        addressCEP,
        addressComp,
        addrressIbge,
        telephone,
        email,
        password,
      } = request.body;

      //_______________________//// Validações \\\\___________________________//

      //Incluir validações aqui

      // Validação para verificar se já existe um usuário com o CPF informado
      const existingUserWithCpf = await prisma.user.findUnique({
        where: { cpf: cpf },
      });

      if (existingUserWithCpf) {
        console.log(' ======= //// CPF ja existe /// ========')
        return response.status(400).send({ error: "CPF já cadastrado" });
      }

      // Validação para verificar se já existe um usuário com o Email informado
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUserWithEmail) {
        console.log('======= //// Email ja existe ///// =======')
        return response.status(400).send({ error: "Usuário já existe" });
      }

      //_______________________// Criando no Banco de Dados\\_________________//
      //Caso passe nas validações vai criar usuário no banco de dados

      //Cria hash da senha para salvar no banco de dados
      const hashPassword = await bcrypt.hash(password, 6);

      //Dados
      let data = {
        userName: userName,
        cpf: cpf,
        telephone: telephone,
        email: email,
        password: hashPassword,
      };
      if (addressFull) {
        Object.assign(data, {addressFull:addressFull})
      }

      await prisma.user.create({
        data: data
      });
      console.log('======= //// Create user //// =======')
      return response.status(201).send({ status: "Success Created" });
    }
  );
}
