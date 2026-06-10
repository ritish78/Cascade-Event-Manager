import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("events", function (table) {
    table.timestamp("event_date").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("events", function (table) {
    table.dropColumn("event_date");
  });
}
