import db from "#db/client";
import { base, de, de_CH, en, Faker } from "@faker-js/faker";
import { createUser, getUsers } from "#db/query/users";
import { createPost, getPosts } from "#db/query/posts";
import { createPostLocation } from "#db/query/post_locations";
import { createCategory, getCategories } from "#db/query/categories";
import { createCartItem } from "#db/query/cart_items";
import { createFavoritePost } from "#db/query/favorite_posts";

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
  await seedUsers();
  await seedCategories();
  await seedPosts();
  await seedCart();
  await seedFavorites();
  await printStats();
}

async function seedUsers() {
  const users = [
    {
      username: "Admin",
      email: "admin123@gmail.com",
      password: "password123",
      geolocation_latitude: 29.88195,
      geolocation_longitude: -90.02341,
      is_admin: true,
    },
    {
      username: "User",
      email: "user123@gmail.com",
      password: "password123",
      geolocation_latitude: 29.88195,
      geolocation_longitude: -90.02341,
      is_admin: false,
    },
  ];

  for (const index in users) {
    const user = users[index];

    await createUser(user);
  }
}

async function seedCategories() {
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

  for (const index in categories) {
    const category = categories[index];

    await createCategory(category);
  }
}

async function seedPosts() {
  const categories = await getCategories();
  const users = await getUsers();

  for (let index = 0; index < 100; index++) {
    const post = {
      user_id: 1,
      category_id: getRandomInt(1, categories.length),
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
      image_url: customFaker.image.urlPicsumPhotos({ width: 640, height: 480 }),
    };

    const created = await createPost(post);

    await createPostLocation({ post_id: created.id, ...post });
  }
}

async function seedCart() {
  const { rows: posts } = await db.query("SELECT * FROM posts");
  const { rows: users } = await db.query("SELECT * FROM users");

  for (let index = 0; index < 100; index++) {
    const post = posts[getRandomInt(1, posts.length) - 1];
    const user = users[getRandomInt(1, users.length) - 1];

    try {
      await createCartItem({
        post_id: post.id,
        owner_id: user.id,
        quantity: getRandomInt(1, 5),
      });
    } catch (ignored) {}
  }
}

async function seedFavorites() {
  const { rows: posts } = await db.query("SELECT * FROM posts");
  const { rows: users } = await db.query("SELECT * FROM users");

  for (let index = 0; index < 20; index++) {
    const post = posts[getRandomInt(1, posts.length) - 1];
    const user = users[getRandomInt(1, users.length) - 1];

    try {
      await createFavoritePost({
        post_id: post.id,
        user_id: user.id,
      });
    } catch (ignored) {}
  }
}

async function printStats() {
  const {
    rows: [users],
  } = await db.query("SELECT COUNT(*) FROM users");
  const {
    rows: [categories],
  } = await db.query("SELECT COUNT(*) FROM categories");
  const {
    rows: [posts],
  } = await db.query("SELECT COUNT(*) FROM posts");
  const {
    rows: [cart_items],
  } = await db.query("SELECT COUNT(*) FROM cart_items");
  const {
    rows: [favorites],
  } = await db.query("SELECT COUNT(*) FROM favorite_posts");

  console.log("Seeded Users: ", users);
  console.log("Seeded Categories: ", categories);
  console.log("Seeded Posts: ", posts);
  console.log("Seeded Cart Items: ", cart_items);
  console.log("Seeded Favorites: ", favorites);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
