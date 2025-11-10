/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `IncidentResponse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "IncidentResponse" DROP CONSTRAINT "IncidentResponse_vehicleId_fkey";

-- AlterTable
ALTER TABLE "IncidentResponse" DROP COLUMN "vehicleId";

-- CreateTable
CREATE TABLE "IncidentResponseVehicle" (
    "id" SERIAL NOT NULL,
    "incidentResponseId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,

    CONSTRAINT "IncidentResponseVehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncidentResponseVehicle" ADD CONSTRAINT "IncidentResponseVehicle_incidentResponseId_fkey" FOREIGN KEY ("incidentResponseId") REFERENCES "IncidentResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentResponseVehicle" ADD CONSTRAINT "IncidentResponseVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
