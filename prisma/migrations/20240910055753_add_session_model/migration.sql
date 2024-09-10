/*
  Warnings:

  - You are about to drop the column `userId` on the `images` table. All the data in the column will be lost.
  - Added the required column `AI` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `halal` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `healthy` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `manager` VARCHAR(191) NULL,
    ADD COLUMN `staff` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `lastLogin` DATETIME(3) NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'Staff';

-- AlterTable
ALTER TABLE `images` DROP COLUMN `userId`,
    ADD COLUMN `AI` VARCHAR(191) NOT NULL,
    ADD COLUMN `companyId` VARCHAR(191) NOT NULL,
    ADD COLUMN `halal` BOOLEAN NOT NULL,
    ADD COLUMN `healthy` BOOLEAN NOT NULL,
    MODIFY `retrived` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
