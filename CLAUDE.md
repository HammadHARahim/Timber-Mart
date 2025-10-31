# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timber Mart CRM is an offline-first business management system for a timber/lumber business. The system handles customers, orders, projects, payments, checks, tokens (delivery tracking), and print templates with QR code generation. Built with Express/PostgreSQL backend and React/Vite frontend with Material UI migration in progress.

**Key Feature**: Offline-first architecture using IndexedDB for local storage with automatic sync to PostgreSQL when online.

## Development Commands

### Backend (Express/PostgreSQL)
```bash
cd backend
npm run dev              # Start with nodemon (auto-reload)
npm start                # Production start
npm test                 # Run Jest tests
npm run migrate          # Run database migrations
npm run seed             # Seed initial data
```

### Frontend (React/Vite)
```bash
cd frontend
npm run dev              # Start dev server (default: http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
```

### Full Stack Development
```bash
# From project root
./start-dev.sh           # Start both backend and frontend in dev mode
./start.sh               # Start production mode
./stop.sh                # Stop all services
./status.sh              # Check service status
```

### Database
```bash
# Connect to PostgreSQL
PGPASSWORD=root psql -U hammadharahim -d timber_mart_dev -h localhost

# Common queries
\dt                      # List all tables
\d+ table_name          # Describe table structure
```

## Architecture

### Backend Structure
```
backend/
├── server.js              # Main entry point, Express setup, inline auth endpoints
├── config/
│   ├── database.js        # Sequelize PostgreSQL connection
│   ├── env.js            # Environment config loader
│   └── logger.js         # Winston logging configuration
├── models/               # Sequelize models with associations
│   ├── associations.js   # Central association definitions (MUST be loaded)
│   ├── User.js          # Users with role-based permissions
│   ├── Customer.js      # Customer records
│   ├── Order.js         # Orders with status tracking
│   ├── OrderItem.js     # Order line items
│   ├── Item.js          # Product catalog
│   ├── Project.js       # Projects linked to customers
│   ├── Payment.js       # Payment records (loans, advances, deposits)
│   ├── Check.js         # Check tracking (pending/cleared/bounced)
│   ├── Token.js         # Delivery tokens with QR codes
│   ├── PrintTemplate.js # Custom print templates (HTML/CSS)
│   └── PrintSettings.js # User print preferences
├── routes/              # Express route handlers
│   ├── auth.js          # Login, token refresh, user management
│   ├── customers.js     # Customer CRUD
│   ├── orders.js        # Order management
│   ├── items.js         # Product catalog
│   ├── payments.js      # Payment processing
│   ├── checks.js        # Check tracking
│   ├── projects.js      # Project management
│   ├── tokens.js        # Token generation
│   ├── printTemplates.js # Template management
│   ├── print.js         # Print operations
│   └── sync.js          # Offline sync endpoints
├── middleware/
│   ├── auth.js          # JWT authentication & authorize() function
│   ├── errorHandler.js  # Global error handling
│   └── requestLogger.js # HTTP request logging
├── services/            # Business logic layer
└── utils/
    └── seedData.js      # Database seeding utilities
```

