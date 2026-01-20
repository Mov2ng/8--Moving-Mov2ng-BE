/*
  Warnings:

  - A unique constraint covering the columns `[email,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "User_email_key";

-- CreateIndex (only for non-deleted users)
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role") WHERE "isDelete" = false;

-- CreateIndex (only for non-deleted users)
CREATE UNIQUE INDEX "User_phone_number_role_key" ON "User"("phone_number", "role") WHERE "isDelete" = false;
