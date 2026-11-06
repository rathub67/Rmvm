DELETE FROM `Session`;

ALTER TABLE `Session` DROP INDEX `Session_tokenHash_key`;
ALTER TABLE `Session` CHANGE `tokenHash` `token` VARCHAR(191) NOT NULL;
ALTER TABLE `Session` ADD UNIQUE INDEX `Session_token_key`(`token`);
ALTER TABLE `Session` DROP COLUMN `ip`;
ALTER TABLE `Session` DROP COLUMN `userAgent`;

DROP TABLE `LoginHistory`;
