# 모두의 책 - Email Registration API

이메일 기반 사용자 회원가입 API 서버

## 프로젝트 개요

모두의 책 프로젝트의 백엔드 API 서버로, 이메일 기반 회원가입 및 인증 기능을 제공합니다.

## 주요 기능

- ✅ 이메일 기반 회원가입
- ✅ 이메일 인증 (24시간 유효)
- ✅ 비밀번호 보안 규칙 검증
- ✅ 닉네임 형식 검증 (한글/영문/숫자)
- ✅ 실시간 이메일/닉네임 중복 확인
- ✅ Rate Limiting 보호
- ✅ 보안 HTTP 헤더 (Helmet)
- ✅ CORS 설정

## 기술 스택

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** bcrypt (비밀번호 해싱)
- **Email:** Nodemailer (SMTP)
- **Security:** Helmet, express-rate-limit, CORS

## API 엔드포인트

### 1. 회원가입
```
POST /api/auth/signup
```
이메일, 비밀번호, 닉네임으로 새 사용자 등록 및 인증 메일 발송

### 2. 이메일 인증
```
GET /api/auth/verify-email?token={token}
```
인증 토큰으로 계정 활성화

### 3. 이메일 중복 확인
```
POST /api/auth/check-email
```
실시간 이메일 중복 검사

### 4. 닉네임 중복 확인
```
POST /api/auth/check-nickname
```
실시간 닉네임 중복 검사

## 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 및 SMTP 설정
```

### 3. 데이터베이스 마이그레이션
```bash
npm run migrate
```

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

- [API 문서](./API_DOCUMENTATION.md) - 전체 API 엔드포인트 명세
- [설치 가이드](./SETUP_GUIDE.md) - 로컬 및 Railway 배포 가이드

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

## 보안 기능

- **비밀번호 해싱:** bcrypt (10 salt rounds)
- **Rate Limiting:** 가입 5회/15분, 검증 30회/분
- **토큰 보안:** 64자 암호화 토큰, 24시간 만료
- **HTTPS 권장:** 프로덕션 환경
- **CORS 보호:** 허용된 도메인만 접근 가능
- **SQL Injection 방지:** Parameterized queries

## 환경 변수

필수 환경 변수:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3001
```

자세한 내용은 `.env.example` 참고

## 데이터베이스 스키마

### users 테이블
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password (VARCHAR, bcrypt hashed)
- nickname (VARCHAR UNIQUE)
- status (VARCHAR: 'active' | 'inactive' | 'suspended')
- created_at, updated_at (TIMESTAMP)

### email_verification_tokens 테이블
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY)
- token (VARCHAR UNIQUE)
- expires_at (TIMESTAMP)
- used (BOOLEAN)
- created_at (TIMESTAMP)

## 프로젝트 구조

```
test-api/
├── src/
│   ├── controllers/        # API 컨트롤러
│   ├── database/           # 데이터베이스 설정 및 마이그레이션
│   ├── middleware/         # Express 미들웨어
│   ├── models/             # 데이터베이스 모델
│   ├── routes/             # API 라우트
│   ├── utils/              # 유틸리티 함수
│   └── server.js           # 메인 서버 파일
├── .env.example          # 환경 변수 예시
├── package.json
└── README.md
```

## 개발 스크립트

```bash
npm start          # 프로덕션 서버 실행
npm run dev        # 개발 서버 실행 (nodemon)
npm run migrate    # 데이터베이스 마이그레이션
```

## 테스트 예시

### 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "nickname": "테스터"
  }'
```

### 이메일 중복 확인
```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 배포

### Railway

1. Railway 프로젝트 생성
2. PostgreSQL 데이터베이스 추가
3. 환경 변수 설정
4. GitHub 리포지토리 연결
5. 자동 배포

자세한 배포 가이드는 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 참고

## 문제 해결

일반적인 문제와 해결 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) 참고

## 라이센스

ISC

## 기여

Eposo를 통해 관리되는 프로젝트

## 지원

문의 사항은 프로젝트 매니저에게 연락해주세요.