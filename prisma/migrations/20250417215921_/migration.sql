/*
  Warnings:

  - You are about to drop the column `addressBai` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressCit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressEst` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressFull` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressLog` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressNum` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telephone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressCity` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressDistrict` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressIbge` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressState` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressStreet` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `addressCEP` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `addressComp` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "User_telephone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "addressBai",
DROP COLUMN "addressCit",
DROP COLUMN "addressEst",
DROP COLUMN "addressFull",
DROP COLUMN "addressLog",
DROP COLUMN "addressNum",
DROP COLUMN "telephone",
ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressDistrict" TEXT NOT NULL,
ADD COLUMN     "addressIbge" TEXT NOT NULL,
ADD COLUMN     "addressNumber" TEXT NOT NULL,
ADD COLUMN     "addressState" TEXT NOT NULL,
ADD COLUMN     "addressStreet" TEXT NOT NULL,
ADD COLUMN     "phone" VARCHAR(15) NOT NULL,
ALTER COLUMN "addressCEP" SET NOT NULL,
ALTER COLUMN "addressComp" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
