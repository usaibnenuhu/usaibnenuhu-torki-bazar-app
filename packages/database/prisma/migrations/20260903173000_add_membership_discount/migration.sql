-- Add fixed discount percentage to memberships.
ALTER TABLE "Membership"
ADD COLUMN "discountPercent" DECIMAL NOT NULL DEFAULT 0;
