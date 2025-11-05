import { prisma } from '../libe/prisma'

async function seed() {
    await prisma.user.create({
    data: {
      userName: 'Admin',
      cpf: '00000000000',
      phone: '0000000000000',
      email: 'admin@prisma.io',
      password: '987456321',
      addressStreet:"teste",
      addressNumber:"1323",
      addressDistrict:"tegfv",
      addressCity:"ygsygvsy",
      addressState:"udhiughg",
      addressCEP:"78844548",
      addressComp:"yudgsbbb",
      addressIbge:"78522135",
      MasterUser: {
        create: {
          matricula: '1234567989',
          position: 'Tenente',
          createdNewUser: true,
          createdByUserId: 1,
        },
      },
    },
  })

  // await prisma.vehicle.create({
  //   data: {
  //     id:1,
  //     placa: 'Caio54165',
  //     type: 'Ambulância',
  //     model: 'Citroen - van',
  //     description: 'van',
  //     userId: 1,
  //   },
  // })

 
}

seed()
