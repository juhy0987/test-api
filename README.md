# 모두의 책 - Backend API

이메일 기반 사용자 인증 및 댓글 기능을 제공하는 백엔드 API 서버

## 프로젝트 개요

모두의 책 프로젝트의 백엔드 API 서버로, 이메일 기반 회원가입/인증 및 게시물 댓글/대댓글 기능을 제공합니다.

## 주요 기능

### 🔐 인증 (Authentication)
- ✅ 이메일 기반 회원가입
- ✅ 이메일 인증 (24시간 유효)
- ✅ JWT 토큰 기반 인증
- ✅ 비밀번호 보안 규칙 검증
- ✅ 닉네임 형식 검증 (한글/영문/숫자)
- ✅ 실시간 이메일/닉네임 중복 확인

### 💬 댓글 & 대댓글 (Comments & Replies)
- ✅ 게시물 댓글 작성 (최대 500자)
- ✅ 댓글에 대댓글 작성 (1단계 중첩)
- ✅ 댓글 목록 조회 (오래된 순 정렬)
- ✅ 자신의 댓글 수정/삭제
- ✅ 작성자 정보 표시 (닉네임, 프로필 사진)
- ✅ 실시간 글자 수 제한 (500자)
- ✅ @멘션 지원

### 🛡️ 보안 (Security)
- ✅ Rate Limiting 보호
- ✅ 보안 HTTP 헤더 (Helmet)
- ✅ CORS 설정
- ✅ bcrypt 비밀번호 해싱
- ✅ JWT 토큰 보안

## 기술 스택

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Email:** Nodemailer (SMTP)
- **Security:** Helmet, express-rate-limit, CORS

## API 엔드포인트

### 인증 (Authentication)
```
POST   /api/auth/signup           # 회원가입
GET    /api/auth/verify-email     # 이메일 인증
POST   /api/auth/check-email      # 이메일 중복 확인
POST   /api/auth/check-nickname   # 닉네임 중복 확인
```

### 댓글 (Comments)
```
POST   /api/posts/:postId/comments      # 댓글/대댓글 작성
GET    /api/posts/:postId/comments      # 댓글 목록 조회
PATCH  /api/comments/:commentId         # 댓글 수정
DELETE /api/comments/:commentId         # 댓글 삭제
```

## 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스, SMTP, JWT 설정
```

필수 환경 변수:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3001
```

### 3. 데이터베이스 마이그레이션
```bash
npm run migrate
```

마이그레이션이 생성하는 테이블:
- `users` - 사용자 정보
- `email_verification_tokens` - 이메일 인증 토큰
- `posts` - 게시물
- `comments` - 댓글 및 대댓글

### 4. 개발 서버 실행
```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 5. 헬스체크
```bash
curl http://localhost:3000/health
```

## 상세 문서

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - 전체 API 엔드포인트 명세
- **[COMMENTS_API.md](./COMMENTS_API.md)** - 댓글 API 상세 문서
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 로컬 및 Railway 배포 가이드

## 댓글 기능 상세

### 비즈니스 규칙

1. **글자 수 제한**: 댓글은 최대 500자까지 작성 가능
2. **중첩 제한 (MVP)**: 1단계 중첩만 지원
   - 게시물 → 댓글 ✅
   - 댓글 → 대댓글 ✅
   - 대댓글 → 대대댓글 ❌
3. **권한**: 사용자는 자신의 댓글만 수정/삭제 가능
4. **정렬**: 오래된 순(정순) 정렬로 대화 흐름 유지
5. **인증**: 댓글 작성/수정/삭제는 로그인 필요
6. **조회**: 댓글 조회는 로그인 불필요

### 사용 예시

**1. 댓글 작성**
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content": "좋은 글이네요!"}'
```

**2. 대댓글 작성**
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "content": "@홍길동 감사합니다!",
    "parentCommentId": 123
  }'
```

**3. 댓글 목록 조회**
```bash
curl http://localhost:3000/api/posts/1/comments
```

**4. 댓글 수정**
```bash
curl -X PATCH http://localhost:3000/api/comments/456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content": "수정된 댓글 내용"}'
```

**5. 댓글 삭제**
```bash
curl -X DELETE http://localhost:3000/api/comments/456 \
  -H "Authorization: Bearer <your-token>"
