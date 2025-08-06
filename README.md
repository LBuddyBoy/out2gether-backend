# API Documentation

> **Base URL:**
> `/` (root of your deployed API)

---

## Authentication

Most endpoints require authentication via a **JWT Bearer Token**.
Send the token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

---

## Users

### Register

**POST** `/users/register`

Creates a new user account.

#### Request Body

```json
{
  "username": "exampleuser",
  "email": "user@example.com",
  "password": "yourpassword",
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Response

```http
201 Created
```

---

### Login

**POST** `/users/login`

Authenticates a user and returns a JWT token.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

#### Example Response

```json
{
  "token": "<jwt-token>",
  "user": {
    "id": 1,
    "username": "exampleuser",
    "email": "user@example.com",
    "geolocation_latitude": 29.9511,
    "geolocation_longitude": -90.0715
  }
}
```

---

### Me

**POST** `/users/me`

Validates a JWT token and returns the user object.

#### Request Body

```json
{
  "token": "<jwt-token>"
}
```

#### Example Response

```json
{
  "id": 1,
  "username": "exampleuser",
  "email": "user@example.com"
}
```

---

## Categories

### Get All Categories

**GET** `/categories`

Returns a list of all available categories.

---

### Get Posts by Category

**GET** `/categories/:id/posts/:page/:limit`

Returns a paginated list of posts in a category.

---

## Posts

### Get All Posts

**GET** `/posts/:page/:limit`

Returns a paginated list of all posts.

---

### Get Posts Near Location

**GET** `/posts/near/:page/:limit/:miles`

Returns posts near the authenticated user's location within a radius in miles.

#### Request Body

```json
{
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

---

### Search for Posts

**GET** `/posts/search/:page/:limit/:query`

Returns posts matching a search query.

---

### Create a Post

**POST** `/posts`

Creates a new post.

#### Request Body

```json
{
  "title": "Event Title",
  "body": "Description here",
  "price": 50.0,
  "date": "2025-07-28",
  "country": "USA",
  "state": "CA",
  "city": "San Francisco",
  "zip_code": 94102,
  "geolocation_latitude": 37.7749,
  "geolocation_longitude": -122.4194
}
```

---

### Get Post by ID

**GET** `/posts/:id`

Returns a specific post by ID.

---

### Update Post

**PUT** `/posts/:id`

Updates a post.

---

### Delete Post

**DELETE** `/posts/:id`

Deletes a post.

---

## Cart

### Get Cart Items

**GET** `/cart`

Returns all cart items for the user.

---

### Add to Cart

**POST** `/cart`

Adds a post to the cart.

---

### Get Cart Item by Post ID

**GET** `/cart/:post_id`

Returns a specific cart item.

---

### Update Cart Item

**PUT** `/cart/:post_id`

Updates the quantity of a cart item.

---

### Remove from Cart

**DELETE** `/cart/:post_id`

Removes a cart item.

---

## Favorites

### Get All Favorites

**GET** `/favorites`

Returns all posts the user has marked as favorites.

---

### Add to Favorites

**POST** `/favorites`

Marks a post as a favorite.

#### Request Body

```json
{
  "post_id": 123
}
```

---

### Remove from Favorites

**DELETE** `/favorites/:post_id`

Removes a post from favorites.

---

## Final Notes

* All authenticated routes require a JWT Bearer Token.
* Endpoints return `401 Unauthorized` if the JWT is invalid.
* Error messages are returned in JSON format.
