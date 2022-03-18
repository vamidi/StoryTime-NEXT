/*
  Warnings:

  - You are about to drop the `ProjectMetaData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TableData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMetaData` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `projects` table. All the data in the column will be lost.
  - The primary key for the `relations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `relations` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - The primary key for the `TableMetaData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TableMetaData` table. All the data in the column will be lost.
  - The primary key for the `tables` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tables` table. All the data in the column will be lost.
  - The primary key for the `revisions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `revisions` table. All the data in the column will be lost.
  - The required column `uid` was added to the `projects` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `relations` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `tables` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `revisions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProjectMetaData_projectId_key";

-- DropIndex
DROP INDEX "Token_hash_key";

-- DropIndex
DROP INDEX "UserMetaData_userId_key";

-- DropIndex
DROP INDEX "UserMetaData_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProjectMetaData";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TableData";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Token";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserMetaData";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "user_metadata" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "displayName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoURL" TEXT,
    CONSTRAINT "user_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tokens" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "hash" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_metadata" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "languages" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    CONSTRAINT "project_metadata_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "table" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "data" TEXT NOT NULL,
    CONSTRAINT "table_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "projects" ("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "users" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__members" ("A", "B") SELECT "A", "B" FROM "_members";
DROP TABLE "_members";
ALTER TABLE "new__members" RENAME TO "_members";
CREATE UNIQUE INDEX "_members_AB_unique" ON "_members"("A", "B");
CREATE INDEX "_members_B_index" ON "_members"("B");
CREATE TABLE "new_projects" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE SET NULL
);
INSERT INTO "new_projects" ("memberId", "ownerId") SELECT "memberId", "ownerId" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE TABLE "new_relations" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    CONSTRAINT "relations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_relations" ("columns", "tableId") SELECT "columns", "tableId" FROM "relations";
DROP TABLE "relations";
ALTER TABLE "new_relations" RENAME TO "relations";
CREATE TABLE "new_users" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "roles" TEXT DEFAULT '{}'
);
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE TABLE "new_TableMetaData" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lastUID" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "owner" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    CONSTRAINT "TableMetaData_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableMetaData" ("created_at", "deleted", "description", "lastUID", "owner", "private", "tableId", "title", "updated_at", "version") SELECT "created_at", "deleted", "description", "lastUID", "owner", "private", "tableId", "title", "updated_at", "version" FROM "TableMetaData";
DROP TABLE "TableMetaData";
ALTER TABLE "new_TableMetaData" RENAME TO "TableMetaData";
CREATE UNIQUE INDEX "TableMetaData_tableId_key" ON "TableMetaData"("tableId");
CREATE TABLE "new_tables" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "tables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tables" ("projectId") SELECT "projectId" FROM "tables";
DROP TABLE "tables";
ALTER TABLE "new_tables" RENAME TO "tables";
CREATE TABLE "new_revisions" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "currentRevID" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "rowID" INTEGER NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    CONSTRAINT "revisions_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE SET DEFAULT ON UPDATE SET DEFAULT
);
INSERT INTO "new_revisions" ("created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at") SELECT "created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at" FROM "revisions";
DROP TABLE "revisions";
ALTER TABLE "new_revisions" RENAME TO "revisions";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_email_key" ON "user_metadata"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_userId_key" ON "user_metadata"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_hash_key" ON "tokens"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "project_metadata_projectId_key" ON "project_metadata"("projectId");
