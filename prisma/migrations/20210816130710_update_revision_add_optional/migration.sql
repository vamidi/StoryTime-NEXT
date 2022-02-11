-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE SET NULL ON UPDATE SET NULL
);
INSERT INTO "new_revisions" ("created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at", "userId") SELECT "created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at", "userId" FROM "revisions";
DROP TABLE "revisions";
ALTER TABLE "new_revisions" RENAME TO "revisions";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
