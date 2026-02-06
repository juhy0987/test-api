# Implementation Summary - Comment & Reply Feature

## Story: 게시물 댓글 및 대댓글 기능 구현

**Story ID:** 1359  
**Implementation Date:** 2026-02-03  
**Repository:** test-api (Backend)  

---

## Overview

Successfully implemented a complete comment and reply system for the "모두의 책" project backend. This feature allows users to:
- Create comments on posts
- Reply to comments (1-level nesting)
- Update and delete their own comments
- View all comments with nested replies

---

## Changes Made

### 1. Database Schema Updates

**File:** `src/database/migrate.js`

Added two new tables:

#### Posts Table
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

#### Comments Table
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

**Key Features:**
- Self-referencing relationship via `parent_comment_id` for replies
- 500-character limit enforced at database level
- Cascade delete for data integrity
- Proper indexing for performance

**Modified Users Table:**
- Added `profile_picture` field for displaying author info

---

### 2. Authentication Middleware

**New File:** `src/middleware/authMiddleware.js`

Implemented JWT-based authentication:
- `authenticateToken()` - Requires valid JWT token
- `optionalAuth()` - Allows optional authentication
- Token validation and expiry checking
- User info attachment to request object

---

### 3. Data Models

#### Post Model
**New File:** `src/models/Post.js`

Methods:
- `create()` - Create a new post
- `findById()` - Get post with author info
- `findAll()` - List posts with pagination
- `update()` - Update post
- `delete()` - Delete post
- `exists()` - Check if post exists

#### Comment Model
**New File:** `src/models/Comment.js`

Methods:
- `create()` - Create comment or reply
- `findById()` - Get comment with user and parent info
- `findByPostId()` - Get all comments for a post with nested replies
- `update()` - Update comment (with ownership check)
- `delete()` - Delete comment (with ownership check)
- `exists()` - Check if comment exists
- `getCountByPostId()` - Get comment count

**Key Features:**
- Automatic nesting of replies under parent comments
- Author information included (nickname, profile_picture)
- Parent author nickname for reply context
- Ownership validation for update/delete operations

---

### 4. Controllers

**New File:** `src/controllers/commentController.js`

Endpoints implemented:
1. `createComment()` - POST /api/posts/:postId/comments
2. `getComments()` - GET /api/posts/:postId/comments
3. `updateComment()` - PATCH /api/comments/:commentId
4. `deleteComment()` - DELETE /api/comments/:commentId

**Validation:**
- Content length (1-500 characters)
- Parent comment validation
- Nesting level restriction (max 1 level)
- Post existence check
- User authorization

---

### 5. Routes

**New File:** `src/routes/commentRoutes.js`

Routes:
```
POST   /api/posts/:postId/comments      # Create comment/reply (auth required)
GET    /api/posts/:postId/comments      # Get comments (public)
PATCH  /api/comments/:commentId         # Update comment (auth required)
DELETE /api/comments/:commentId         # Delete comment (auth required)
```

---

### 6. Server Configuration

**Modified File:** `src/server.js`

Changes:
- Added comment routes to Express app
- Integrated new routes with existing authentication routes

---

### 7. Dependencies

**Modified File:** `package.json`

Added:
- `jsonwebtoken: ^9.0.2` - For JWT authentication

---

### 8. Documentation

#### API Documentation
**Modified File:** `API_DOCUMENTATION.md`
- Added comment endpoints section
- Updated overview to include comments feature
- Added reference to detailed comments API doc

**New File:** `COMMENTS_API.md`
- Comprehensive comment API documentation
- Request/response examples
- Business rules and constraints
- Frontend integration guide
- Error handling guide

#### README
**Modified File:** `README.md`
- Added comments feature to main features list
- Added comment endpoints to API list
- Added comment usage examples
- Added frontend integration guidelines
- Updated project structure
- Added database schema for new tables

---

## API Endpoints Summary

### Create Comment/Reply
```
POST /api/posts/:postId/comments
Authorization: Bearer <token>
Body: { content: string, parentCommentId?: number }
```

### Get Comments
```
GET /api/posts/:postId/comments
Response: Nested comment structure, sorted oldest-first
```

### Update Comment
```
PATCH /api/comments/:commentId
Authorization: Bearer <token>
Body: { content: string }
```

### Delete Comment
```
DELETE /api/comments/:commentId
Authorization: Bearer <token>
```

---

## Business Rules Implemented

1. **Character Limit**: 500 characters max per comment
2. **Nesting Limit**: 1 level only (MVP)
   - ✅ Posts → Comments
   - ✅ Comments → Replies
   - ❌ Replies → Sub-replies
3. **Authorization**: Users can only modify their own comments
4. **Sorting**: Comments sorted oldest-first
5. **Cascade Delete**: Deleting parent deletes all replies
6. **Authentication**: 
   - Required: Create, update, delete
   - Not required: Read comments

---

## Database Migrations Required

**Action Required:**
```bash
npm run migrate
```

This will create:
- `posts` table
- `comments` table with self-referencing relationship
- Update `users` table with `profile_picture` column
- Create necessary indexes

---

## Testing

### Manual Testing Commands

**1. Create a comment:**
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"Great post!"}'
```

**2. Create a reply:**
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"@user Thanks!", "parentCommentId":1}'
```

**3. Get comments:**
```bash
curl http://localhost:3000/api/posts/1/comments
```

**4. Update comment:**
```bash
curl -X PATCH http://localhost:3000/api/comments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"Updated content"}'
```

**5. Delete comment:**
```bash
curl -X DELETE http://localhost:3000/api/comments/1 \
  -H "Authorization: Bearer <token>"
```

