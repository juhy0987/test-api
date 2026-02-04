# Email-Based User Registration API Documentation

## Overview

This API provides email-based user registration with verification functionality for the "모두의 책" project.

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

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

*400 Bad Request - Invalid input:*
```json
{
  "success": false,
  "message": "비밀번호는 최소 8자 이상이어야 합니다.",
  "errors": {
    "password": ["비밀번호는 최소 8자 이상이어야 합니다."]
  }
}
```

*409 Conflict - Email or nickname already exists:*
```json
{
  "success": false,
  "message": "이미 사용 중인 이메일입니다.",
  "errors": {
    "email": "이미 사용 중인 이메일입니다."
  }
}
```

*429 Too Many Requests - Rate limit exceeded:*
```json
{
  "success": false,
  "message": "너무 많은 가입 시도가 감지되었습니다. 15분 후에 다시 시도해주세요."
}
```

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

**Error Responses:**

*400 Bad Request - Invalid/expired token:*
```json
{
  "success": false,
  "message": "유효하지 않은 인증 토큰입니다."
}
```

```json
{
  "success": false,
  "message": "만료된 인증 토큰입니다. 다시 시도해주세요."
}
```

```json
{
  "success": false,
  "message": "이미 사용된 인증 토큰입니다."
}
```

---

### 3. Check Email Availability

**Endpoint:** `POST /api/auth/check-email`

**Description:** Check if an email is available for registration. Used for real-time frontend validation.

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

```json
{
  "success": true,
  "available": false,
  "message": "이미 사용 중인 이메일입니다."
}
```

**Rate Limit:** 30 requests per minute per IP

---

### 4. Check Nickname Availability

**Endpoint:** `POST /api/auth/check-nickname`

**Description:** Check if a nickname is available for registration. Used for real-time frontend validation.

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

```json
{
  "success": true,
  "available": false,
  "message": "이미 사용 중인 닉네임입니다."
}
```

**Rate Limit:** 30 requests per minute per IP

---

## Rate Limiting

- **Signup endpoint:** 5 requests per 15 minutes per IP
- **Check endpoints:** 30 requests per minute per IP

## Security Features

1. **Password Hashing:** Passwords are hashed using bcrypt with 10 salt rounds
2. **CORS Protection:** Configured to accept requests from specified frontend URL
3. **Helmet Security:** HTTP headers secured with Helmet middleware
4. **Rate Limiting:** Prevents abuse with request limits
5. **Token Security:** Verification tokens are cryptographically secure (64 hex characters)
6. **Token Expiration:** Verification tokens expire after 24 hours

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

## Error Handling

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

**2. Check email availability:**
```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**3. Check nickname availability:**
```bash
curl -X POST http://localhost:3000/api/auth/check-nickname \
  -H "Content-Type: application/json" \
  -d '{"nickname": "testuser"}'
```

**4. Verify email:**
```bash
curl http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN_HERE
```

## Environment Variables

See `.env.example` for required environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: Sender email address
- `FRONTEND_URL`: Frontend application URL
- `VERIFICATION_TOKEN_EXPIRY_HOURS`: Token validity period (default: 24)

## Deployment Notes

1. Ensure PostgreSQL database is set up
2. Run database migrations: `npm run migrate`
3. Configure environment variables
4. Set up SMTP email service (Gmail, SendGrid, etc.)
5. Update CORS settings for production frontend URL
6. Use HTTPS in production
7. Monitor rate limits and adjust as needed