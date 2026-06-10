import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("tags").del();

  // Inserts seed entries
  await knex("tags").insert([
    { name: "Birthday" },
    { name: "Conference" },
    { name: "Workshop" },
    { name: "Job Fair" },
    { name: "Fair" },
    { name: "Hackathon" },
    { name: "Seminar" },
    { name: "Webinar" },
    { name: "Networking" },
    { name: "Tournament" },
    { name: "Meetup" },
    { name: "Show" },
  ]);
}
