-- AlterTable
ALTER TABLE `clients` ADD COLUMN `commercialName` VARCHAR(191) NULL,
    ADD COLUMN `commercialRegisterFile` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `consultants` ADD COLUMN `academicTitle` VARCHAR(191) NULL,
    ADD COLUMN `graduationYear` INTEGER NULL,
    ADD COLUMN `professionalCourses` TEXT NULL,
    ADD COLUMN `specificSpecialization` VARCHAR(191) NULL,
    ADD COLUMN `university` VARCHAR(191) NULL;
