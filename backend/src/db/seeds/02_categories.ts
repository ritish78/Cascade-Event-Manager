import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("categories").del();

  // Inserts seed entries
  await knex("categories").insert([
    { name: "Technology", description: "Hackathons, tech showcase, and conference" },
    { name: "Sports", description: "Sports Tournaments, team showcase and more" },
    { name: "Science", description: "Science Fairs, Conference, Seminars and meetups" },
    { name: "Arts", description: "Art shows, workshop and meetups" },
  ]);
}
