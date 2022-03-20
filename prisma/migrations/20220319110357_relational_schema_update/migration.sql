/*
  Warnings:

  - You are about to drop the `_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `memberId` on the `projects` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_members_B_index";

-- DropIndex
DROP INDEX "_members_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_members";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProjectsOnUsers" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "userId"),
    CONSTRAINT "ProjectsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectsOnUsers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE SET NULL
);
INSERT INTO "new_projects" ("ownerId", "uid") SELECT "ownerId", "uid" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
