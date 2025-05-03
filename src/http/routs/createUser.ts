import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";
import bcrypt from "bcrypt";
import {onlyNumber} from "../../function/onlyNumber"

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create-user",
    {
      schema: {
        body: z.object({
          userName: z.string().trim(),
          cpf: z.string().trim(),
          addressStreet: z.string().trim(),
          addressNumber: z.string().trim(),
          addressDistrict: z.string().trim(),
          addressCity: z.string().trim(),
          addressState: z.string().trim(),
          addressCEP: z.string().trim(),
          addressComp: z.string().trim().optional(),
          addressIbge: z.string().trim().optional(),
          phone: z.string().trim(),
          email: z.string().email().trim(),
          password: z.string().trim(),
        }),
      },
    },
    async (request, response) => {
      //desestruturação da requisição recebida, para pegar os campos
      const {
        userName,
        cpf,
        addressStreet,
        addressNumber,
        addressDistrict,
        addressCity,
        addressState,
        addressCEP,
        addressComp,
        phone,
        email,
        password,
        addressIbge
      } = request.body;
      
      const emailLocaleLowerCase = email.toLocaleLowerCase()
      //_______________________//// Validações \\\\___________________________//

      //Incluir validações aqui

      // Validação para verificar se já existe um usuário com o CPF informado
      const existingUserWithCpf = await prisma.user.findUnique({
        where: { cpf: onlyNumber(cpf) },
      });

      if (existingUserWithCpf) {
        console.log(" ======= //// Erro de Validação: CPF ja existe /// ========");
        return response.status(400).send({ message: "CPF já cadastrado" });
      }

      // Validação para verificar se já existe um usuário com o Email informado
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: emailLocaleLowerCase },
      });

      if (existingUserWithEmail) {
        console.log("======= //// Erro de Validação: E-mail ja existe ///// =======");
        return response.status(400).send({ message: "Usuário já cadastrado" });
      }

      //_______________________// Criando no Banco de Dados\\_________________//
      //Caso passe nas validações vai criar usuário no banco de dados

      //Cria hash da senha para salvar no banco de dados
      const hashPassword = await bcrypt.hash(password, 6);

      //console.log('TESTE: ',email)

     

 
      /*
      if (addressFull) {
        Object.assign(data, {addressFull:addressFull})
      }*/
     
        //console.log(addressIbge)
      await prisma.user.create({
        data: {
          userName: userName,
          cpf:onlyNumber(cpf),
          phone:onlyNumber(phone),
          email: emailLocaleLowerCase,
          password: hashPassword,
          addressStreet,
          addressNumber,
          addressDistrict,
          addressCity,
          addressState,
          addressCEP,
          addressComp,
          addressIbge,
        }
      });
      console.log("======= //// Create user //// =======");
      return response.status(201).send({ status: "Success Created" });
    }
  );
}
