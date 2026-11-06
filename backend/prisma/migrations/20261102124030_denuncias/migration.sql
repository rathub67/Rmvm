-- CreateTable
CREATE TABLE `Denuncia` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `answers` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `ip` VARCHAR(191) NOT NULL DEFAULT '',
    `userAgent` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Denuncia_createdAt_idx`(`createdAt`),
    INDEX `Denuncia_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
