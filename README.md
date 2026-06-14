# Event Management Application

# How to use:

1.

```
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

2.

```
docker exec -it eventmanagementbackend pnpm migrate:latest
```

### Resources used:

- https://knexjs.org/guide/schema-builder.html#withschema
- https://www.xjavascript.com/blog/knex-typescript/
- https://dev.to/mmili_01/how-to-create-a-node-api-with-knex-and-postgresql-4329
- https://blog.openreplay.com/create-a-node-api-with-knex-and-postgresql/

### Decisions:

1. While creating users, we have these columns; id (serial), full_name, email, password, is_verified, is_active, created_at and updated_at. `is_active` is set as `true` by default. When the admin bans the user, we set is_active to be `false`.

### Check the tables in Postgres:

```
docker exec -it eventmanagementdatabase psql -U rajeshhamal -d eventmanagement -c "\dt"
```
