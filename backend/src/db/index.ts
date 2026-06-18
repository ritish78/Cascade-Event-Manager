import knex from "knex";
import knexConfig from "../../knexfile";
import { NODE_ENV } from "../config";

const db = knex(knexConfig[NODE_ENV]);

export default db;
