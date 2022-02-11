-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tables" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tables" ("projectId", "uid") SELECT "projectId", "uid" FROM "tables";
DROP TABLE "tables";
ALTER TABLE "new_tables" RENAME TO "tables";
CREATE TABLE "new_users" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "roles" TEXT DEFAULT '{}'
);
INSERT INTO "new_users" ("roles", "uid") SELECT "roles", "uid" FROM "users";
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
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableMetaData" ("created_at", "deleted", "description", "lastUID", "owner", "private", "tableId", "title", "uid", "updated_at", "version") SELECT "created_at", "deleted", "description", "lastUID", "owner", "private", "tableId", "title", "uid", "updated_at", "version" FROM "TableMetaData";
DROP TABLE "TableMetaData";
ALTER TABLE "new_TableMetaData" RENAME TO "TableMetaData";
CREATE UNIQUE INDEX "TableMetaData_tableId_unique" ON "TableMetaData"("tableId");
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
    "version" TEXT NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_project_metadata" ("alias", "created_at", "deleted", "description", "languages", "private", "projectId", "title", "uid", "updated_at", "version") SELECT "alias", "created_at", "deleted", "description", "languages", "private", "projectId", "title", "uid", "updated_at", "version" FROM "project_metadata";
DROP TABLE "project_metadata";
ALTER TABLE "new_project_metadata" RENAME TO "project_metadata";
CREATE UNIQUE INDEX "project_metadata_projectId_unique" ON "project_metadata"("projectId");
CREATE TABLE "new_projects" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "ownerId" TEXT NOT NULL,
    FOREIGN KEY ("memberId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("ownerId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE SET NULL
);
INSERT INTO "new_projects" ("memberId", "ownerId", "uid") SELECT "memberId", "ownerId", "uid" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE TABLE "new_tokens" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "hash" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tokens" ("created_at", "expiration", "hash", "type", "uid", "updated_at", "userId", "valid") SELECT "created_at", "expiration", "hash", "type", "uid", "updated_at", "userId", "valid" FROM "tokens";
DROP TABLE "tokens";
ALTER TABLE "new_tokens" RENAME TO "tokens";
CREATE UNIQUE INDEX "tokens.hash_unique" ON "tokens"("hash");
CREATE TABLE "new_table" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "data" TEXT NOT NULL,
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_table" ("data", "deleted", "tableId", "uid") SELECT "data", "deleted", "tableId", "uid" FROM "table";
DROP TABLE "table";
ALTER TABLE "new_table" RENAME TO "table";
CREATE TABLE "new_user_metadata" (
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
    FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_metadata" ("created_at", "displayName", "email", "firstName", "lastName", "password", "photoURL", "uid", "updated_at", "userId") SELECT "created_at", "displayName", "email", "firstName", "lastName", "password", "photoURL", "uid", "updated_at", "userId" FROM "user_metadata";
DROP TABLE "user_metadata";
ALTER TABLE "new_user_metadata" RENAME TO "user_metadata";
CREATE UNIQUE INDEX "user_metadata.email_unique" ON "user_metadata"("email");
CREATE UNIQUE INDEX "user_metadata_userId_unique" ON "user_metadata"("userId");
CREATE TABLE "new_relations" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_relations" ("columns", "tableId", "uid") SELECT "columns", "tableId", "uid" FROM "relations";
DROP TABLE "relations";
ALTER TABLE "new_relations" RENAME TO "relations";
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
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_revisions" ("created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at", "userId") SELECT "created_at", "currentRevID", "deleted", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at", "userId" FROM "revisions";
DROP TABLE "revisions";
ALTER TABLE "new_revisions" RENAME TO "revisions";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
