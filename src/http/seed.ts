import { prisma } from '../libe/prisma'

async function seed() {
  await prisma.user.create({
    data: {
      id:1,
      userName: 'Carlos',
      cpf: '74635456013',
      addressFull: 'TES TES TESTE',
      telephone: '5565996452788',
      email: 'carlos@prisma.io',
      password: '123',
    },
  })

  await prisma.user.create({
    data: {
      id:2,
      userName: 'Caio',
      cpf: '02233910001',
      addressFull: 'TES TES TESTE',
      telephone: '5565996452647',
      email: 'caio@prisma.io',
      password: '123',
      MasterUser: {
        create: {
          id:1,
          matricula: '123456798',
          position: 'Tenente',
          createdNewUser: true,
          createdByUserId: 1,
        },
      },
    },
  })

  await prisma.vehicle.create({
    data: {
      id:1,
      placa: 'Caio54165',
      type: 'Ambulância',
      model: 'Citroen - van',
      description: 'van',
      userId: 1,
    },
  })

  await prisma.occurrence.create({
    data: {
      id:1,
      userId: 1,
      natOco: 'Afogamento',
      geoLat: 123456,
      geoLong: 123456,
      addressFull:
        'tfetcfwx stfdxtax agsvcjgasdv bvcahsbvchsax vcsavcjqsvc dsvcghsvadjgcvsaq',
      description: 'Esta se afogando no rio seco',
    },
  })

  await prisma.incidentResponse.create({
    data: {
      id:1,
      userId: 1,
      occurrenceId: 1,
      vehicleId: 1,
      Status: {
        create: {
          id:1,
          statusIncidentResponse: 'INICIO',
          description: 'Iniciado atendimento, ambulancia a caminho',
        },
      },
    },
  })

  const allUsers = await prisma.user.findMany()


  const allMaster = await prisma.master.findMany()
  const allVehicle = await prisma.vehicle.findMany()
  const allOccurrence = await prisma.occurrence.findMany()
  const allStatus = await prisma.status.findMany()
  const allUsersAndDate = await prisma.user.findMany({
    include:{
      Vehicle:true,
      Occurrence:true,
    }
  })


  console.log(allMaster)
  console.log(allVehicle)
  console.log(allOccurrence)
  console.log(allStatus)
  
  
  console.dir(allUsersAndDate, { depth: null })
  
}

seed()
