/*
  Warnings:

  - Changed the type of `wardNo` on the `Patient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Patient" DROP COLUMN "wardNo",
ADD COLUMN     "wardNo" INTEGER NOT NULL;
