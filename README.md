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

### Resources used:

- https://knexjs.org/guide/schema-builder.html#withschema
- https://www.xjavascript.com/blog/knex-typescript/
- https://dev.to/mmili_01/how-to-create-a-node-api-with-knex-and-postgresql-4329
- https://blog.openreplay.com/create-a-node-api-with-knex-and-postgresql/

### Our current database structure:

<img width="1558" height="868" alt="Event Planning" src="https://github.com/user-attachments/assets/ca6ed956-b787-4403-a8da-3c3fc33bc9c2" />

### Usage:

1. Home Page:
   <img width="1477" height="1010" alt="1 Home Page" src="https://github.com/user-attachments/assets/6ffcc75f-d4e9-4c3c-82ab-923cff3039c8" />

2. Register Page:
   <img width="1467" height="977" alt="2 Register Page" src="https://github.com/user-attachments/assets/2c5c2f60-77a2-451c-bf62-41bce6c00bbf" />

3. Login Page, need to login with email and password even after registering:
   <img width="1457" height="947" alt="3 Login Page" src="https://github.com/user-attachments/assets/03410e37-a38b-4c2b-bb02-94c5a3d6d38c" />

4. Logged in user's full name is shown in navbar.
   <img width="1437" height="160" alt="4 After logging in" src="https://github.com/user-attachments/assets/10f452bf-9d58-44c5-8897-b347ab30abb1" />

5. Event Details:
   <img width="1496" height="1025" alt="5 Event Details Page" src="https://github.com/user-attachments/assets/e407b0fb-5ea5-4b55-bafc-2c7b7c4fa08b" />

6. Inviting other user
   <img width="1487" height="991" alt="6 Inviting other user" src="https://github.com/user-attachments/assets/733b348b-271a-4464-bdd3-e5070da857e6" />

7. Invited users shows up in members section
   <img width="1505" height="962" alt="7 Invited Users showing up in members" src="https://github.com/user-attachments/assets/55efa884-4dc2-4d92-a836-01551a6071a7" />

8. On Edit Event Page
   <img width="1417" height="1017" alt="8 On Edit Event Page" src="https://github.com/user-attachments/assets/a41f4acd-727e-434b-98b7-d83e3dcbcaf5" />

9. Clicking on `My Events` on navbar
   <img width="1442" height="1017" alt="9 Clicking My Events on Navbar" src="https://github.com/user-attachments/assets/d4ed7906-c1e7-45e3-b9db-8b04e396d3b8" />

10. Applying filters
    <img width="1372" height="1001" alt="10 Applying filters" src="https://github.com/user-attachments/assets/2610407a-51fc-42c3-bc82-04f8f73c67a7" />

11. Events the current user is part of
    <img width="1500" height="1012" alt="11 Events the current user is part of" src="https://github.com/user-attachments/assets/87a8986d-0bd6-4bda-a002-ade3be42e816" />

12. Logging in as `Jane Doe` shows the event where `Rajesh Hamal` invited.
    <img width="1502" height="1017" alt="12 Logging in as Jane Doe, shows the event which Rajesh Hamal invited" src="https://github.com/user-attachments/assets/e8465094-b51f-4f4b-b7f6-1b877f5878c5" />

13. `Jane Doe` can accept or decline the event invitation. Leaving it means maybe.
    <img width="1522" height="1017" alt="13 Jane Doe can accept or decline the invitation" src="https://github.com/user-attachments/assets/c3d69a69-7545-4fd6-b0a6-c5f418965532" />

14. `Jane Doe` declined to join the invitation. She can still join the invitation. This is an expected behavior.
    <img width="1402" height="1020" alt="14 Jane Doe declined the invitation  She can still join the event" src="https://github.com/user-attachments/assets/212a4146-3112-4c94-9627-58bdd1d2565e" />

15. After declining the invitation, `Jane Doe` joined the invitation.
    <img width="1482" height="1022" alt="15 After first declining the invitation, Jane Doe joined the event" src="https://github.com/user-attachments/assets/1b536455-5ef4-421f-ab8a-41e0174de325" />
