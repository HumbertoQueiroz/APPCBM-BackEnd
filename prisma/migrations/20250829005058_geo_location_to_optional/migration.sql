-- AlterTable
ALTER TABLE "public"."Occurrence" ALTER COLUMN "geoLat" DROP NOT NULL,
ALTER COLUMN "geoLong" DROP NOT NULL;