---

## Frontend Integration Notes

### Required Changes in test-web Repository

1. **Comment List Component**
   - Display comments with author info (nickname, profile picture)
   - Show timestamp in relative format
   - Indent replies visually
   - Show "Reply" link for each comment
   - Show "..." menu for own comments (Edit, Delete)

2. **Comment Input Form**
   - 500-character limit with real-time counter
   - Submit without page refresh
   - Show validation errors

3. **Reply Input Form**
   - Pre-fill with @username mention
   - Same character limit and counter
   - Visual indentation

4. **API Integration**
   - Store JWT token after login
   - Include token in Authorization header
   - Implement optimistic UI updates
   - Handle API errors gracefully

### Example Frontend Code

**API Service:**
```javascript
// comments.service.js
const API_BASE = 'http://localhost:3000/api';

export const commentService = {
  async getComments(postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
    return response.json();
  },
  
  async createComment(postId, content, parentCommentId = null) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, parentCommentId })
    });
    return response.json();
  },
  
  async updateComment(commentId, content) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    return response.json();
  },
  
  async deleteComment(commentId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};
```

**Character Counter Component:**
```javascript
function CharacterCounter({ content, maxLength = 500 }) {
  const remaining = maxLength - content.length;
  const isOverLimit = remaining < 0;
  
  return (
    <div className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
      {content.length}/{maxLength}
    </div>
  );
}
```

**Time Formatter:**
```javascript
function formatTimestamp(timestamp) {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - commentTime) / 60000);
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  } else {
    return commentTime.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  }
}
```

---

## Known Limitations (MVP)

1. **Nesting Depth**: Limited to 1 level (no sub-replies)
2. **No Edit History**: Comment edits don't maintain history
3. **No Soft Delete**: Comments are permanently deleted
4. **No Pagination**: All comments loaded at once
5. **No Real-time Updates**: Requires page refresh to see others' comments
6. **No Reactions**: No like/dislike functionality yet

---

## Future Enhancements (Post-MVP)

1. Support deeper nesting (2-3 levels)
2. Pagination for comments
3. Real-time updates via WebSockets
4. Comment reactions (like, dislike)
5. Comment reporting
6. Comment edit history
7. Soft delete with restoration
8. Rich text formatting
9. Image/file attachments
10. Notification system

---

## Security Considerations

1. **SQL Injection**: Protected via parameterized queries
2. **XSS**: Frontend should sanitize HTML in comments
3. **CSRF**: JWT token-based auth (stateless)
4. **Rate Limiting**: Should be added to comment endpoints
5. **Authorization**: Only comment authors can modify their comments
6. **Data Validation**: Both client and server-side validation

---

## Performance Considerations

1. **Indexes**: Created on frequently queried columns
   - `comments.post_id`
   - `comments.user_id`
   - `comments.parent_comment_id`
2. **Cascade Delete**: Automatic cleanup of orphaned replies
3. **Optimized Queries**: Single query to fetch comments with user info
4. **Future**: Consider pagination for posts with many comments

---

## Deployment Checklist

- [ ] Run database migration
- [ ] Set JWT_SECRET environment variable
- [ ] Test all endpoints
- [ ] Update CORS settings for production frontend
- [ ] Add rate limiting to comment endpoints
- [ ] Monitor database performance
- [ ] Set up error tracking (e.g., Sentry)

---

## Files Modified/Created

### New Files (8)
1. `src/middleware/authMiddleware.js` - JWT authentication
2. `src/models/Post.js` - Post model
3. `src/models/Comment.js` - Comment model with replies
4. `src/controllers/commentController.js` - Comment controller
5. `src/routes/commentRoutes.js` - Comment routes
6. `COMMENTS_API.md` - Detailed API documentation
7. `IMPLEMENTATION_SUMMARY.md` - This file

### Modified Files (5)
1. `package.json` - Added jsonwebtoken dependency
2. `src/database/migrate.js` - Added posts and comments tables
3. `src/server.js` - Integrated comment routes
4. `API_DOCUMENTATION.md` - Updated with comments section
5. `README.md` - Updated with comments feature

---

## Acceptance Criteria Met

✅ Comment entity created with relationships to User and Post  
✅ Self-referencing relationship for replies (parent/child)  
✅ Content field with 500-character limit  
✅ POST /posts/:postId/comments endpoint (with optional parentCommentId)  
✅ GET /posts/:postId/comments endpoint (oldest-first, nested replies)  
✅ PATCH /comments/:commentId endpoint (author-only)  
✅ DELETE /comments/:commentId endpoint (author-only)  
✅ Authentication required for create/update/delete  
✅ Author info included (nickname, profile picture)  
✅ 1-level nesting enforced (MVP)  
✅ Comprehensive documentation  

---

## Next Steps

1. **Backend Deployment**
   - Deploy to Railway
   - Run database migration
   - Set environment variables

2. **Frontend Implementation** (test-web repository)
   - Implement comment list component
   - Implement comment input form
   - Implement reply functionality
   - Add edit/delete functionality
   - Style with indentation for replies

3. **Testing**
   - End-to-end testing
   - Load testing for comment pagination
   - Security testing

4. **Monitoring**
   - Set up error tracking
   - Monitor API performance
   - Track comment creation metrics

---

## Contact & Support

For questions or issues related to this implementation, please contact the project team through Eposo.

---

**Implementation Status:** ✅ Complete  
**Documentation:** ✅ Complete  
**Testing:** ⏳ Pending  
**Deployment:** ⏳ Pending  
**Frontend Integration:** ⏳ Pending
