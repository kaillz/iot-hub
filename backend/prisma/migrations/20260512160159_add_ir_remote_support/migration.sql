-- CreateTable
CREATE TABLE "ir_remotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "lastUsed" DATETIME,
    "deviceId" TEXT NOT NULL,
    CONSTRAINT "ir_remotes_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ir_commands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remoteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "protocol" TEXT,
    "bits" INTEGER,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ir_commands_remoteId_fkey" FOREIGN KEY ("remoteId") REFERENCES "ir_remotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ir_remotes_deviceId_key" ON "ir_remotes"("deviceId");
