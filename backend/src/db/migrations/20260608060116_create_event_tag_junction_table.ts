import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("event_tags", function (table) {
    /**
     * This table is a junction table and will only have two columns:
     * event_id and tag_id
     * A user can assign multiple tags to an event
     */
    table
      .integer("event_id")
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("tag_id")
      .notNullable()
      .references("id")
      .inTable("tags")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.timestamps(true, true);

    table.primary(["event_id", "tag_id"]); //we don't want to multiple rows of same event_id and tag_id combo
  });
}

export async function down(knex: Knex): Promise<void> {}
