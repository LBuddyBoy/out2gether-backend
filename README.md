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
  // OPTIONAL
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Request

```http
POST /users/register
Content-Type: application/json

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

_No content returned on success._

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

#### Example Request

```http
POST /users/login
Content-Type: application/json

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

Validates a JWT token (useful for clients to check if a token is still valid) and returns a user object.

#### Request Body

```json
{
  "token": "<jwt-token>"
}
```

#### Example Request

```http
POST /users/me
Content-Type: application/json

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
  // ...other fields
}
```

---

## Categories

### Get All Categories

**GET** `/categories`

Returns a list of all available categories.

#### Example Request

```http
GET /categories
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
[
  {
    "id": 1,
    "name": "Electronics"
  },
  {
    "id": 2,
    "name": "Clothing"
  }
  // ...more categories
]
```

---

### Get Posts by Category

**GET** `/categories/:id/posts/:page/:limit`

Returns a paginated list of posts for a specific category.

#### URL Parameters

- `id` (integer): Category ID
- `page` (integer): Page number (starting from 1)
- `limit` (integer): Number of posts per page

#### Example Request

```http
GET /categories/1/posts/1/10
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
[
  {
    "id": 42,
    "title": "Vintage Camera",
    "body": "A classic film camera from the 70s.",
    "price": 100.0,
    "created_at": "2025-07-28T14:10:00Z",
    "user_id": 3,
    "category_id": 1
    // ...other post fields
  }
  // ...more posts
]
```

---

## Posts

### Get Posts (Paginated)

**GET** `/posts/:page/:limit`

Returns a paginated list of posts.

#### URL Parameters

- `page` (integer): Page number (starting from 1)
- `limit` (integer): Number of posts per page

#### Example Request

```http
GET /posts/1/10
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
[
  {
    "id": 42,
    "title": "Vintage Camera",
    "body": "A classic film camera from the 70s.",
    "price": 100.0,
    "created_at": "2025-07-28T14:10:00Z",
    "user_id": 3
    // ...other fields
  }
  // ...more posts
]
```

---

### Get Posts Near Location

**GET** `/posts/:page/:limit/:miles`

Returns a paginated list of posts within a certain distance from a geographic point.

#### URL Parameters

- `page` (integer): Page number
- `limit` (integer): Number of posts per page
- `miles` (integer): Radius in miles

#### Request Body

```json
{
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Request

```http
GET /posts/1/10/20
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Response

```json
[
  {
    "id": 55,
    "title": "Bicycle for Sale",
    "price": 120,
    "geolocation_latitude": 29.95,
    "geolocation_longitude": -90.07
    // ...other fields
  }
  // ...more posts within 20 miles
]
```

---

### Create Post (Authenticated)

**POST** `/posts`

Creates a new post.

#### Request Body

```json
{
  "title": "Brand New Laptop",
  "body": "Latest model, barely used.",
  "price": 900.0,
  "date": "2025-07-28",
  "country": "USA",
  "state": "LA",
  "city": "New Orleans",
  "zip_code": 70130,
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Request

```http
POST /posts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Late Night Mini Golf",
  "body": "Cool golf stuff.",
  "price": 25.00,
  "date": "2025-07-28",
  "country": "USA",
  "state": "LA",
  "city": "New Orleans",
  "zip_code": 70130,
  "geolocation_latitude": 29.9511,
  "geolocation_longitude": -90.0715
}
```

#### Example Response

```json
{
  "id": 123,
  "title": "Late Night Mini Golf",
  "body": "Cool golf stuff.",
  "price": 25.0,
  "date": "2025-07-28",
  "created_at": "2025-07-28T15:10:00Z",
  "user_id": 2
  // ...other fields
}
```

---

### Get Post by ID

**GET** `/posts/:id`

Returns a single post by its ID.

#### URL Parameter

- `id` (integer): Post ID

#### Example Request

```http
GET /posts/123
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
{
  "id": 123,
  "title": "Brand New Laptop",
  "body": "Latest model, barely used.",
  "price": 900.0,
  "date": "2025-07-28",
  "created_at": "2025-07-28T15:10:00Z",
  "user_id": 2
  // ...other fields
}
```

---

### Update Post (Authenticated)

**PUT** `/posts/:id`

Updates a post by its ID.

#### URL Parameter

- `id` (integer): Post ID

#### Request Body

Fields to update (any subset of the original fields).

```json
{
  "title": "Slightly Used Laptop",
  "price": 850.0
}
```

#### Example Request

```http
PUT /posts/123
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Slightly Used Laptop",
  "price": 850.00
}
```

#### Example Response

```json
{
  "id": 123,
  "title": "Slightly Used Laptop",
  "price": 850.0
  // ...updated fields
}
```

---

### Delete Post (Authenticated)

**DELETE** `/posts/:id`

Deletes a post by its ID.

#### Example Request

```http
DELETE /posts/123
Authorization: Bearer <jwt-token>
```

#### Example Response

```http
204 No Content
```

---

## Cart (Authenticated)

All cart endpoints require authentication via JWT.

### Get All Cart Items

**GET** `/cart`

Returns all cart items for the currently authenticated user.

#### Example Request

```http
GET /cart
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
[
  {
    "post_id": 101,
    "owner_id": 2,
    "quantity": 1
    // ...possibly more fields (e.g., post details, if populated in response)
  }
  // ...more cart items
]
```

---

### Add Item to Cart

**POST** `/cart`

Adds a post to the user's cart, or updates the quantity if already present.

#### Request Body

```json
{
  "post_id": 101,
  "quantity": 1
}
```

#### Example Request

```http
POST /cart
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "post_id": 101,
  "quantity": 1
}
```

#### Example Response

```json
{
  "post_id": 101,
  "owner_id": 2,
  "quantity": 1
}
```

---

### Get Cart Item by Post ID

**GET** `/cart/:post_id`

Returns a specific cart item for the user by post ID.

#### URL Parameter

- `post_id` (integer): ID of the post/item

#### Example Request

```http
GET /cart/101
Authorization: Bearer <jwt-token>
```

#### Example Response

```json
{
  "post_id": 101,
  "owner_id": 2,
  "quantity": 1
}
```

---

### Update Cart Item

**PUT** `/cart/:post_id`

Updates the quantity of a specific cart item for the user.

#### URL Parameter

- `post_id` (integer): ID of the post/item

#### Request Body

```json
{
  "quantity": 2
}
```

#### Example Request

```http
PUT /cart/101
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "quantity": 2
}
```

#### Example Response

```json
{
  "post_id": 101,
  "owner_id": 2,
  "quantity": 2
}
```

---

### Remove Cart Item

**DELETE** `/cart/:post_id`

Removes a specific cart item from the user's cart.

#### Example Request

```http
DELETE /cart/101
Authorization: Bearer <jwt-token>
```

#### Example Response

```http
204 No Content
```

---

# Final Notes

- All authenticated routes require `Authorization: Bearer <jwt-token>`.
- All endpoints return `401 Unauthorized` if the JWT is missing or invalid.
- Errors and validation failures are returned as JSON error messages.
