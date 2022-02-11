/*
  Warnings:

  - Added the required column `relationName` to the `relations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_relations" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "relationName" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_relations" ("columns", "tableId", "uid") SELECT "columns", "tableId", "uid" FROM "relations";
DROP TABLE "relations";
ALTER TABLE "new_relations" RENAME TO "relations";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
