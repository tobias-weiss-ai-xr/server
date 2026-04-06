# word-office OpenCloud - Integration Notes

**Created:** 2026-03-31
**Project:** Cloud storage platform with Document Server integration

## Project Overview

word-office OpenCloud is a Node.js/Express application that provides:
- Cloud storage with file upload/download/list/delete
- Session-based user authentication
- Document editing integration with Document Server via JWT
- Clean EJS templating for UI
- Static asset serving for CSS/JS

## Architecture Decisions

### Express.js as Backend Framework
**Rationale:** Lightweight, well-documented, excellent middleware ecosystem. Matches the pattern used in `document-server-integration` Node.js example.

### JWT for Document Server Integration
**Rationale:** Following the authentication pattern from the reference implementation. JWT tokens secure communication between the cloud platform and Document Server editor.

### In-Memory File Metadata
**Rationale:** Simple implementation for MVP. Uses `Map` for file metadata storage. Should be replaced with database (PostgreSQL/MongoDB) in production.

### Multer for File Uploads
**Rationale:** Standard middleware for handling `multipart/form-data`. Configured with 50MB file size limit and UUID-based filenames to prevent conflicts.

### EJS as Template Engine
**Rationale:** Simple, embedded JavaScript templates. Matches the pattern from the reference Node.js example which uses EJS.

## Document Server Integration Patterns

### JWT Token Structure
Based on the reference implementation (`document-server-integration/web/documentserver-example/nodejs/app.js`):

```javascript
const token = jwt.sign({
  document: {
    key: fileId,
    title: fileName,
    url: downloadUrl,
    permissions: {...}
  },
  editorConfig: {
    callbackUrl: '/files/track',
    mode: 'edit'
  }
}, JWT_SECRET, { expiresIn: '1h' });
```

### Key Endpoints Required
- `/files/config` - Returns file configuration with JWT token
- `/files/track` - Receives save callbacks from Document Server
- `/files/download/:id` - Serves file content to editor
- `/files/editor/:id` - Embeds editor in iframe

### Editor Embedding
The editor is embedded via iframe with postMessage communication:
```html
<iframe src="${DOCUMENT_SERVER_URL}/editor.html?fileId=${fileId}" />
```

## File Structure Decisions

```
word-office-opencloud/
├── app.js                 # Entry point, middleware setup
├── controllers/           # Business logic layer
│   └── files.js          # File operations (CRUD)
├── routes/               # HTTP route definitions
│   ├── files.js          # File endpoints
│   └── auth.js           # Authentication endpoints
├── views/                # EJS templates
│   ├── layout.ejs        # Base template with nav/footer
│   ├── index.ejs         # Landing page
│   ├── auth/login.ejs    # Login form
│   └── files/
│       ├── list.ejs      # File grid view
│       └── editor.ejs    # Document editor iframe
├── public/               # Static assets
│   ├── css/style.css     # Responsive CSS
│   └── js/main.js        # Client-side interactions
└── uploads/              # File storage
```

## Security Considerations

### Current Implementation (Demo)
- Mock authentication (any credentials work)
- No file ownership validation
- In-memory metadata storage
- Development session config (`secure: false`)

### Production Requirements
1. **Real authentication** - Database with password hashing (bcrypt)
2. **File authorization** - Verify user owns file before operations
3. **Secure sessions** - HTTPS cookies, CSRF protection
4. **Rate limiting** - Prevent abuse on upload/download endpoints
5. **File validation** - Strict MIME type checking
6. **JWT secrets** - 256+ bit random secrets from environment

## Dependencies Chosen

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| express-session | ^1.17.3 | Session management |
| multer | ^1.4.5-lts.1 | File upload handling |
| uuid | ^9.0.0 | Unique file naming |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| axios | ^1.6.0 | HTTP client for Document Server calls |

## Lessons Learned

### From Reference Implementation
1. **DocManager pattern** - The reference uses a `DocManager` class to handle file paths, storage, and JWT generation. Consider extracting similar abstraction.

2. **Callback URL structure** - Document Server calls `/track` endpoint with file status updates. Need to implement this for autosave.

3. **File key generation** - Use combination of filename + timestamp for unique document keys.

4. **Error handling** - Always wrap file operations in try-catch and return appropriate HTTP status codes.

### Design Patterns Used
1. **MVC structure** - Separation of routes, controllers, and views
2. **Middleware chain** - Express middleware for session, JSON parsing, static files
3. **Async/await** - Modern async patterns for file operations
4. **Environment config** - Configuration via environment variables

## Next Steps

1. Implement `/files/track` endpoint for Document Server callbacks
2. Add `/files/config` endpoint for JWT token generation
3. Replace in-memory metadata with database
4. Implement real authentication with password hashing
5. Add file versioning support
6. Implement user management (register, profile)
7. Add search functionality
8. Implement sharing links for files

## References

- Document Server example: `../document-server-integration/web/documentserver-example/nodejs/app.js`
- Document Server API: `../document-server-integration/web/`
- Word Office Docs: https://api.Word Office.com/
