-- Run this only if you have NOT already added monthly_budget.
ALTER TABLE users
ADD COLUMN monthly_budget DECIMAL(10,2) DEFAULT NULL;
