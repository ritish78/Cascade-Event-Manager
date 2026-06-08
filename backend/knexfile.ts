import type { Knex } from "knex";
import { POSTGRES_DATA_URL } from "./src/config/index.js";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: POSTGRES_DATA_URL,
    migrations: {
      directory: "./src/db/migrations",
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
      directory: "./src/db/migrations",
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 30,
    },
  },
};

export default knexConfig;