```

## 검증 규칙

### 비밀번호
- 8-20자 길이
- 영문자 최소 1개
- 숫자 최소 1개
- 특수문자 (!@#$%^&*) 최소 1개

### 닉네임
- 2-10자 길이
- 한글, 영문, 숫자만 허용

### 이메일
- RFC 5322 표준 형식

### 댓글
- 1-500자 길이
- 공백만 있는 댓글 불가

## 데이터베이스 스키마

### users 테이블
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

### posts 테이블
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

### comments 테이블
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

### email_verification_tokens 테이블
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

## 프로젝트 구조

```
test-api/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # 인증 컨트롤러
│   │   └── commentController.js    # 댓글 컨트롤러
│   ├── database/
│   │   ├── db.js                   # DB 연결
│   │   └── migrate.js              # DB 마이그레이션
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT 인증 미들웨어
│   │   ├── errorHandler.js         # 에러 핸들러
│   │   └── rateLimiter.js          # Rate Limiter
│   ├── models/
│   │   ├── User.js                 # User 모델
│   │   ├── Post.js                 # Post 모델
│   │   ├── Comment.js              # Comment 모델
│   │   └── VerificationToken.js    # Token 모델
│   ├── routes/
│   │   ├── authRoutes.js           # 인증 라우트
│   │   └── commentRoutes.js        # 댓글 라우트
│   ├── utils/
│   │   ├── emailService.js         # 이메일 서비스
│   │   ├── tokenGenerator.js       # 토큰 생성
│   │   └── validation.js           # 입력 검증
│   └── server.js                   # 메인 서버
├── .env.example
├── package.json
├── API_DOCUMENTATION.md            # API 문서
├── COMMENTS_API.md                 # 댓글 API 상세 문서
└── README.md
```

## 개발 스크립트

```bash
npm start          # 프로덕션 서버 실행
npm run dev        # 개발 서버 실행 (nodemon)
npm run migrate    # 데이터베이스 마이그레이션
```

## 보안 기능

- **비밀번호 해싱:** bcrypt (10 salt rounds)
- **JWT 인증:** 토큰 기반 사용자 인증
- **Rate Limiting:** 
  - 가입: 5회/15분
  - 검증: 30회/분
- **토큰 보안:** 
  - 이메일 인증: 64자 암호화 토큰, 24시간 만료
  - JWT: 환경변수로 관리되는 시크릿 키
- **HTTPS 권장:** 프로덕션 환경
- **CORS 보호:** 허용된 도메인만 접근 가능
- **SQL Injection 방지:** Parameterized queries
- **Cascade Delete:** 부모 엔티티 삭제 시 자동 정리

## 배포

### Railway

1. Railway 프로젝트 생성
2. PostgreSQL 데이터베이스 추가
3. 환경 변수 설정
4. GitHub 리포지토리 연결
5. 자동 배포

자세한 배포 가이드는 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 참고

## 프론트엔드 통합 가이드

### JWT 토큰 관리
```javascript
// 로그인 후 토큰 저장
localStorage.setItem('authToken', token);

// API 요청 시 토큰 포함
fetch('/api/posts/1/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({ content: '댓글 내용' })
});
```

### 실시간 글자 수 카운터
```javascript
const maxLength = 500;
const remaining = maxLength - content.length;
// 표시: "123/500"
```

### 대댓글 입력 시 @멘션
```javascript
const replyContent = `@${parentComment.nickname} `;
```

### 시간 표시 포맷
```javascript
// 1시간 이내: "5분 전"
// 24시간 이내: "3시간 전"
// 그 이상: "2026.02.03"
```

### Optimistic UI 업데이트
```javascript
// 1. UI에 즉시 추가
addCommentToUI(newComment);
// 2. API 요청
const response = await createComment(newComment);
// 3. 서버 응답으로 업데이트 (ID, timestamp 등)
updateCommentInUI(response.data);
```

## 문제 해결

일반적인 문제와 해결 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) 참고

## 라이센스

ISC

## 기여

Eposo를 통해 관리되는 프로젝트

## 지원

문의 사항은 프로젝트 매니저에게 연락해주세요.
