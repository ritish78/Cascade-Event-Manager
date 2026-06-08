import type { Knex } from "knex";

/**
 * Resources used:
 * https://knexjs.org/guide/schema-builder.html#withschema
 * https://www.xjavascript.com/blog/knex-typescript/
 * https://dev.to/mmili_01/how-to-create-a-node-api-with-knex-and-postgresql-4329
 * https://blog.openreplay.com/create-a-node-api-with-knex-and-postgresql/
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("full_name", 55).notNullable();
    table.string("email", 75).notNullable().unique();
    table.string("password").notNullable();
    table.boolean("is_verified").defaultTo(false).notNullable();
    table.boolean("is_active").defaultTo(true).notNullable(); //true by default. If admins ban the user, we set it as false
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users"); //For rollback migrate:rollback
}
