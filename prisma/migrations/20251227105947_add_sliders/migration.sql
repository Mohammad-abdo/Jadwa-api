-- CreateTable
CREATE TABLE `sliders` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NULL,
    `subtitle` TEXT NULL,
    `subtitleAr` TEXT NULL,
    `description` TEXT NULL,
    `descriptionAr` TEXT NULL,
    `image` VARCHAR(191) NOT NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonTextAr` VARCHAR(191) NULL,
    `buttonLink` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sliders_isActive_idx`(`isActive`),
    INDEX `sliders_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
