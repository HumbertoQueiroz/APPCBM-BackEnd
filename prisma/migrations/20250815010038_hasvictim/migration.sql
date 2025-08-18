/*
  Warnings:

  - Added the required column `hasVictim` to the `IncidentResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IncidentResponse" ADD COLUMN     "conditionVictim" TEXT,
ADD COLUMN     "hasVictim" BOOLEAN NOT NULL,
ADD COLUMN     "victimsQuantity" INTEGER;