### Frontend Structure
```
frontend/
├── src/
│   ├── main.jsx         # React entry point with MUI theme
│   ├── App.jsx          # Router setup with protected routes
│   ├── utils/
│   │   └── apiClient.js # Centralized API client with error handling
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx        # JWT auth, permissions
│   │   ├── OfflineContext.jsx     # Online/offline detection
│   │   ├── SyncContext.jsx        # Sync state management
│   │   └── NotificationContext.jsx # Toast notifications
│   ├── pages/           # Page components
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CustomersPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── ChecksPage.jsx
│   │   ├── ProjectsPage.jsx
│   │   ├── TokensPage.jsx
│   │   ├── TemplatesPage.jsx
│   │   ├── PrintSettingsPage.jsx
│   │   └── UsersPage.jsx
│   ├── components/
│   │   ├── shared/      # Reusable components
│   │   │   ├── MainLayout.jsx    # Sidebar navigation
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SyncStatus.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── features/    # Feature-specific components
│   │   │   ├── CustomerList.jsx, CustomerForm.jsx
│   │   │   ├── OrderList.jsx, OrderForm.jsx
│   │   │   └── UserList.jsx, UserForm.jsx
│   │   ├── payments/, checks/, projects/, tokens/, templates/
│   │   └── print/       # Print preview and settings
│   ├── services/        # API and database services
│   │   ├── apiService.js       # HTTP client with auth headers
│   │   ├── databaseService.js  # IndexedDB operations
│   │   ├── syncService.js      # Sync logic
│   │   ├── customerService.js  # Customer API calls
│   │   ├── orderService.js     # Order API calls
│   │   ├── paymentService.js   # Payment API calls
│   │   └── [entity]Service.js  # Other entity services
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useDatabase.js
│   │   ├── useSync.js
│   │   └── use[Entity].js
│   ├── utils/
│   │   ├── validators.js  # Form validation
│   │   └── formatters.js  # Data formatting
│   └── theme/
│       └── muiTheme.js    # Material UI theme configuration
```

## Key Architectural Patterns

### 1. Offline-First Data Flow
```
User Action → IndexedDB (immediate) → Sync Queue → Background Sync → PostgreSQL
                     ↓
              Instant UI Update
```

- All data operations write to IndexedDB first for instant response
- Sync queue tracks pending changes with `sync_status` field
- Background sync service periodically syncs to server when online
- Each entity has client-side UUID + server-side ID after sync

### 2. Authentication & Authorization
- JWT tokens stored in `sessionStorage` (frontend)
- Token includes: `{ id, username, role, email, permissions, iat, exp }`
- Permissions array: `['*']` for admin, specific strings for others
- Backend middleware: `authenticateToken()` → `authorize([permissions])`
- Frontend: `hasPermission(permission)` from AuthContext

### 3. Model Associations (Critical)
Must call `setupAssociations()` in server.js before starting server. Key relationships:
- Customer → Orders, Projects, Payments, Tokens
- Order → Customer, Project, OrderItems, Payments
- Project → Customer, Orders, Payments, Checks
- Payment → Customer, Order, Project, Checks
- Token → Order, Customer, Project, PrintTemplate

### 4. Database Sync Strategy
- IndexedDB stores: `customers`, `orders`, `payments`, `items`, `order_items`, `projects`, `sync_queue`
- Each record has `sync_status`: `'pending'`, `'synced'`, `'conflict'`
- Sync endpoint: `POST /api/sync/push` and `POST /api/sync/pull`
- Conflict resolution: server timestamp wins (last-write-wins)

## Important Implementation Details

### Running Tests
```bash
# Backend tests (in backend/)
npm test                           # Run all tests
npm test -- --testPathPattern=auth # Run specific test file
npm test -- --detectOpenHandles    # Debug hanging tests
```

### Database Migrations
The project currently uses direct Sequelize model sync, not migration files. To update schema:
1. Modify the model in `backend/models/[Entity].js`
2. Use `sequelize.sync({ alter: true })` in development
3. In production, manually write SQL migrations

### Adding a New Entity
1. **Backend**:
   - Create model in `backend/models/[Entity].js`
   - Add associations in `backend/models/associations.js`
   - Create service in `backend/services/[entity]Service.js`
   - Create routes in `backend/routes/[entity].js`
   - Register routes in `server.js`

2. **Frontend**:
   - Add IndexedDB store in `databaseService.js`
   - Create service in `services/[entity]Service.js`
   - Create page in `pages/[Entity]Page.jsx`
   - Create List/Form components in `components/[entity]/`
   - Add route in `App.jsx`
   - Add navigation link in `MainLayout.jsx`

