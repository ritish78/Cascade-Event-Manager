import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  //Clean up in reverse FK order
  await knex("event_tags").del();
  await knex("event_members").del();
  await knex("events").del();

  const users = await knex("users").select("id", "full_name");
  const categories = await knex("categories").select("id", "name");
  const tags = await knex("tags").select("id", "name");

  //Helper lookups
  const userByName = (name: string) => users.find((u) => u.full_name === name)?.id;
  const categoryByName = (name: string) => categories.find((c) => c.name === name)?.id;
  const tagByName = (name: string) => tags.find((t) => t.name === name)?.id;

  const eventsToInsert = [
    {
      name: "Kathmandu Tech Meetup",
      description:
        "Monthly gathering of software developers, designers and tech enthusiasts in Kathmandu. Share ideas, demo projects and network with the local tech community.",
      location: "Thamel, Kathmandu",
      is_private: false,
      event_date: new Date("2026-07-15T14:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Technology"),
    },
    {
      name: "Nepal Open Source Hackathon",
      description:
        "A 48-hour hackathon celebrating open source software. Teams compete to build solutions addressing local problems in agriculture, health and education.",
      location: "Pulchowk Campus, Lalitpur",
      is_private: false,
      event_date: new Date("2026-08-02T09:00:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Technology"),
    },
    {
      name: "AI and Machine Learning Seminar",
      description:
        "An afternoon seminar exploring how artificial intelligence is being applied in Nepal from crop disease detection to digital banking.",
      location: "Soaltee Hotel, Kathmandu",
      is_private: false,
      event_date: new Date("2026-07-22T10:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Technology"),
    },
    {
      name: "Frontend Nepal  React Workshop",
      description:
        "A hands-on full-day workshop on building modern React applications. Covers hooks, state management and deployment. Bring your laptop.",
      location: "Broadway Infosys, Kathmandu",
      is_private: false,
      event_date: new Date("2026-09-05T09:30:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Technology"),
    },

    {
      name: "Dashain Volleyball Tournament",
      description:
        "Annual inter-colony volleyball tournament held during the Dashain festival. Teams from across Bhaktapur compete for the golden trophy.",
      location: "Bhaktapur Durbar Square, Bhaktapur",
      is_private: false,
      event_date: new Date("2026-10-10T07:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Sports"),
    },
    {
      name: "Pokhara Marathon 2026",
      description:
        "Annual marathon along the scenic Phewa Lake shore. Categories include full marathon, half marathon and a 5K fun run open to all ages.",
      location: "Lakeside, Pokhara",
      is_private: false,
      event_date: new Date("2026-11-21T05:30:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Sports"),
    },
    {
      name: "School Football Championship  Private Finals",
      description:
        "Invitation-only finals of the inter-school football championship. Only participating school staff, students and families are admitted.",
      location: "ANFA Complex, Satdobato, Lalitpur",
      is_private: true,
      event_date: new Date("2026-08-20T13:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Sports"),
    },

    {
      name: "Nepal Science Olympiad Seminar",
      description:
        "A preparatory seminar for students competing in the Nepal Science Olympiad. Covers physics, chemistry and biology problem-solving strategies.",
      location: "Tri-Chandra College, Kathmandu",
      is_private: false,
      event_date: new Date("2026-07-30T10:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Science"),
    },
    {
      name: "Himalayan Climate Research Conference",
      description:
        "International conference bringing together researchers studying climate change impacts on the Himalayan ecosystem, glaciers and water systems.",
      location: "Hotel Yak and Yeti, Kathmandu",
      is_private: false,
      event_date: new Date("2026-09-12T09:00:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Science"),
    },
    {
      name: "Private Astronomy Night  Nagarkot",
      description:
        "Exclusive stargazing session at Nagarkot with telescopes and expert guides. Limited to registered participants only.",
      location: "Nagarkot View Tower, Bhaktapur",
      is_private: true,
      event_date: new Date("2026-08-14T19:30:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Science"),
    },

    {
      name: "Indra Jatra Street Performance Show",
      description:
        "Celebration of Indra Jatra with traditional Newari performances, masked dances and cultural displays in the heart of old Kathmandu.",
      location: "Basantapur Durbar Square, Kathmandu",
      is_private: false,
      event_date: new Date("2026-09-18T17:00:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Arts"),
    },
    {
      name: "Thangka Painting Workshop",
      description:
        "A weekend workshop on traditional Tibetan Thangka painting guided by a master artist from Boudhanath. All materials provided.",
      location: "Boudhanath, Kathmandu",
      is_private: false,
      event_date: new Date("2026-07-25T10:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Arts"),
    },
    {
      name: "Nepali Film Networking Night",
      description:
        "An exclusive networking evening for Nepali filmmakers, producers, scriptwriters and actors. Invite-only to keep the conversation focused.",
      location: "QFX Cinemas, Civil Mall, Kathmandu",
      is_private: true,
      event_date: new Date("2026-08-08T18:00:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Arts"),
    },
    {
      name: "Nepali Folk Music Job Fair",
      description:
        "A unique fair connecting traditional Nepali folk musicians with event organisers, schools and cultural institutions looking to hire performers.",
      location: "Patan Durbar Square, Lalitpur",
      is_private: false,
      event_date: new Date("2026-10-03T11:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Arts"),
    },

    {
      name: "Kathmandu Startup Pitch Night",
      description:
        "Entrepreneurs pitched their early-stage startups to a panel of investors and mentors. Networking session followed.",
      location: "Doodhpati, Kathmandu",
      is_private: false,
      event_date: new Date("2025-11-10T17:00:00Z"),
      created_by: userByName("Keanu Reeves"),
      category_id: categoryByName("Technology"),
    },
    {
      name: "Teej Cultural Program",
      description:
        "A vibrant cultural program celebrating the Teej festival with traditional songs, dances and blessings.",
      location: "Pashupatinath Temple, Kathmandu",
      is_private: false,
      event_date: new Date("2025-09-06T08:00:00Z"),
      created_by: userByName("Rajesh Hamal"),
      category_id: categoryByName("Arts"),
    },
  ];

  const insertedEvents = await knex("events").insert(eventsToInsert).returning("*");

  const eventByName = (name: string) => insertedEvents.find((e) => e.name === name);

  const membersToInsert = new Array();

  //All events get their creator as organizer
  for (const event of insertedEvents) {
    membersToInsert.push({
      event_id: event.id,
      user_id: event.created_by,
      invited_by: null,
      role: "organizer",
      status: "accepted",
    });
  }

  //Add attendees to public events
  const publicAttendees = [
    //Kathmandu Tech Meetup
    {
      event: "Kathmandu Tech Meetup",
      user: "Keanu Reeves",
      status: "accepted",
    },
    {
      event: "Kathmandu Tech Meetup",
      user: "Harrison Ford",
      status: "accepted",
    },
    {
      event: "Kathmandu Tech Meetup",
      user: "Test User",
      status: "invited",
    },

    //Nepal Open Source Hackathon
    {
      event: "Nepal Open Source Hackathon",
      user: "Rajesh Hamal",
      status: "accepted",
    },
    {
      event: "Nepal Open Source Hackathon",
      user: "Harrison Ford",
      status: "invited",
    },

    //AI and Machine Learning Seminar
    {
      event: "AI and Machine Learning Seminar",
      user: "Keanu Reeves",
      status: "accepted",
    },
    {
      event: "AI and Machine Learning Seminar",
      user: "Test User",
      status: "declined",
    },

    //Pokhara Marathon
    {
      event: "Pokhara Marathon 2026",
      user: "Rajesh Hamal",
      status: "accepted",
    },
    {
      event: "Pokhara Marathon 2026",
      user: "Harrison Ford",
      status: "accepted",
    },

    //Himalayan Climate Research Conference
    {
      event: "Himalayan Climate Research Conference",
      user: "Rajesh Hamal",
      status: "accepted",
    },
    {
      event: "Himalayan Climate Research Conference",
      user: "Test User",
      status: "invited",
    },

    // Indra Jatra
    {
      event: "Indra Jatra Street Performance Show",
      user: "Rajesh Hamal",
      status: "accepted",
    },
    {
      event: "Indra Jatra Street Performance Show",
      user: "Harrison Ford",
      status: "accepted",
    },
    {
      event: "Indra Jatra Street Performance Show",
      user: "Test User",
      status: "invited",
    },

    // Thangka Painting Workshop
    {
      event: "Thangka Painting Workshop",
      user: "Keanu Reeves",
      status: "accepted",
    },
    {
      event: "Thangka Painting Workshop",
      user: "Test User",
      status: "declined",
    },

    // Nepali Folk Music Job Fair
    {
      event: "Nepali Folk Music Job Fair",
      user: "Keanu Reeves",
      status: "accepted",
    },

    // Private events  invited members
    {
      event: "School Football Championship  Private Finals",
      user: "Keanu Reeves",
      status: "invited",
    },
    {
      event: "School Football Championship  Private Finals",
      user: "Harrison Ford",
      status: "accepted",
    },
    {
      event: "Private Astronomy Night  Nagarkot",
      user: "Keanu Reeves",
      status: "accepted",
    },
    {
      event: "Private Astronomy Night  Nagarkot",
      user: "Test User",
      status: "invited",
    },
    {
      event: "Nepali Film Networking Night",
      user: "Rajesh Hamal",
      status: "accepted",
    },
    {
      event: "Nepali Film Networking Night",
      user: "Harrison Ford",
      status: "declined",
    },
  ];

  for (const attendee of publicAttendees) {
    const event = eventByName(attendee.event);
    const userId = userByName(attendee.user);

    if (!event || !userId) continue;

    // Skip if this user is already the organizer
    if (event.created_by === userId) continue;

    membersToInsert.push({
      event_id: event.id,
      user_id: userId,
      invited_by: event.created_by,
      role: "attendee",
      status: attendee.status,
    });
  }

  await knex("event_members").insert(membersToInsert);

  const eventTagsMap: Record<string, string[]> = {
    "Kathmandu Tech Meetup": ["Meetup", "Networking"],
    "Nepal Open Source Hackathon": ["Hackathon", "Networking"],
    "AI and Machine Learning Seminar": ["Seminar", "Conference"],
    "Frontend Nepal  React Workshop": ["Workshop", "Networking"],
    "Dashain Volleyball Tournament": ["Tournament"],
    "Pokhara Marathon 2026": ["Tournament", "Networking"],
    "School Football Championship  Private Finals": ["Tournament"],
    "Nepal Science Olympiad Seminar": ["Seminar"],
    "Himalayan Climate Research Conference": ["Conference", "Seminar"],
    "Private Astronomy Night  Nagarkot": ["Networking"],
    "Indra Jatra Street Performance Show": ["Show"],
    "Thangka Painting Workshop": ["Workshop"],
    "Nepali Film Networking Night": ["Networking", "Show"],
    "Nepali Folk Music Job Fair": ["Job Fair", "Fair", "Networking"],
    "Kathmandu Startup Pitch Night": ["Conference", "Networking"],
    "Teej Cultural Program": ["Show"],
  };

  const eventTagsToInsert = new Array();

  for (const [eventName, tagNames] of Object.entries(eventTagsMap)) {
    const event = eventByName(eventName);
    if (!event) continue;

    for (const tagName of tagNames) {
      const tagId = tagByName(tagName);
      if (!tagId) continue;

      eventTagsToInsert.push({
        event_id: event.id,
        tag_id: tagId,
      });
    }
  }

  await knex("event_tags").insert(eventTagsToInsert);
}
