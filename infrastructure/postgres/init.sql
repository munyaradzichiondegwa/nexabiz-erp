-- NexaBiz — PostgreSQL database initialisation
-- Run once by Docker on first container start

CREATE DATABASE nexabiz_auth;
CREATE DATABASE nexabiz_accounting;
CREATE DATABASE nexabiz_sales;
CREATE DATABASE nexabiz_inventory;
CREATE DATABASE nexabiz_hr;
CREATE DATABASE nexabiz_crm;
CREATE DATABASE nexabiz_banking;
CREATE DATABASE nexabiz_procurement;
CREATE DATABASE nexabiz_projects;
CREATE DATABASE nexabiz_workflow;
CREATE DATABASE nexabiz_config;

-- Create extensions in each DB
\connect nexabiz_auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\connect nexabiz_accounting
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\connect nexabiz_sales
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_inventory
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

\connect nexabiz_hr
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_crm
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_banking
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_procurement
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_projects
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_workflow
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect nexabiz_config
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
