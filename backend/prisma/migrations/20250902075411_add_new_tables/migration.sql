-- CreateTable
CREATE TABLE "public"."Timeslots" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "timeId" INTEGER NOT NULL,

    CONSTRAINT "Timeslots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Time" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Timeslots" ADD CONSTRAINT "Timeslots_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timeslots" ADD CONSTRAINT "Timeslots_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "public"."Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
