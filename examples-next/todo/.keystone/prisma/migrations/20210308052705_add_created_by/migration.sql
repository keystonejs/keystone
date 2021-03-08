-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "createdBy" INTEGER;

-- AddForeignKey
ALTER TABLE "Todo" ADD FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