### Print Template System
- Templates stored as HTML strings with CSS in database
- Variables use `{{variable_name}}` syntax (e.g., `{{customer_name}}`)
- QR codes generated using `qrcode` npm package
- Available variables depend on context (token, invoice, receipt, voucher)
- Preview functionality uses iframe with sandboxed content

### Permission Strings
Standard format: `ENTITY_ACTION` (e.g., `CUSTOMER_VIEW`, `ORDER_CREATE`)
Common permissions:
- `*` - All permissions (admin)
- `[ENTITY]_VIEW`, `[ENTITY]_CREATE`, `[ENTITY]_EDIT`, `[ENTITY]_DELETE`
- Entities: CUSTOMER, ORDER, PAYMENT, CHECK, PROJECT, TOKEN, USER, REPORT

### Environment Variables
Backend requires (`.env` in `backend/`):
```
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timber_mart_dev
DB_USER=hammadharahim
DB_PASSWORD=root
JWT_SECRET=your-secret-key
LOG_LEVEL=info
LOG_SQL=false
```

Frontend requires (`.env` in `frontend/`):
```
VITE_API_URL=http://localhost:5001
```

## Common Workflows

### Starting Fresh Development Session
```bash
# 1. Ensure PostgreSQL is running
sudo systemctl status postgresql

# 2. Start development servers
./start-dev.sh

# 3. Check logs
tail -f backend/logs/combined.log  # Backend logs
# Frontend logs appear in terminal where start-dev.sh runs
```

### Debugging Sync Issues
1. Check browser IndexedDB: DevTools → Application → Storage → IndexedDB
2. Check sync queue: Look for records with `sync_status: 'pending'`
3. Check backend sync logs: `tail -f backend/logs/combined.log | grep sync`
4. Test sync endpoint manually:
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:5001/api/sync/push \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entities": {"customers": [...]}}'
```

### Seeding Test Data
The database is seeded on first run with:
- Admin user: `admin/admin123`
- Sample roles and permissions
- To reseed: drop database and restart server

## UI Migration Notes

**Material UI Migration in Progress**: The codebase is migrating from custom CSS to Material UI (MUI v7).
- New components should use MUI components (`@mui/material`)
- Theme defined in `frontend/src/theme/muiTheme.js`
- Use `material-react-table` for data tables
- Forms should use MUI `TextField`, `Select`, `Button`, etc.
- Legacy CSS modules (`.module.css`) are being phased out

## Authentication & Security

### JWT Tokens
- **Access Token**: 15 minutes expiry (short-lived)
- **Refresh Token**: 7 days expiry (long-lived, stored in database)

### Token Flow
1. Login → receive `accessToken` + `refreshToken`
2. Use `accessToken` for API requests
3. When expired → call `/api/auth/refresh` with `refreshToken`
4. Logout → `/api/auth/logout` clears refresh token

### Security Features
- ✅ Rate limiting (auth: 5/15min, API: 100/15min, sync: 20/5min)
- ✅ Input validation on all major routes
- ✅ Helmet security headers
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection via Sequelize
- ✅ Global API error handling with auto 401 redirect
- ✅ React Error Boundary for graceful error display

## Testing Checklist for New Features

When implementing new features, verify:
1. [ ] Offline functionality - works without internet
2. [ ] Sync - data syncs correctly when online
3. [ ] Permissions - respects user role permissions
4. [ ] Validation - client and server-side validation
5. [ ] Error handling - graceful error messages
6. [ ] Logging - appropriate log levels used
7. [ ] Associations - related entities properly linked
8. [ ] UI consistency - follows MUI design patterns
9. [ ] Rate limiting - doesn't block legitimate usage
10. [ ] Token refresh - handles expired tokens gracefully

## Known Issues & Limitations

- Migration files don't exist; using Sequelize sync
- Some pages still use legacy CSS instead of MUI
- Sync conflict resolution is basic (last-write-wins)
- No automated E2E tests yet
- Print preview may have CORS issues with external resources

## Helpful Resources

- [Sequelize Associations Docs](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [Material UI Components](https://mui.com/material-ui/getting-started/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
