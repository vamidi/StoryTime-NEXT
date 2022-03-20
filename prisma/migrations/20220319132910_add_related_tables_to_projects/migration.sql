/*
  Warnings:

  - Added the required column `relatedTables` to the `project_metadata` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_metadata" (
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
    "relatedTables" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    CONSTRAINT "project_metadata_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_project_metadata" ("alias", "created_at", "deleted", "description", "languages", "private", "projectId", "title", "uid", "updated_at", "version") SELECT "alias", "created_at", "deleted", "description", "languages", "private", "projectId", "title", "uid", "updated_at", "version" FROM "project_metadata";
DROP TABLE "project_metadata";
ALTER TABLE "new_project_metadata" RENAME TO "project_metadata";
CREATE UNIQUE INDEX "project_metadata_projectId_key" ON "project_metadata"("projectId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
