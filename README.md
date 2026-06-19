# Event Management Application

# How to use:

1. First, please clone the repository:

```
git clone https://github.com/ritish78/Cascade-Event-Manager.git
```

2. Then, enter the newly cloned repoistory folder.

```
cd Cascade-Event-Manager
```

3. Then we need to build the docker containers. It will build both frontend and backend.

```

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

4. We first need to create the required tables, to do so, we will run the migration script:

```
docker exec -it eventmanagementbackend pnpm migrate:latest
```

5. We also have dummy data available that you can seed using:

```
docker exec -it eventmanagement pnpm seed:run
```

6. You can visit `http://localhost:5000/api/v1/api-docs` to view the API docs.

7. For using it with user interface, you can visit `http://localhost:5173`. It uses cookies to store JWT. So, it is requested to a private window in your browser.

### Test Users created from seed:

```
rajeshhamal@email.com
keanureeves@email.com
harrisonford@email.com
testuser@email.com

Default password: password123
```

### Default Postgres connection:

```
http://localhost:8080/?pgsql=eventmanagementdatabase&username=rajeshhamal&db=eventmanagement&ns=public

PASSWORD: password123

```

### Resources used:

- https://knexjs.org/guide/schema-builder.html#withschema
- https://www.xjavascript.com/blog/knex-typescript/
- https://dev.to/mmili_01/how-to-create-a-node-api-with-knex-and-postgresql-4329
- https://blog.openreplay.com/create-a-node-api-with-knex-and-postgresql/

### Check the tables in Postgres (optional):

```
docker exec -it eventmanagementdatabase psql -U rajeshhamal -d eventmanagement -c "\dt"
```

### Decisions:

- While creating users, we have these columns; id (serial), full_name, email, password, is_verified, is_active, created_at and updated_at. `is_active` is set as `true` by default. When the admin bans the user, we set is_active to be `false`.
- Monorepo with separate `backend` and `frontend` folders. Backend is a TypeScript Node.js REST API following a controller to service to repository layering to keep business logic and data access separated.
- PostgreSQL accessed via Knex migrations and seeds. Knex is configured with the `pg` client.
- JWT access and refresh tokens are used for authentication and are implemented in the backend utilities and auth controller.
- Input validation uses `zod` schemas located under the backend `src/schema` folder.
- Backend development uses `tsx` for running TypeScript directly and `vitest` for unit tests. Frontend uses Vite with React and TypeScript.
- Comments in source files also contains additional implementation and design choices.
- Logs are created using `winston`. It is in `backend/logs` folder.

## Assumptions

- For local development, I used `pnpm` however, `npm` or other works as well. Docker containers use `pnpm`.
- A PostgreSQL instance is created using Docker and we are not assuming the same will be done.
- Required environment variables (also in `.env.example`) are provided in this git clone. For this, to make the things easier, I am also providing `.env.development` that I haven't commited before. `.env` should be private and the `.env.development` should only be used for the first time to test without having to fill environment variable just to test. The backend will throw an error if required variables are missing.
- Ports and conflicts: Ports defined in environment variables must be available on your machine. For Express server it is `5000`, Frontend `5173`, Postgres `5432`, and Adminer `8080`.
- For now, we are storing `is_verified` to be `true` as default in users table. We will update the project to send link with token in `email`.

# Tech Stack used

- Backend: `Node.js` as Runtime, `express` for server, `zod` for validating user input.
- Frontend: `React` Library which runs using `Typescript`.
- Database: `PostgreSQL` is running using docker container.
- Security: `Argon2` for hashing password, `accessToken` and `refreshToken` JWT is stored in `cookies`.
- Test: `vitest` is used for testing. `Supertest` provides easy interaction with `express` to test the API.
