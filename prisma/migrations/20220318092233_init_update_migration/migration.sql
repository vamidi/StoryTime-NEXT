-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectMetaData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    CONSTRAINT "ProjectMetaData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjectMetaData" ("alias", "created_at", "deleted", "description", "id", "languages", "private", "projectId", "title", "updated_at", "version") SELECT "alias", "created_at", "deleted", "description", "id", "languages", "private", "projectId", "title", "updated_at", "version" FROM "ProjectMetaData";
DROP TABLE "ProjectMetaData";
ALTER TABLE "new_ProjectMetaData" RENAME TO "ProjectMetaData";
CREATE UNIQUE INDEX "ProjectMetaData_projectId_key" ON "ProjectMetaData"("projectId");
CREATE TABLE "new_TableMetaData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    CONSTRAINT "TableMetaData_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableMetaData" ("created_at", "deleted", "description", "id", "lastUID", "owner", "private", "tableId", "title", "updated_at", "version") SELECT "created_at", "deleted", "description", "id", "lastUID", "owner", "private", "tableId", "title", "updated_at", "version" FROM "TableMetaData";
DROP TABLE "TableMetaData";
ALTER TABLE "new_TableMetaData" RENAME TO "TableMetaData";
CREATE UNIQUE INDEX "TableMetaData_tableId_key" ON "TableMetaData"("tableId");
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_projects" ("id", "memberId", "ownerId") SELECT "id", "memberId", "ownerId" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE TABLE "new_relations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    CONSTRAINT "relations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_relations" ("columns", "id", "tableId") SELECT "columns", "id", "tableId" FROM "relations";
DROP TABLE "relations";
ALTER TABLE "new_relations" RENAME TO "relations";
CREATE TABLE "new_Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "hash" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("created_at", "expiration", "hash", "id", "type", "updated_at", "userId", "valid") SELECT "created_at", "expiration", "hash", "id", "type", "updated_at", "userId", "valid" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_hash_key" ON "Token"("hash");
CREATE TABLE "new_tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "tables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tables" ("id", "projectId") SELECT "id", "projectId" FROM "tables";
DROP TABLE "tables";
ALTER TABLE "new_tables" RENAME TO "tables";
CREATE TABLE "new_UserMetaData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoURL" TEXT,
    CONSTRAINT "UserMetaData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserMetaData" ("created_at", "displayName", "email", "firstName", "id", "lastName", "password", "photoURL", "updated_at", "userId") SELECT "created_at", "displayName", "email", "firstName", "id", "lastName", "password", "photoURL", "updated_at", "userId" FROM "UserMetaData";
DROP TABLE "UserMetaData";
ALTER TABLE "new_UserMetaData" RENAME TO "UserMetaData";
CREATE UNIQUE INDEX "UserMetaData_email_key" ON "UserMetaData"("email");
CREATE UNIQUE INDEX "UserMetaData_userId_key" ON "UserMetaData"("userId");
CREATE TABLE "new_revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "currentRevID" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "rowID" INTEGER NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    CONSTRAINT "revisions_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_revisions" ("created_at", "currentRevID", "deleted", "id", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at") SELECT "created_at", "currentRevID", "deleted", "id", "newValue", "oldValue", "revision", "rowID", "tableId", "uid", "updated_at" FROM "revisions";
DROP TABLE "revisions";
ALTER TABLE "new_revisions" RENAME TO "revisions";
CREATE TABLE "new_TableData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "data" TEXT NOT NULL,
    CONSTRAINT "TableData_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableData" ("data", "deleted", "id", "tableId") SELECT "data", "deleted", "id", "tableId" FROM "TableData";
DROP TABLE "TableData";
ALTER TABLE "new_TableData" RENAME TO "TableData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
