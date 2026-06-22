import type { Knex } from "knex";
import { POSTGRES_DATA_URL, NODE_ENV } from "./src/config";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: POSTGRES_DATA_URL,
    migrations: {
      directory: NODE_ENV === "development" ? "./src/db/migrations" : "./dist/src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: NODE_ENV === "development" ? "./src/db/seeds" : "./dist/src/db/migrations",
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
