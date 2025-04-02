import type { FastifyInstance } from 'fastify'
import { prisma } from '../../libe/prisma'
import bcrypt from 'bcrypt'
import z from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/user',
    {
      schema: {
        body: z.object({
          userName: z.string(),
          cpf: z.string(),
          telephone: z.string(),
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, response) => {
      const { userName, cpf, telephone, email, password } = request.body

      //Incluir validações aqui

      //

      const hashPassword = await bcrypt.hash(password, 6)
      await prisma.user.create({
        data: {
          userName: userName,
          cpf: cpf,
          telephone,
          email,
          password: hashPassword,
        },
      })
      return response.status(201).send({"status":"Sucesse Created"})
    }
  )
}
