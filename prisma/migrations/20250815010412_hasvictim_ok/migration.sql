/*
  Warnings:

  - You are about to drop the column `conditionVictim` on the `IncidentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `hasVictim` on the `IncidentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `victimsQuantity` on the `IncidentResponse` table. All the data in the column will be lost.
  - Added the required column `hasVictim` to the `Occurrence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IncidentResponse" DROP COLUMN "conditionVictim",
DROP COLUMN "hasVictim",
DROP COLUMN "victimsQuantity";

-- AlterTable
ALTER TABLE "public"."Occurrence" ADD COLUMN     "conditionVictim" TEXT,
ADD COLUMN     "hasVictim" BOOLEAN NOT NULL,
ADD COLUMN     "victimsQuantity" INTEGER;
