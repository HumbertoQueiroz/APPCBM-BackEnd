import { prisma } from '../libe/prisma'

async function clear() {
  await prisma.master.deleteMany()
  
  await prisma.vehicle.deleteMany()
  
  await prisma.status.deleteMany() 
  await prisma.incidentResponse.deleteMany() 
  await prisma.occurrence.deleteMany()
  
  await prisma.user.deleteMany()



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


  console.log(allUsers)
  console.log(allMaster)
  console.log(allVehicle)
  console.log(allOccurrence)
  console.log(allStatus)
  
  
  console.dir(allUsersAndDate, { depth: null })
  
}

clear()
