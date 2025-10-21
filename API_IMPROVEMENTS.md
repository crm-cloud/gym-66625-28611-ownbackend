# API Architecture & Authentication Improvements

## ✅ Implemented Features

### 1. API Architecture Enhancements

#### 1.1 Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes (login, register)
- **Password reset**: 3 requests per hour
- **Public API**: 50 requests per 15 minutes
- **Admin endpoints**: 200 requests per 15 minutes

**Files Created:**
- `backend/src/middleware/rateLimiter.ts`

**Usage:**
```typescript
import { authLimiter, passwordResetLimiter } from './middleware/rateLimiter';
router.post('/login', authLimiter, authController.login);
```

#### 1.2 Request/Response Transformation
- Standardized API response format with metadata
- Automatic response wrapping
- Request sanitization
- Pagination helper

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "v1",
    "requestId": "xxx"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Files Created:**
- `backend/src/middleware/transformer.ts`

#### 1.3 API Versioning
- All routes now versioned under `/api/v1/`
- Legacy routes maintained for backwards compatibility
- Future versions can be added under `/api/v2/`, etc.

**Endpoints:**
- New: `http://localhost:3001/api/v1/auth/login`
- Legacy: `http://localhost:3001/api/auth/login` (still works)

#### 1.4 OpenAPI/Swagger Documentation
- Interactive API documentation
- Complete endpoint descriptions
- Request/response schemas
- Authentication testing interface

**Access:**
- Documentation: `http://localhost:3001/api/docs`

**Files Created:**
- `backend/src/config/swagger.ts`

---

### 2. Authentication & Authorization Enhancements

#### 2.1 Refresh Token Rotation
- Old refresh tokens automatically invalidated
- New tokens issued on each refresh
- Replay attack detection
- Token family tracking
- Automatic cleanup of expired tokens

**Features:**
- Detects token reuse (possible replay attacks)
- Revokes all user tokens on security breach
- Tracks token lineage via parent token
- Session management per user

**Files Created:**
- `backend/src/services/token-rotation.service.ts`

**Updated:**
- `backend/src/utils/jwt.ts` - Added token ID generation

**API Endpoint:**
```
POST /api/v1/auth/refresh
Body: { refresh_token: "..." }
Response: { access_token: "...", refresh_token: "..." }
```

#### 2.2 OAuth2.0 Social Login (Google)
- Google OAuth integration
- Automatic user creation/linking
- Account linking for existing users
- Secure token exchange

**Setup:**
1. Create Google OAuth app
2. Set environment variables:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/oauth/google/callback
   ```

**Files Created:**
- `backend/src/controllers/oauth.controller.ts`
- `backend/src/routes/oauth.routes.ts`
- `backend/src/config/passport.ts`

**Endpoints:**
- `GET /api/v1/oauth/google` - Initiate Google login
- `GET /api/v1/oauth/google/callback` - OAuth callback
- `POST /api/v1/oauth/link` - Link OAuth to existing account
- `POST /api/v1/oauth/unlink` - Unlink OAuth account

**Frontend Flow:**
```typescript
// Redirect user to Google login
window.location.href = 'http://localhost:3001/api/v1/oauth/google';

