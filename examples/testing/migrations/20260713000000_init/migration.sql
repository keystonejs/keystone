CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "password" TEXT NOT NULL
);
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE TABLE "Task" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "label" TEXT NOT NULL DEFAULT '',
  "priority" TEXT,
  "isComplete" BOOLEAN NOT NULL DEFAULT false,
  "assignedTo" TEXT,
  "finishBy" DATETIME,
  CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");
