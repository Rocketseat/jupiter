-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");

INSERT INTO "Company" ("id", "name", "domain")
VALUES ('BE7CB85C-E3A4-4B37-908C-400C1A582749', 'Rocketseat', 'rocketseat.team');