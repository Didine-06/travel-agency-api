-- CreateTable
CREATE TABLE "languages" (
    "iso_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("iso_code")
);

-- Insert default languages (cannot be deleted)
INSERT INTO "languages" ("iso_code", "name", "is_active", "created_at", "updated_at") 
VALUES 
    ('fr', 'Français', true, NOW(), NOW()),
    ('en', 'English', true, NOW(), NOW());

-- AlterTable
ALTER TABLE "users" ADD COLUMN "language_id" TEXT NOT NULL DEFAULT 'fr';

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("iso_code") ON DELETE RESTRICT ON UPDATE CASCADE;