// After OAuth, user redirected to:
// http://localhost:5173/auth/callback?access_token=xxx&refresh_token=xxx
```

#### 2.3 IP Whitelisting for Admin Endpoints
- Configurable IP whitelist
- Automatic localhost allow in development
- Stricter enforcement for super_admin operations
- IP logging for security audits

**Configuration:**
```env
ENABLE_IP_WHITELIST=true
ADMIN_WHITELIST_IPS=192.168.1.100,10.0.0.50
```

**Files Created:**
- `backend/src/middleware/ipWhitelist.ts`

**Usage:**
```typescript
import { adminIpWhitelist } from './middleware/ipWhitelist';
router.use('/admin', adminIpWhitelist, adminRoutes);
```

**Protected Routes:**
- `/api/v1/roles/*` - Role management
- `/api/v1/user-management/*` - User administration

#### 2.4 Multi-Factor Authentication (MFA)
- TOTP-based authentication (Google Authenticator, Authy compatible)
- QR code generation for easy setup
- Backup codes (10 codes per user)
- MFA verification during login
- Enable/disable MFA with verification

**Files Created:**
- `backend/src/services/mfa.service.ts`
- `backend/src/controllers/mfa.controller.ts`
- `backend/src/routes/mfa.routes.ts`

**MFA Flow:**

1. **Setup MFA:**
```
POST /api/v1/mfa/setup
Headers: { Authorization: "Bearer <access_token>" }
Response: {
  secret: "BASE32_SECRET",
  qrCode: "data:image/png;base64,..."
}
```

2. **Enable MFA:**
```
POST /api/v1/mfa/enable
Headers: { Authorization: "Bearer <access_token>" }
Body: { token: "123456" }
Response: {
  message: "MFA enabled successfully",
  backupCodes: ["CODE1", "CODE2", ...]
}
```

3. **Login with MFA:**
```
// Step 1: Regular login
POST /api/v1/auth/login
Body: { email, password }
Response: { requiresMFA: true, userId: "..." }

// Step 2: Verify MFA
POST /api/v1/mfa/verify
Body: { userId: "...", token: "123456" }
Response: { access_token, refresh_token }
```

4. **Backup Code Login:**
```
POST /api/v1/mfa/verify-backup
Body: { userId: "...", code: "BACKUP_CODE" }
```

5. **Disable MFA:**
```
POST /api/v1/mfa/disable
Headers: { Authorization: "Bearer <access_token>" }
Body: { token: "123456" }
```

6. **Get MFA Status:**
```
GET /api/v1/mfa/status
Headers: { Authorization: "Bearer <access_token>" }
Response: { enabled: true/false }
```

7. **Generate New Backup Codes:**
```
POST /api/v1/mfa/backup-codes
Headers: { Authorization: "Bearer <access_token>" }
Response: { backupCodes: [...] }
```

---

## 🗄️ Database Schema Updates

Add the following fields to your `users` table:

```sql
ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN mfa_backup_codes TEXT[];
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_provider_id VARCHAR(255);

-- For refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  parent_token TEXT, -- For token rotation tracking
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

---

## 📦 Dependencies Added

```json
{
  "express-rate-limit": "Rate limiting",
  "swagger-ui-express": "API documentation",
  "@types/swagger-ui-express": "TypeScript types",
  "speakeasy": "TOTP for MFA",
  "@types/speakeasy": "TypeScript types",
  "qrcode": "QR code generation",
  "@types/qrcode": "TypeScript types",
  "passport": "OAuth authentication",
  "passport-google-oauth20": "Google OAuth strategy",
  "@types/passport-google-oauth20": "TypeScript types"
}
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Update Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Enable features
ENABLE_IP_WHITELIST=false  # Set to true in production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Run Database Migrations
```bash
npm run prisma:migrate
```

### 4. Start Server
```bash
npm run dev
```

### 5. Access API Documentation
Open: `http://localhost:3001/api/docs`

---

## 🔒 Security Best Practices

1. **Production Checklist:**
   - [ ] Set strong `JWT_SECRET`
   - [ ] Enable `ENABLE_IP_WHITELIST=true`
   - [ ] Configure `ADMIN_WHITELIST_IPS`
   - [ ] Use HTTPS only
   - [ ] Set secure CORS origins
   - [ ] Enable rate limiting
   - [ ] Monitor failed login attempts

2. **MFA Recommendations:**
   - Enforce MFA for admin users
   - Store backup codes securely
   - Implement account recovery flow
   - Log MFA events

3. **Token Security:**
   - Short access token expiry (15m)
   - Longer refresh token expiry (7d)
   - Automatic token rotation
   - Revoke tokens on logout
   - Clean up expired tokens regularly

---

## 📊 API Routes Summary

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user (rate limited: 5/15min)
- `POST /login` - Login (rate limited: 5/15min)
- `POST /refresh` - Refresh tokens (token rotation)
- `POST /logout` - Logout and revoke tokens
- `GET /me` - Get current user

### MFA (`/api/v1/mfa`)
- `POST /setup` - Generate MFA secret
- `POST /enable` - Enable MFA
- `POST /disable` - Disable MFA
- `POST /verify` - Verify MFA token
- `POST /verify-backup` - Verify backup code
- `POST /backup-codes` - Generate new backup codes
- `GET /status` - Get MFA status

### OAuth (`/api/v1/oauth`)
- `GET /google` - Initiate Google login
- `GET /google/callback` - OAuth callback
- `POST /link` - Link OAuth account
- `POST /unlink` - Unlink OAuth account

---

## 🧪 Testing

### Test Rate Limiting
```bash
# Should be blocked after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Test MFA Flow
```bash
# 1. Setup MFA
curl -X POST http://localhost:3001/api/v1/mfa/setup \
  -H "Authorization: Bearer <token>"

# 2. Enable with TOTP
curl -X POST http://localhost:3001/api/v1/mfa/enable \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456"}'
```

### Test Token Rotation
```bash
# First refresh (works)
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<old_token>"}'

# Second refresh with same token (should fail)
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<old_token>"}'
```

---

## 📝 Migration Notes

### Frontend Changes Required

1. **Update API base URL to v1:**
```typescript
// src/lib/axios.ts
const API_BASE_URL = '/api/v1'; // Changed from '/api'
```

2. **Handle new response format:**
```typescript
// All responses now wrapped
const response = await api.get('/users');
const users = response.data.data; // Note: .data.data
```

3. **Implement MFA flow:**
```typescript
// Check if MFA required after login
if (loginResponse.data.requiresMFA) {
  // Show MFA input
  const token = await getMFATokenFromUser();
  const finalResponse = await api.post('/mfa/verify', {
    userId: loginResponse.data.userId,
    token
  });
}
```

4. **OAuth integration:**
```typescript
// Google login button
<button onClick={() => {
  window.location.href = '/api/v1/oauth/google';
}}>
  Login with Google
</button>

// Handle OAuth callback
// Route: /auth/callback
const params = new URLSearchParams(window.location.search);
const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');
```

---

## 🎯 Next Steps

1. **Frontend Integration:**
   - Update API client to use v1 endpoints
   - Implement MFA UI components
   - Add OAuth login buttons
   - Handle new response format

2. **Additional OAuth Providers:**
   - Facebook
   - GitHub
   - Microsoft
   - Apple

3. **Enhanced Security:**
   - Implement account lockout
   - Add CAPTCHA for repeated failed logins
   - Email notifications for security events
   - Device fingerprinting

4. **Monitoring:**
   - Set up API analytics
   - Monitor rate limit hits
   - Track MFA adoption
   - Log security events

---

## 📚 Resources

- [Express Rate Limit Docs](https://github.com/express-rate-limit/express-rate-limit)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
