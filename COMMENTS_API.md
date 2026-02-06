# Comments and Replies API Documentation

## Overview
This API provides endpoints for managing comments and replies on posts. Users can create, read, update, and delete comments. The MVP version supports one level of nesting (comments and direct replies only).

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create Comment or Reply
Create a new comment on a post or reply to an existing comment.

**Endpoint:** `POST /api/posts/:postId/comments`

**Authentication:** Required

**URL Parameters:**
- `postId` (number, required) - The ID of the post

**Request Body:**
```json
{
  "content": "This is my comment",
  "parentCommentId": 123  // Optional: ID of parent comment for replies
}
```

**Validation:**
- `content`: Required, max 500 characters
- `parentCommentId`: Optional, must be a valid comment ID from the same post
- MVP limitation: Cannot reply to replies (only 1 level of nesting)

**Success Response (201 Created):**
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
    "updated_at": "2026-02-03T12:34:56.789Z",
    "nickname": "john_doe",
    "profile_picture": "https://example.com/profile.jpg",
    "parent_author_nickname": "jane_doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or attempting to reply to a reply
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Post or parent comment not found

---

### 2. Get Comments for a Post
Retrieve all comments for a specific post, with replies nested under their parent comments.

**Endpoint:** `GET /api/posts/:postId/comments`

**Authentication:** Not required

**URL Parameters:**
- `postId` (number, required) - The ID of the post

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "post_id": 1,
        "user_id": 10,
        "parent_comment_id": null,
        "content": "Great post!",
        "created_at": "2026-02-03T10:00:00.000Z",
        "updated_at": "2026-02-03T10:00:00.000Z",
        "nickname": "john_doe",
        "profile_picture": "https://example.com/john.jpg",
        "parent_author_nickname": null,
        "replies": [
          {
            "id": 2,
            "post_id": 1,
            "user_id": 11,
            "parent_comment_id": 1,
            "content": "@john_doe Thanks!",
            "created_at": "2026-02-03T10:05:00.000Z",
            "updated_at": "2026-02-03T10:05:00.000Z",
            "nickname": "jane_doe",
            "profile_picture": "https://example.com/jane.jpg",
            "parent_author_nickname": "john_doe"
          }
        ]
      },
      {
        "id": 3,
        "post_id": 1,
        "user_id": 12,
        "parent_comment_id": null,
        "content": "I agree with this.",
        "created_at": "2026-02-03T11:00:00.000Z",
        "updated_at": "2026-02-03T11:00:00.000Z",
        "nickname": "bob_smith",
        "profile_picture": null,
        "parent_author_nickname": null,
        "replies": []
      }
    ],
    "total": 3
  }
}
```

**Notes:**
- Comments are sorted oldest-first (ascending by `created_at`)
- Replies are nested under their parent comments
- `replies` array is included in parent comments only
- `total` includes both parent comments and all replies

**Error Responses:**
- `404 Not Found` - Post not found

---

### 3. Update Comment
Update the content of an existing comment. Users can only update their own comments.

**Endpoint:** `PATCH /api/comments/:commentId`

**Authentication:** Required

**URL Parameters:**
- `commentId` (number, required) - The ID of the comment to update

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Validation:**
- `content`: Required, max 500 characters
- User must be the author of the comment

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "댓글이 수정되었습니다.",
  "data": {
    "id": 456,
    "post_id": 1,
    "user_id": 10,
    "parent_comment_id": null,
    "content": "Updated comment content",
    "created_at": "2026-02-03T12:34:56.789Z",
    "updated_at": "2026-02-03T13:00:00.000Z",
    "nickname": "john_doe",
    "profile_picture": "https://example.com/profile.jpg",
    "parent_author_nickname": null
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid content
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Attempting to update someone else's comment
- `404 Not Found` - Comment not found

---

### 4. Delete Comment
Delete an existing comment. Users can only delete their own comments. Deleting a parent comment will also delete all its replies (cascade delete).

**Endpoint:** `DELETE /api/comments/:commentId`

**Authentication:** Required

**URL Parameters:**
- `commentId` (number, required) - The ID of the comment to delete

**Validation:**
- User must be the author of the comment

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다."
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Attempting to delete someone else's comment
- `404 Not Found` - Comment not found

---

## Data Models

### Comment Object
```typescript
{
  id: number;                      // Unique comment ID
  post_id: number;                 // ID of the post this comment belongs to
  user_id: number;                 // ID of the user who created the comment
  parent_comment_id: number | null; // ID of parent comment (null for top-level comments)
  content: string;                 // Comment content (max 500 characters)
  created_at: string;              // ISO 8601 timestamp
  updated_at: string;              // ISO 8601 timestamp
  nickname: string;                // Author's nickname
  profile_picture: string | null;  // Author's profile picture URL
  parent_author_nickname: string | null; // Nickname of parent comment author (for replies)
  replies?: Comment[];             // Array of reply comments (only in parent comments)
}
```

## Business Rules

1. **Character Limit:** Comments are limited to 500 characters
2. **Nesting Limit (MVP):** Only one level of nesting is allowed (comments → replies)
   - Users can comment on posts
   - Users can reply to comments
   - Users CANNOT reply to replies
3. **Authorization:** Users can only update or delete their own comments
4. **Cascade Delete:** Deleting a parent comment will delete all its replies
5. **Sorting:** Comments are sorted oldest-first to maintain conversation flow
6. **Authentication:** Creating, updating, and deleting comments requires authentication
7. **Reading Comments:** Anyone can read comments (no authentication required)

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or token invalid |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Example Usage

### Creating a Comment
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content": "Great post!"}'
```

### Creating a Reply
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content": "@john_doe Thanks for sharing!", "parentCommentId": 123}'
```

### Getting Comments
```bash
curl http://localhost:3000/api/posts/1/comments
```

### Updating a Comment
```bash
curl -X PATCH http://localhost:3000/api/comments/456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content": "Updated content"}'
```

### Deleting a Comment
```bash
curl -X DELETE http://localhost:3000/api/comments/456 \
  -H "Authorization: Bearer <your-token>"
```

## Frontend Integration Notes

### Real-time Character Counter
The frontend should implement a real-time character counter:
```javascript
const maxLength = 500;
const remaining = maxLength - content.length;
// Display: `${remaining}/500`
```

### Reply Input with @mention
When replying, pre-fill the input with:
```javascript
const replyContent = `@${parentComment.nickname} `;
```

### Visual Indentation
Replies should be visually indented in the UI:
```css
.comment-reply {
  margin-left: 2rem; /* or padding-left */
  border-left: 2px solid #e0e0e0;
}
```

### Optimistic UI Updates
For better UX, implement optimistic updates:
1. Add comment to UI immediately
2. Send API request
3. Update with server response (including ID, timestamps)
4. Handle errors by removing/reverting the optimistic update

### Time Display
Format timestamps using relative time:
- Within 1 hour: "X분 전"
- Within 24 hours: "X시간 전"
- Older: "YYYY.MM.DD"
