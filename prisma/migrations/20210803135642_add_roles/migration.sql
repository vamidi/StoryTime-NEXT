-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "roles" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_users" ("uid") SELECT "uid" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
