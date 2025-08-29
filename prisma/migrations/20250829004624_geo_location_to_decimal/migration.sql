/*
  Warnings:

  - You are about to alter the column `geoLat` on the `Occurrence` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,15)`.
  - You are about to alter the column `geoLong` on the `Occurrence` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,15)`.
  - Made the column `geoLat` on table `Occurrence` required. This step will fail if there are existing NULL values in that column.
  - Made the column `geoLong` on table `Occurrence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Occurrence" ALTER COLUMN "geoLat" SET NOT NULL,
ALTER COLUMN "geoLat" SET DATA TYPE DECIMAL(18,15),
ALTER COLUMN "geoLong" SET NOT NULL,
ALTER COLUMN "geoLong" SET DATA TYPE DECIMAL(18,15);
