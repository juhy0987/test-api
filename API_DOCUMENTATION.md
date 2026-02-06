# API Documentation - 모두의 책

## Overview

This API provides user authentication, post management, and comment features for the "모두의 책" project.

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Comment & Reply Endpoints](#comment--reply-endpoints)
3. [Security & Rate Limiting](#security--rate-limiting)
4. [Database Schema](#database-schema)
5. [Testing](#testing)

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

**Error Responses:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email or nickname already exists
- `429 Too Many Requests` - Rate limit exceeded

---

### 2. Email Verification

**Endpoint:** `GET /api/auth/verify-email`

**Description:** Verify user email and activate account using verification token.

**Query Parameters:**
- `token` (required): Verification token sent via email

**Example:**
```
GET /api/auth/verify-email?token=a1b2c3d4e5f6...
```

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

### 3. Check Email Availability

**Endpoint:** `POST /api/auth/check-email`

**Description:** Check if an email is available for registration.

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

### 4. Check Nickname Availability

**Endpoint:** `POST /api/auth/check-nickname`

**Description:** Check if a nickname is available for registration.

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

## Comment & Reply Endpoints

> **📝 Note:** For detailed comment API documentation, see [COMMENTS_API.md](./COMMENTS_API.md)

### 1. Create Comment or Reply

**Endpoint:** `POST /api/posts/:postId/comments`

**Authentication:** Required (Bearer token)

**Description:** Create a new comment on a post or reply to an existing comment.

**Request Body:**
```json
{
  "content": "This is my comment",
  "parentCommentId": 123  // Optional: for replies
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "댓글이 작성되었습니다.",
  "data": {
    "id": 456,
    "post_id": 1,
    "user_id": 10,
    "parent_comment_id": 123,
    "content": "This is my comment",
    "created_at": "2026-02-03T12:34:56.789Z",
    "nickname": "john_doe",
    "profile_picture": "https://example.com/profile.jpg"
  }
}
```

---

### 2. Get Comments for a Post

**Endpoint:** `GET /api/posts/:postId/comments`

**Authentication:** Not required

**Description:** Retrieve all comments for a post with nested replies.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "Great post!",
        "nickname": "john_doe",
        "profile_picture": "https://example.com/john.jpg",
        "created_at": "2026-02-03T10:00:00.000Z",
        "replies": [
          {
            "id": 2,
            "content": "@john_doe Thanks!",
            "nickname": "jane_doe",
            "created_at": "2026-02-03T10:05:00.000Z"
          }
        ]
      }
    ],
    "total": 2
  }
}
```

---

### 3. Update Comment

**Endpoint:** `PATCH /api/comments/:commentId`

**Authentication:** Required (Bearer token)

**Description:** Update comment content. Users can only update their own comments.

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "댓글이 수정되었습니다.",
  "data": { /* updated comment */ }
}
```

---

### 4. Delete Comment

**Endpoint:** `DELETE /api/comments/:commentId`

**Authentication:** Required (Bearer token)

**Description:** Delete a comment. Users can only delete their own comments.

**Success Response (200):**
```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다."
}
```

---

## Security & Rate Limiting

### Rate Limits
- **Signup endpoint:** 5 requests per 15 minutes per IP
- **Check endpoints:** 30 requests per minute per IP

### Security Features
1. **Password Hashing:** bcrypt with 10 salt rounds
2. **JWT Authentication:** Token-based authentication for protected endpoints
3. **CORS Protection:** Configured for specified frontend URL
4. **Helmet Security:** HTTP headers secured
5. **Token Security:** Cryptographically secure verification tokens
6. **Token Expiration:** Verification tokens expire after 24 hours

### Authentication

Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  profile_picture VARCHAR(255),
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

### Comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT content_length CHECK (char_length(content) <= 500)
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

## Testing

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","nickname":"testuser"}'
```

**Create a comment:**
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content":"Great post!"}'
```

**Get comments:**
```bash
curl http://localhost:3000/api/posts/1/comments
```

**Update a comment:**
```bash
curl -X PATCH http://localhost:3000/api/comments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content":"Updated content"}'
```

**Delete a comment:**
```bash
curl -X DELETE http://localhost:3000/api/comments/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Environment Variables

See `.env.example` for required environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: Sender email address
- `FRONTEND_URL`: Frontend application URL
- `VERIFICATION_TOKEN_EXPIRY_HOURS`: Token validity period (default: 24)

---

## Error Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## Deployment Notes

1. Ensure PostgreSQL database is set up
2. Run database migrations: `npm run migrate`
3. Configure all environment variables
4. Set up SMTP email service
5. Update CORS settings for production
6. Use HTTPS in production
7. Monitor rate limits and adjust as needed
8. Keep JWT_SECRET secure and rotate periodically
