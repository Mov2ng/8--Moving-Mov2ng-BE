/*
  Warnings:

  - The values [KAKAO,GOOGLE,NAVER] on the enum `provider` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "provider_new" AS ENUM ('LOCAL');
ALTER TABLE "public"."User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "provider_new" USING ("provider"::text::"provider_new");
ALTER TYPE "provider" RENAME TO "provider_old";
ALTER TYPE "provider_new" RENAME TO "provider";
DROP TYPE "public"."provider_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'LOCAL';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "phone_number" SET NOT NULL;
