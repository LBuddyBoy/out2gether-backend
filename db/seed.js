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
      is_admin: true,
    },
    {
      username: "User",
      email: "user123@gmail.com",
      password: "password123",
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

  const dateIdeas = [
    {
      title: "Sunset Rooftop Dinner",
      body: "Enjoy a romantic dinner with a panoramic city view, perfect for anniversaries or special occasions.",
      city: "New York",
      state: "NY",
      image_url: "https://149480414.v2.pressablecdn.com/wp-content/uploads/2020/08/5be4a2_4b4f9bca21254299a75b8b5fa69060bfmv2.png", // rooftop dinner
    },
    {
      title: "Kayaking Adventure",
      body: "Spend the afternoon exploring serene waterways together. Great for active couples.",
      city: "Austin",
      state: "TX",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // kayaking
    },
    {
      title: "Wine & Paint Night",
      body: "Sip wine and get creative at this fun, interactive date night.",
      city: "San Francisco",
      state: "CA",
      image_url: "https://thumbs.dreamstime.com/b/stunning-photo-captures-essence-romantic-rooftop-sunset-dinner-city-warm-glow-setting-sun-provides-beautiful-355057097.jpg", // wine & paint
    },
    {
      title: "Stargazing Picnic",
      body: "Pack a blanket and snacks for a quiet evening under the stars.",
      city: "Sedona",
      state: "AZ",
      image_url: "https://i.pinimg.com/736x/0c/b1/d9/0cb1d9dcd7ef02d2859c6aad24bd3255.jpg", // stargazing
    },
    {
      title: "Cooking Class for Two",
      body: "Learn how to make a new dish together with expert chefs.",
      city: "Chicago",
      state: "IL",
      image_url: "https://www.westend61.de/images/0000848632pw/couple-enjoying-cooking-class-in-kitchen-CAIF08755.jpg", // cooking
    },
    {
      title: "Ghost Tour & Dessert Crawl",
      body: "Explore your city’s haunted history and top dessert spots.",
      city: "New Orleans",
      state: "LA",
      image_url: "https://doorcountytrolley.com/wp-content/uploads/sites/4184/2020/05/Haunted-Pub-Crawl-image-3-e1643991857873.jpg?w=700&h=700&zoom=2", // spooky street
    },
  ];

  for (let i = 0; i < 100; i++) {
    const idea = dateIdeas[i % dateIdeas.length];
    const date = customFaker.date.future({ years: 2 });

    const post = {
      user_id: users[i % users.length].id,
      category_id: getRandomInt(1, categories.length),
      title: idea.title,
      body: idea.body,
      price: customFaker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().split(" ")[0],
      address: customFaker.location.streetAddress(),
      country: "USA",
      state: idea.state,
      city: idea.city,
      zip_code: customFaker.location.zipCode("#####"),
      geolocation_latitude: customFaker.location.latitude(),
      geolocation_longitude: customFaker.location.longitude(),
      image_url: idea.image_url,
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
