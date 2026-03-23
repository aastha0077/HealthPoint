/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `refundId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStatus",
DROP COLUMN "refundId",
DROP COLUMN "transactionId";

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "method" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointmentId" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "public"."Payment"("appointmentId");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
