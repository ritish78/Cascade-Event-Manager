import type { Knex } from "knex";
import hashPassword from "src/utils/hashPassword";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("refresh_tokens").del();
  await knex("event_members").del();
  await knex("events").del();
  await knex("users").del();

  const commonPassword = await hashPassword("password123");

  // Inserts seed entries
  await knex("users").insert([
    {
      full_name: "Rajesh Hamal",
      email: "rajeshhamal@email.com",
      password: commonPassword,
      is_verified: true,
      is_active: true,
    },
  ]);
}
