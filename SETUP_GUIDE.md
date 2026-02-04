# Setup Guide - Email Registration API

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- SMTP email service (Gmail, SendGrid, etc.)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd test-api
npm install
```

### 2. Database Setup

**Create PostgreSQL Database:**

```bash
psql -U postgres
CREATE DATABASE test_api_db;
\q
```

**Set up connection string:**

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/test_api_db
```

**Run migrations:**

```bash
npm run migrate
```

### 3. Environment Configuration

**Copy the example environment file:**

```bash
cp .env.example .env
```

**Edit `.env` with your configuration:**

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/test_api_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Token expiry
VERIFICATION_TOKEN_EXPIRY_HOURS=24
```

### 4. Gmail SMTP Setup (if using Gmail)

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

### 5. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

**Test health check:**
```bash
curl http://localhost:3000/health
```

## Railway Deployment Setup

### 1. Prepare Railway Environment

**Ensure PostgreSQL is set up:**
- Railway automatically provides `DATABASE_URL`
- The migration will run automatically on first deploy

**Set environment variables in Railway:**
```
PORT=3000
NODE_ENV=production
DATABASE_URL=(automatically set by Railway)
JWT_SECRET=<generate-secure-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=<your-frontend-url>
VERIFICATION_TOKEN_EXPIRY_HOURS=24
```

### 2. Deploy to Railway

**Connect GitHub repository:**
- Railway will auto-deploy from the main branch
- Or deploy manually from branch

**Run migrations:**
```bash
npm run migrate
```

### 3. Verify Deployment

**Check health endpoint:**
```bash
curl https://your-app.railway.app/health
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "nickname": "테스터"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "테스터",
    "status": "inactive"
  }
}
```

### 2. Check Email

**Check your inbox for verification email**

The email will contain a link like:
```
http://localhost:3001/api/auth/verify-email?token=abc123...
```

### 3. Verify Email

**Click the link in the email or use cURL:**

```bash
curl "http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "테스터",
    "status": "active"
  }
}
```

### 4. Check Email Availability

```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 5. Check Nickname Availability

```bash
curl -X POST http://localhost:3000/api/auth/check-nickname \
  -H "Content-Type: application/json" \
  -d '{"nickname": "테스터"}'
```

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check firewall settings

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Email Sending Issues

**Error: "Invalid login"**
- Verify SMTP credentials
- For Gmail, ensure App Password is used (not regular password)
- Check if 2FA is enabled on Google account

**Error: "Connection timeout"**
- Check SMTP host and port
- Verify firewall allows outbound SMTP connections

### Rate Limiting

**Error: "Too many requests"**
- Wait for the cooldown period
- Adjust rate limits in `src/middleware/rateLimiter.js` for development

### Migration Errors

**Error: "relation already exists"**
- Tables already exist, safe to ignore
- Or drop and recreate database:

```bash
psql -U postgres
DROP DATABASE test_api_db;
CREATE DATABASE test_api_db;
\q
npm run migrate
```

## Development Tips

### Use nodemon for auto-reload
```bash
npm run dev
```

### Check logs
```bash
# In development
tail -f logs/server.log

# In Railway
railway logs
```

### Database queries
```bash
# Connect to local database
psql -U postgres -d test_api_db

# View users
SELECT * FROM users;

# View tokens
SELECT * FROM email_verification_tokens;
```

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS in production
- [ ] Configure CORS to allow only your frontend domain
- [ ] Use strong SMTP credentials
- [ ] Set up database backups
- [ ] Monitor rate limits and adjust as needed
- [ ] Keep dependencies updated
- [ ] Use SSL for database connections in production
- [ ] Implement logging and monitoring

## Next Steps

1. Set up frontend application
2. Implement login functionality
3. Add password reset feature
4. Implement session management
5. Add user profile management
6. Set up logging and monitoring
7. Implement automated testing
8. Set up CI/CD pipeline