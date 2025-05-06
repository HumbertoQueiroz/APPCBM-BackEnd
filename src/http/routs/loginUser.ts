import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../libe/prisma";
import bcrypt from "bcrypt";

export async function loginUser (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login-user",
    {
      schema: {
        body: z.object({
          email: z.string().trim(),
          password: z.string().trim(),
        }),
      },
    },
    async (request, response) => {
      //desestruturação da requisição recebida, para pegar os campos
      const {
        email,
        password
      } = request.body;

      const emailLocaleLowerCase = email.toLocaleLowerCase()

      // Validação para verificar se já existe um usuário com o Email informado
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: emailLocaleLowerCase },
      });

      if (!existingUserWithEmail) {
        console.log("======= //// Erro de Validação: Usuário não existe ///// =======");
        return response.status(401).send({ message: "cod01: Usuário ou senha incorreto." });
      }

      if(existingUserWithEmail){
        const passwordIsValid = await bcrypt.compare(password,existingUserWithEmail.password)
        if(!passwordIsValid){
          console.log("======= //// Erro de Validação: Senha Incorreta ///// =======");
          return response.status(401).send({ message: "cod02: Usuário ou senha incorreto." });
        } 
        return response.status(200).send({ message: "Autorizado login." });
      }
    }
  )
}