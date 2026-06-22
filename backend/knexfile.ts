import type { Knex } from "knex";
import { POSTGRES_DATA_URL, NODE_ENV } from "./src/config";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: POSTGRES_DATA_URL,
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: "pg",
    connection: POSTGRES_DATA_URL,
    migrations: {
      directory: "./dist/src/db/migrations", //i am an idiot. changed the development source in previous commit
      extension: "ts",
    },
    seeds: {
      directory: "./dist/src/db/seeds",
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 30,
    },
  },
};

export default knexConfig;
