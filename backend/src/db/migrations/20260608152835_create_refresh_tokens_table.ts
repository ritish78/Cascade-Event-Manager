import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("refresh_tokens", function (table) {
    table.increments("id").primary();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("token_hash").notNullable();
    table.boolean("revoked").notNullable().defaultTo(false);
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);

    //index as well on same migration
    //i had to create another migration for creating an email index
    table.index("user_id", "index_user_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("refresh_tokens");
}
