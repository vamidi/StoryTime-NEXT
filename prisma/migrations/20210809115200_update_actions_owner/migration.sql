-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "ownerId" TEXT,
    FOREIGN KEY ("memberId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("ownerId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE SET NULL
);
INSERT INTO "new_projects" ("memberId", "ownerId", "uid") SELECT "memberId", "ownerId", "uid" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
