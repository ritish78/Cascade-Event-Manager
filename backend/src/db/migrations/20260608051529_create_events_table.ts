import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("events", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable(); //Default limit is 255 char
    table.text("description").notNullable();
    table.text("location").notNullable(); //Currently, we are using location directly without creating a new table address and storing all fields and referencing its id
    table.boolean("is_private").notNullable().defaultTo(false); //By
    //https://knexjs.org/guide/schema-builder.html#references
    //https://knexjs.org/guide/schema-builder.html#intable
    table
      .integer("created_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL") //when a user is deleted, we don't want to delete events created by them
      .onUpdate("CASCADE");
    table
      .integer("category_id")
      .nullable()
      .references("id")
      .inTable("categories")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("events");
}
