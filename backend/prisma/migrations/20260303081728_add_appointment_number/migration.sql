/*
  Warnings:

  - A unique constraint covering the columns `[appointmentNumber]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time]` on the table `Time` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentNumber` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "appointmentNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentNumber_key" ON "public"."Appointment"("appointmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Time_time_key" ON "public"."Time"("time");
