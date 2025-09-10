-- AlterTable
ALTER TABLE "public"."account" ADD COLUMN     "vietqr_account_name" TEXT,
ADD COLUMN     "vietqr_account_number" TEXT,
ADD COLUMN     "vietqr_addinfo_prefix" TEXT,
ADD COLUMN     "vietqr_bank_code" TEXT,
ADD COLUMN     "vietqr_is_enabled" BOOLEAN DEFAULT false,
ADD COLUMN     "vietqr_template" TEXT DEFAULT 'print';
