# Email-Based User Registration and Post Like API Documentation

## Overview

This API provides email-based user registration with verification functionality, post management, and like features for the "모두의 책" project.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user with email, password, and nickname. Sends a verification email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nickname": "user123"
}
```

**Validation Rules:**
- **Email:** Must be RFC 5322 compliant email format
- **Password:** 
  - 8-20 characters long
  - At least one English letter (a-z, A-Z)
  - At least one number (0-9)
  - At least one special character from: `!@#$%^&*`
- **Nickname:**
  - 2-10 characters long
  - Only Korean (한글), English (a-z, A-Z), or numbers (0-9)

**Success Response (201):**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "user123",
    "status": "inactive"
  }
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password. Returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "user123",
      "status": "active"
    }
  }
}
```

**Error Responses:**
- **401:** Email or password incorrect
- **403:** Email not verified

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get current authenticated user information.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "user123",
    "status": "active"
  }
}
```

---

### 4. Email Verification

**Endpoint:** `GET /api/auth/verify-email`

**Query Parameters:**
- `token` (required): Verification token sent via email

**Success Response (200):**
```json
{
  "success": true,
  "message": "이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "user123",
    "status": "active"
  }
}
```

---

### 5. Check Email Availability

**Endpoint:** `POST /api/auth/check-email`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "available": true,
  "message": "사용 가능한 이메일입니다."
}
```

---

### 6. Check Nickname Availability

**Endpoint:** `POST /api/auth/check-nickname`

**Request Body:**
```json
{
  "nickname": "user123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "available": true,
  "message": "사용 가능한 닉네임입니다."
}
```

---

## Post Endpoints

### 1. Get All Posts

**Endpoint:** `GET /api/posts`

**Description:** Get all posts with pagination. Includes like count and user's like status.

**Authentication:** Optional (for `isLiked` field)

**Query Parameters:**
- `limit` (optional): Number of posts per page (default: 20)
- `offset` (optional): Number of posts to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "My First Post",
      "content": "This is the content of my first post.",
      "author_nickname": "user123",
      "like_count": 15,
      "is_liked": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

---

### 2. Get Single Post

**Endpoint:** `GET /api/posts/:postId`

**Description:** Get a single post by ID with like information.

**Authentication:** Optional (for `isLiked` field)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author_nickname": "user123",
    "like_count": 15,
    "is_liked": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "게시물을 찾을 수 없습니다."
}
```

---

### 3. Create Post

**Endpoint:** `POST /api/posts`

**Description:** Create a new post.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my new post."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "게시물이 생성되었습니다.",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "My New Post",
    "content": "This is the content of my new post.",
    "like_count": 0,
    "is_liked": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Update Post

**Endpoint:** `PUT /api/posts/:postId`

**Description:** Update an existing post. Only the author can update.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "게시물이 수정되었습니다.",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Updated Title",
    "content": "Updated content.",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "게시물을 수정할 권한이 없습니다."
}
```

---

### 5. Delete Post

**Endpoint:** `DELETE /api/posts/:postId`

**Description:** Delete a post. Only the author can delete.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "게시물이 삭제되었습니다."
}
```

---

### 6. Toggle Like

**Endpoint:** `POST /api/posts/:postId/toggle-like`

**Description:** Toggle like status for a post. Creates a like if not liked, removes if already liked.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "좋아요를 눌렀습니다.",
  "data": {
    "action": "liked",
    "likeCount": 16,
    "isLiked": true
  }
}
```

Or when unliking:

```json
{
  "success": true,
  "message": "좋아요를 취소했습니다.",
  "data": {
    "action": "unliked",
    "likeCount": 15,
    "isLiked": false
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "게시물을 찾을 수 없습니다."
}
```

---

## Rate Limiting

- **Signup endpoint:** 5 requests per 15 minutes per IP
- **Check endpoints:** 30 requests per minute per IP
- **Post endpoints:** 100 requests per minute per IP

---

## Security Features

1. **Password Hashing:** Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Authentication:** Secure token-based authentication with 7-day expiry
3. **CORS Protection:** Configured to accept requests from specified frontend URL
4. **Helmet Security:** HTTP headers secured with Helmet middleware
5. **Rate Limiting:** Prevents abuse with request limits
6. **Token Security:** Verification tokens are cryptographically secure (64 hex characters)
7. **Token Expiration:** Verification tokens expire after 24 hours

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Likes Table
```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);
```

### Email Verification Tokens Table
```sql
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing the API

### Using cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "nickname": "testuser"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**3. Get all posts:**
```bash
curl http://localhost:3000/api/posts
```

**4. Get all posts (authenticated):**
```bash
curl http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**5. Create a post:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first post content."
  }'
```

**6. Toggle like:**
```bash
curl -X POST http://localhost:3000/api/posts/1/toggle-like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Environment Variables

See `.env.example` for required environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: Sender email address
- `FRONTEND_URL`: Frontend application URL
- `VERIFICATION_TOKEN_EXPIRY_HOURS`: Token validity period (default: 24)

---

## Deployment Notes

1. Ensure PostgreSQL database is set up
2. Run database migrations: `npm run migrate`
3. Configure environment variables (especially JWT_SECRET)
4. Set up SMTP email service (Gmail, SendGrid, etc.)
5. Update CORS settings for production frontend URL
6. Use HTTPS in production
7. Monitor rate limits and adjust as needed
