import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";
import bcrypt from "bcrypt";
import {onlyNumber} from "../../function/onlyNumber"

export async function createAdmin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create-admin",
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
          email: z.string().trim(),
          password: z.string().trim(),
          userWhoIsCreating: z.string().trim(),
          matricula: z.string().trim(),
          position: z.string().trim(),
          createdNewUser: z.boolean(),
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
        addressIbge,
        userWhoIsCreating,
        matricula,
        position,
        createdNewUser,
      } = request.body;
      
      const emailLocaleLowerCase = email.toLocaleLowerCase()
      const userWhoIsCreatingLocaleLowerCase = userWhoIsCreating.toLocaleLowerCase()
      //_______________________//// Validações \\\\___________________________//
      //console.log("======= //// Início Validações //// =======");
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
      //Validação se usuário que solicitou a criação do novo usuário tem permissão
      const userWhoIsCreatingRecord = await prisma.user.findUnique({
        where: { email: userWhoIsCreatingLocaleLowerCase },
      });

      if (!userWhoIsCreatingRecord) {
        console.log("======= //// Erro de Validação: Usuário que está criando o novo usuário não existe ///// =======");
        return response.status(401).send({ message: 'cod05: Usuário que está criando o novo usuário não existe.' });
      }

      const userCreatingHasPermission = await prisma.master.findUnique({
        where: { userId: userWhoIsCreatingRecord.id },
      });

      if(!userCreatingHasPermission?.createdNewUser){

        console.log("======= //// Erro de Validação: Usuário que está criando o novo usuário não tem permissão ///// =======");
        return response.status(401).send({ message: 'cod06: Usuário que está criando o novo usuário não tem permissão.' });
      }

      //_______________________// Criando no Banco de Dados\\_________________//
      //Caso passe nas validações vai criar usuário no banco de dados

      //Cria hash da senha para salvar no banco de dados
      const hashPassword = await bcrypt.hash(password, 6);
      
      //console.log('TESTE: ',email)
 
      // Cria usuário e registro na Master (se aplicável) dentro de uma transação
      const newUser = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            userName,
            cpf: onlyNumber(cpf),
            phone: onlyNumber(phone),
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
            type:'ADM',
          },
        });

        // Cria registro na Master vinculando ao usuário recém criado
        await tx.master.create({
          data: {
            userId: createdUser.id,
            matricula: onlyNumber(matricula),
            createdNewUser,
            position,
            createdByUserId: userWhoIsCreatingRecord.id,
          },
        });

        return createdUser;
      });

      console.log("======= //// Create user + master //// =======");
      return response.status(201).send({ status: "Success Created", userId: newUser.id });
    }
  );
}
