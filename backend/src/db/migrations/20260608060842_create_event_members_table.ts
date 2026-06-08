import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("event_members", function (table) {
    table.increments("id").primary();
    table
      .integer("event_id")
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    //This column is for user id who are invited
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    //If the user who invited deletes their profile or gets deleted, we don't want
    //the event member who was invited to be uninvited by deleting the row.
    table
      .integer("invited_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.enum("role", ["organizer", "attendee"]).notNullable().defaultTo("attendee");
    table.enum("status", ["invited", "accepted", "declined"]).notNullable().defaultTo("invited");

    //We have two options:
    //1. In this table, we could make the event_id and user_id row unique. So, when a
    //user gets invited, a row is created. And when the user accepts/declines the
    //invitation, we are going to update the status to accepted/declined.
    //2. We add new row everytime. If a user is invited, then we add a new row.
    //When the user accepts/decline, we create another new row with status column
    //changed to reflect the user's decision. It will also give history.
    //For now, we are going with first option.
    table.unique(["event_id", "user_id"]);

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {}
