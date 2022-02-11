-- CreateTable
CREATE TABLE "users" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "user_metadata" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoURL" TEXT,
    FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
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
    FOREIGN KEY ("userId") REFERENCES "users" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "ownerId" TEXT NOT NULL,
    FOREIGN KEY ("memberId") REFERENCES "users" ("uid") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("ownerId") REFERENCES "users" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
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
    FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tables" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES "projects" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "table" (
    "uid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "data" TEXT NOT NULL,
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TableMetaData" (
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
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "revisions" (
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
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relations" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    FOREIGN KEY ("tableId") REFERENCES "tables" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "projects" ("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "users" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata.email_unique" ON "user_metadata"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_metadata_userId_unique" ON "user_metadata"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens.hash_unique" ON "tokens"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "project_metadata_projectId_unique" ON "project_metadata"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TableMetaData_tableId_unique" ON "TableMetaData"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "_members_AB_unique" ON "_members"("A", "B");

-- CreateIndex
CREATE INDEX "_members_B_index" ON "_members"("B");
