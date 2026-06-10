import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("event_members", function (table) {
    table.increments("id").primary();
    table
      .integer("event_id")
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("SET NULL") //if event is deleted, we still want to save the record of members
      .onUpdate("CASCADE");
    table
      .integer("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL") //again, we dont to delete the reference
      .onUpdate("CASCADE");
    table
      .integer("invited_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.enum("status", ["invited", "accepted", "declined"]).defaultTo("invited");

    table.timestamps(true, true);

    table.unique(["event_id", "user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("event_members");
}
