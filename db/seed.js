import db from "#db/client";
import { base, de, de_CH, en, Faker } from "@faker-js/faker";
import { createUser } from "#db/query/users";
import { createPost } from "#db/query/posts";
import { createPostLocation } from "#db/query/post_locations";
import { createCategory } from "./query/categories";

const customLocale = {
  title: "My custom locale",
  internet: {
    domainSuffix: ["test"],
  },
};

export const customFaker = new Faker({
  locale: [customLocale, de_CH, de, en, base],
});

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const categories = [
    {
      name: "Date Night",
      description: "A category filled with romantic date nights",
    },
    {
      name: "Escape Reality",
      description:
        "A category filled with only activities you'd see in a movie.",
    },
  ];

  const accounts = [
    {
      username: "Admin",
      email: "admin123@gmail.com",
      password: "password123",
      geolocation_latitude: 29.88195,
      geolocation_longitude: -90.02341,
    },
  ];

  for (const index in accounts) {
    const account = accounts[index];

    await createUser(account);
  }

  for (const index in categories) {
    const category = categories[index];

    await createCategory(category);
  }

  for (let index = 0; index < 10; index++) {
    const post = {
      user_id: 1,
      category_id: 1,
      title: customFaker.commerce.productName(),
      body: customFaker.commerce.productDescription(),
      price: customFaker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
      date: customFaker.date.future({ years: 10 }),
      address: customFaker.location.streetAddress(),
      country: customFaker.location.country(),
      state: customFaker.location.state(),
      city: customFaker.location.city(),
      zip_code: customFaker.location.zipCode("#####"),
      geolocation_latitude: customFaker.location.latitude(),
      geolocation_longitude: customFaker.location.longitude(),
    };

    const created = await createPost(post);

    await createPostLocation({ post_id: created.id, ...post });
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
