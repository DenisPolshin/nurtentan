---
name: "Prisma Architect"
description: "Guides database schema design and Prisma Client queries. Invoke when modifying schema.prisma, creating migrations, or writing database queries."
---

# Prisma & Database Architect

When working with the database in this project, adhere to the following rules:

## 1. Schema Modifications (`schema.prisma`)
- Always ensure relationships (one-to-many, many-to-many) are correctly defined with proper `onDelete` behaviors (e.g., `Cascade`, `SetNull`).
- Document new fields with comments explaining their purpose.

## 2. Prisma Client Usage
- **Optimize queries**: Always use `select` or `include` to fetch only the data actually needed by the client. Avoid fetching entire objects if only an ID or name is required.
- For complex operations involving multiple tables (especially in the inventory module), wrap them in `$transaction` to ensure data integrity and prevent race conditions.

## 3. Local Environment Nuances
- Remember that `dev.db` (SQLite) is local and excluded from git.
- When generating the Prisma client on Windows, use the direct node execution method configured in the project to bypass PowerShell restrictions: `node "app/node_modules/prisma/build/index.js" generate`.
