## 15. IMPLEMENTATION ROADMAP (PHASED APPROACH)

**Current Status:** Phase 9 Completed (69.2% of total implementation)

**Phases Completed:** ✅ 1-9 (9 out of 13)
**Phases Remaining:** 🔲 10-13 (4 phases)

**Last Updated:** October 30, 2025

---

### Phase 1: Foundation & Authentication (Week 1-2)
- ✅ Backend Express server setup
- ✅ PostgreSQL database schema
- ✅ User model & authentication (Login, JWT, password hashing)
- ✅ User creation API (Admin only)
- ✅ Role & permission system (database + middleware)
- ✅ Frontend login page
- ✅ Context setup (Auth, Offline, Sync)
- ✅ JWT storage & refresh logic
- ✅ Protected routes & permission checks

**Deliverable**: Data syncs between local and cloud with conflict resolution

---

### Phase 4: Core Features - Customer Management (Week 4-5)
- ✅ Customer CRUD operations (Create, Read, Update, Delete)
- ✅ Customer form with validation
- ✅ Customer list with pagination
- ✅ Customer detail view
- ✅ Search customers by name, phone, email
- ✅ Customer balance tracking
- ✅ Payment history display
- ✅ Permission checks (CUSTOMER_VIEW, CUSTOMER_CREATE, etc.)

**Deliverable**: Full customer management system with offline support

---

### Phase 5: Core Features - Order Management (Week 5-6)
- ✅ Order creation with customer & project selection
- ✅ Add items to order (quantity, price)
- ✅ Order status tracking (pending, fulfilled)
- ✅ Update order details
- ✅ Delete orders (with permission checks)
- ✅ Filter orders by date, status, customer, product
- ✅ Generate unique order IDs (client-side)
- ✅ Calculate totals automatically

**Deliverable**: Orders can be created, managed, and filtered

---

### Phase 6: Printing & Tokens (Week 6-7)
- ✅ Print template management interface
- ✅ Custom template editor (HTML + CSS)
- ✅ QR code generation for tokens
- ✅ Token printing (with customer, project, vehicle details)
- ✅ Invoice printing (from templates)
- ✅ Receipt printing (thermal and normal printer support)
- ✅ Print settings (page size, orientation, margins)
- ✅ Live preview before printing
- ✅ User print preferences

**Deliverable**: Custom printable templates with full customization

---

### Phase 7: Payments & Checks (Week 7-8)
- ✅ Payment form (amount, type, method)
- ✅ Process payments (loans, advances, deposits)
- ✅ Payment voucher generation (with placeholder signatures)
- ✅ Amount in words conversion
- ✅ Check tracking system
- ✅ Mark checks as pending/cleared
- ✅ Check notifications for pending items
- ✅ Payment approval workflow (if needed)
- ✅ Update customer/project balance on payment

**Deliverable**: Complete payment and check management

**Implementation Summary**:
- Backend: Payment/Check models, services with approval workflows, balance auto-updates, 28 REST endpoints
- Frontend: PaymentsPage, ChecksPage with filters, status badges, CRUD forms using CSS modules
- Features: Payment types (loan/advance/deposit), multiple methods (cash/check/transfer), check status tracking (pending/cleared/bounced)
- Database: payments & checks tables with full relationships to customers/projects/orders
- Tested: Backend APIs verified, test payment & check created successfully

---

### Phase 8: Projects & Analytics (Week 8-9) ✅ COMPLETED
- ✅ Project CRUD operations
- ✅ Link orders to projects
- ✅ Project balance calculation
- ✅ Project status tracking
- ✅ View project details with linked orders
- ✅ Basic dashboard with key metrics
- ✅ Revenue reports by project
- ✅ Customer reports

**Deliverable**: Project management and basic analytics

**Implementation Summary**:
- **Backend:**
  - Project model with balance field
  - projectService with CRUD + statistics + revenue reporting
  - 9 REST endpoints including dashboard-stats and revenue-report
  - Customer aggregation for reports
- **Frontend:**
  - ProjectsPage with MaterialReactTable and filters/pagination
  - Material UI ProjectForm with validation
  - Dashboard with 4 metric cards (Customers, Orders, Payments, Projects)
  - **ReportsPage** with tabbed interface (NEW)
  - **RevenueReport** component with date filtering, summary cards, CSV export
  - **CustomerReport** component with type filtering, analytics, CSV export
- **Features:**
  - Project CRUD operations
  - Project-specific statistics (orders/payments/balance)
  - Revenue reports with date filtering and export
  - Customer reports with order/payment analytics
  - Dashboard stats (total projects/revenue/payments/orders/customers)
  - Real-time data refresh
  - MaterialReactTable with advanced features (grouping, sorting, filtering)
- **Database:**
  - Balance column in projects table
  - Full relationships to customers/users/orders/payments
- **Tested:** Backend APIs verified, frontend reports working, CSV export functional
- **Completion Date:** October 30, 2025

---

### Phase 9: Advanced Search & Filtering (Week 9-10) ✅ COMPLETED
- ✅ Advanced search across all entities
- ✅ Multi-criteria filtering (date range, amount range, status)
- ✅ Filter persistence
- ✅ Search result pagination
- ✅ Export results (CSV)
- ✅ Saved search queries
- ✅ Quick filters (Today, This Week, This Month)

**Deliverable**: Powerful search and filtering across all data

**Implementation Summary**:
- **Backend:**
  - searchService with global search across all 6 entities (customers, orders, projects, payments, checks, tokens)
  - Advanced filtering support (date range, amount range, status)
  - Quick filter presets endpoint (Today, This Week, This Month)
  - Optimized SQL queries with relationships
  - 2 REST endpoints: `/api/search` and `/api/search/quick-filters`
- **Frontend:**
  - GlobalSearchPage with comprehensive UI
  - Real-time search with Enter key support
  - Entity selection checkboxes (choose what to search)
  - Advanced filters accordion with:
    - Date range picker
    - Amount range (min/max)
    - Status filter
  - Quick filter chips (Today, This Week, This Month)
  - Search history (last 10 searches) with localStorage persistence
  - Saved searches feature with name/load/delete
  - Filter persistence (remembers last used filters)
  - SearchResults component with accordion layout by entity type
  - CSV export functionality for all results
  - Click-to-navigate to entity pages
  - Empty states and loading indicators
- **Features:**
  - Search across: Customers (name, phone, email, ID), Orders (order ID, address), Projects (project ID, name), Payments (payment ID, notes), Checks (check ID, number, bank), Tokens (token ID, vehicle, driver, customer)
  - Multi-entity search in single query
  - Results grouped by entity type with count badges
  - Colored entity icons for visual distinction
  - Responsive design with Material UI
  - localStorage integration for search history and saved searches
  - Real-time result count display
- **Tested:** Backend endpoints working, frontend search functional, CSV export verified
- **Completion Date:** October 30, 2025

---

### Phase 10: User Management & Admin Panel (Week 10-11) 🔲 NOT STARTED
- ⬜ User creation interface
- ⬜ Role assignment
- ⬜ Permission management (granular control)
- ⬜ User activity logging
- ⬜ View user activity history
- ⬜ Deactivate/activate users
- ⬜ User audit logs
- ⬜ System settings panel
- ⬜ Data export/backup options

**Deliverable**: Complete admin user management system

**Status**: Not yet implemented.

---

### Phase 11: Notifications & Alerts (Week 11-12) 🔲 NOT STARTED
- ⬜ Notification system (check pending alerts)
- ⬜ Sync status notifications
- ⬜ Permission-based notifications
- ⬜ Notification center (view all)
- ⬜ Mark notifications as read
- ⬜ Browser notifications (optional)
- ⬜ Email notifications (optional)

**Deliverable**: Real-time notifications for critical events

**Status**: Not yet implemented.

---

### Phase 12: Testing & Optimization (Week 12-13) 🔲 NOT STARTED
- ⬜ Unit tests (utils, services)
- ⬜ Integration tests (API endpoints)
- ⬜ E2E tests (user workflows)
- ⬜ Offline/online sync testing
- ⬜ Performance optimization
- ⬜ Database indexing
- ⬜ Bundle size optimization
- ⬜ Browser compatibility testing

**Deliverable**: Production-ready, tested system

**Status**: Not yet implemented.

---

### Phase 13: Deployment & Documentation (Week 13-14) 🔲 NOT STARTED
- ⬜ Backend deployment (Heroku, AWS, or similar)
- ⬜ Frontend deployment (Vercel, Netlify, or similar)
- ⬜ Environment configuration
- ⬜ SSL/HTTPS setup
- ⬜ User documentation
- ⬜ API documentation
- ⬜ Admin setup guide
- ⬜ Troubleshooting guide

**Deliverable**: Live, production system

**Status**: Not yet implemented.

---

## 16. NEXT STEPS - START BUILDING

Based on all the above analysis, here's what we'll build next:

### **Option A: Start with Phase 1-3 (Foundation)**
- Setup backend + database
- User authentication system  
- Local SQLite + sync service
- **Time**: 2-3 weeks
- **Benefit**: Solid foundation for everything else

### **Option B: Start with Complete Working Demo**
- All of Phase 1-8
- Working customer, order, payment, project system
- Printing & templates
- **Time**: 8-9 weeks
- **Benefit**: You see the full system working end-to-end

---

## 17. ARCHITECTURE SUMMARY - WHAT WE BUILT WILL HAVE

```
FRONTEND (React)
├── Pages: Login, Dashboard, Customers, Orders, Projects, Payments, Checks, Users, Templates
├── Components: Forms, Tables, Modals, Search, Filters
├── Hooks: useDatabase, useSync, useOffline, useAuth, usePrint, useNotifications
├── Context: AuthContext, SyncContext, OfflineContext
├── Services: databaseService, syncService, apiService, printService
└── Utils: validators, formatters, qrCodeGenerator, conflictResolver

BACKEND (Node.js + Express)
├── Routes: /auth, /customers, /orders, /projects, /payments, /checks, /items, /sync, /print, /search, /users
├── Controllers: Business logic for each entity
├── Services: Database operations, sync logic, PDF generation
├── Models: Sequelize ORM (Customer, Order, Project, Payment, Check, Item, Token, Invoice, User, PrintTemplate, UserActivityLog)
├── Middleware: Authentication, authorization, validation, error handling
└── Utils: Validators, formatters, conflict resolution, encryption

DATABASES
├── PostgreSQL (Cloud): Master data store
└── SQLite (Local): Offline operations, sync queue

SYNC MECHANISM
├── Timestamp-based conflict resolution
├── Device ID tracking
├── UNSYNCED/SYNCED status
└── Automatic sync when online

SECURITY
├── JWT authentication
├── Role-based access control
├── Permission middleware
├── Activity logging
└── Password hashing with bcrypt

PRINTING
├── Custom HTML/CSS templates
├── Thermal + normal printer support
├── QR code generation
├── Dynamic placeholder replacement
└── Template versioning

OFFLINE FIRST
├── All CRUD works offline
├── Changes queued locally
├── Automatic sync on connection
├── Conflict resolution on sync
└── Works seamlessly online or offline
```

---

## 18. CLARIFICATION ON YOUR ANSWERS

Based on your specifications:

1. **Shared SQLite** ✓
   - One database file on device
   - All users access same data
   - Permission filtering on queries
   - Track created_by/updated_by user

2. **Multi-user simultaneous updates** ✓
   - Timestamp-based conflict resolution
   - Last-write-wins approach
   - Activity logging shows who did what

3. **Simple timestamps** ✓
   - Compare created_at & updated_at
   - No field-level merging
   - No complex versioning

4. **Desktop PWA** ✓
   - Works in browser
   - Offline functionality (Service Worker)
   - Can be "installed" on desktop
   - Responsive design

5. **Customizable print templates** ✓
   - HTML + CSS editor
   - Template management UI
   - Live preview
   - User-specific preferences
   - Template versioning & sync

6. **No encryption** ✓
   - Simpler implementation
   - Faster performance
   - No hashing on data (only passwords)

7. **10,000 customers** ✓
   - Database indexes on key fields
   - Pagination in UI
   - Efficient search queries
   - Batch syncing
   - Lazy loading where possible

8. **User management** ✓ (NEW - ADDED ABOVE)
   - Complete user CRUD system
   - Role assignment
   - Permission matrix
   - Activity logging
   - Access control enforcementDeliverable**: Users can sign up, login, and access app based on roles

---

### Phase 2: Local Database & Offline Mode (Week 2-3)
- ✅ SQLite setup (sql.js or IndexedDB)
- ✅ Database schema migration to SQLite
- ✅ useDatabase hook for CRUD operations
- ✅ Online/offline detection
- ✅ LocalStorage for caching user preferences
- ✅ Mark records as SYNCED/UNSYNCED
- ✅ Load local data on app startup

**Deliverable**: App works offline with local data persistence

---

### Phase 3: Sync Service (Week 3-4)
- ✅ Sync service implementation
- ✅ Detect changes (UNSYNCED records)
- ✅ Queue sync operations
- ✅ Timestamp-based conflict resolution
- ✅ Batch sync (send multiple records at once)
- ✅ Sync status UI (indicator, history)
- ✅ Handle sync errors gracefully
- ✅ Automatic sync when online

**# Timber Mart CRM - Requirement Analysis & Modular Architecture

## 1. SYSTEM OVERVIEW

The Timber Mart CRM is a hybrid-sync business management system designed for timber industry operations. It combines offline-first SQLite functionality with cloud synchronization capabilities.

**Key Characteristic**: Users work offline locally, and changes sync to cloud when online. This is NOT a simple REST API client.

---

## 2. CORE DOMAIN ENTITIES & RELATIONSHIPS

### 2.1 Main Entities (With Relationships)

```
CUSTOMER
├── Has many: ORDERS
├── Has many: PAYMENTS
├── Has many: PROJECT_ASSIGNMENTS
└── Attributes: name, address, phone, email, balance, type, payment_history

ORDER
├── Belongs to: CUSTOMER
├── Belongs to: PROJECT
├── Has many: ORDER_ITEMS
├── Has one: INVOICE
└── Attributes: order_id, status, date, total_amount, payment_status, method

PROJECT
├── Has many: ORDERS
├── Has many: PAYMENTS
├── Has many: PROJECT_CUSTOMERS
└── Attributes: project_id, name, description, status, balance, start/end dates

PAYMENT
├── Belongs to: CUSTOMER
├── Belongs to: PROJECT (optional)
├── Has one: PAYMENT_VOUCHER
└── Attributes: payment_id, amount, type (loan/advance/deposit), status, method

CHECK
├── Standalone tracking entity
└── Attributes: check_id, amount, status (pending/cleared), payee, date

ITEM
├── Used in: ORDER_ITEMS
└── Attributes: item_id, name, description, quantity, unit, price, name_urdu

TOKEN
├── Generated from: ORDER
└── Attributes: token_id, customer_name, project_name, vehicle_details, qr_code, datetime

INVOICE
├── Generated from: ORDER
└── Attributes: invoice_id, order_id, customer_id, amount, due_date, status

USER
├── Has: PERMISSIONS
└── Attributes: user_id, username, password_encrypted, role, permissions, last_login

SYNCHRONIZATION_LOG
├── Tracks all sync operations
└── Attributes: sync_status (synced/unsynced), last_synced_at, record_id, entity_type
```

---

## 3. SYSTEM ARCHITECTURE LAYERS

### 3.1 Frontend Architecture (React)

```
Frontend/
├── components/
│   ├── shared/
│   │   ├── Layout (Navigation, Sidebar)
│   │   ├── Forms (Reusable form components)
│   │   ├── Tables (Data display)
│   │   ├── Modals (Dialogs)
│   │   ├── Buttons (Common actions)
│   │   └── LoadingSpinner, ErrorBoundary
│   │
│   ├── features/
│   │   ├── Customer/
│   │   │   ├── CustomerList
│   │   │   ├── CustomerForm (Add/Edit)
│   │   │   ├── CustomerDetail
│   │   │   └── CustomerSearch
│   │   │
│   │   ├── Order/
│   │   │   ├── OrderList
│   │   │   ├── OrderForm (Create/Edit)
│   │   │   ├── OrderDetail
│   │   │   └── OrderFilters
│   │   │
│   │   ├── Project/
│   │   │   ├── ProjectList
│   │   │   ├── ProjectForm
│   │   │   └── ProjectDetail
│   │   │
│   │   ├── Payment/
│   │   │   ├── PaymentForm
│   │   │   ├── PaymentList
│   │   │   └── PaymentVoucher (Print template)
│   │   │
│   │   ├── Check/
│   │   │   ├── CheckList
│   │   │   ├── CheckForm
│   │   │   └── CheckNotifications
│   │   │
│   │   ├── Print/
│   │   │   ├── TokenPrint
│   │   │   ├── InvoicePrint
│   │   │   ├── ReceiptPrint
│   │   │   └── PrintSettings
│   │   │
│   │   ├── Sync/
│   │   │   ├── SyncStatus
│   │   │   ├── SyncHistory
│   │   │   └── ConflictResolver
│   │   │
│   │   ├── Search/
│   │   │   ├── AdvancedSearch
│   │   │   └── FilterPanel
│   │   │
│   │   └── Dashboard/
│   │       ├── Dashboard (Main home page)
│   │       └── Analytics
│   │
│   ├── hooks/ (Custom React Hooks)
│   │   ├── useDatabase (Local DB operations)
│   │   ├── useSync (Sync management)
│   │   ├── useOfflineMode (Offline detection)
│   │   ├── usePrint (Print functionality)
│   │   ├── useNotifications
│   │   ├── useAuth (Authentication)
│   │   └── useSearch (Search logic)
│   │
│   ├── context/
│   │   ├── AuthContext (User, permissions)
│   │   ├── SyncContext (Sync status, queue)
│   │   ├── OfflineContext (Online/offline state)
│   │   └── NotificationContext
│   │
│   ├── services/
│   │   ├── databaseService (SQLite operations)
│   │   ├── syncService (Cloud sync logic)
│   │   ├── apiService (REST calls)
│   │   ├── printService (Print operations)
│   │   ├── authService (Login/permissions)
│   │   └── notificationService
│   │
│   ├── utils/
│   │   ├── validators (Form validation)
│   │   ├── formatters (Date, currency, Urdu)
│   │   ├── qrCodeGenerator
│   │   ├── conflictResolver (Timestamp-based)
│   │   ├── localStorage (Cache)
│   │   └── errorHandler
│   │
│   ├── types/ (TypeScript types)
│   │   ├── entities.ts (Entity interfaces)
│   │   ├── api.ts (API request/response)
│   │   ├── sync.ts (Sync types)
│   │   └── ui.ts (Component props)
│   │
│   └── pages/
│       ├── Login
│       ├── Dashboard
│       ├── Customers
│       ├── Orders
│       ├── Projects
│       ├── Payments
│       ├── Checks
│       ├── Sync
│       └── Settings
```

### 3.2 Backend Architecture (Node.js + Express)

```
Backend/
├── config/
│   ├── database.js (PostgreSQL connection)
│   ├── env.js (Environment variables)
│   └── constants.js (App constants)
│
├── models/ (Sequelize ORM models)
│   ├── Customer.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Project.js
│   ├── Payment.js
│   ├── Check.js
│   ├── Item.js
│   ├── Token.js
│   ├── Invoice.js
│   ├── User.js
│   ├── SyncLog.js
│   └── associations.js (Define relationships)
│
├── routes/
│   ├── auth.js (Login, JWT generation)
│   ├── customers.js (CRUD endpoints)
│   ├── orders.js
│   ├── projects.js
│   ├── payments.js
│   ├── checks.js
│   ├── items.js
│   ├── sync.js (Sync operations)
│   ├── print.js (Generate print data)
│   └── search.js (Advanced search)
│
├── controllers/
│   ├── CustomerController.js (Business logic)
│   ├── OrderController.js
│   ├── ProjectController.js
│   ├── PaymentController.js
│   ├── CheckController.js
│   ├── SyncController.js
│   ├── AuthController.js
│   └── SearchController.js
│
├── services/
│   ├── CustomerService.js (DB queries, business logic)
│   ├── OrderService.js
│   ├── ProjectService.js
│   ├── PaymentService.js
│   ├── SyncService.js (Handle sync conflicts)
│   ├── AuthService.js (JWT, encryption)
│   ├── NotificationService.js (Send alerts)
│   └── PrintService.js (Generate invoices, tokens)
│
├── middleware/
│   ├── auth.js (Verify JWT)
│   ├── errorHandler.js (Global error handling)
│   ├── requestValidator.js (Validate requests)
│   ├── permissionCheck.js (Role-based access)
│   └── logging.js (Request logging)
│
├── utils/
│   ├── validators.js (Data validation)
│   ├── formatters.js (Format responses)
│   ├── conflictResolver.js (Sync conflict logic)
│   ├── qrCodeGenerator.js
│   ├── encryption.js (Encrypt sensitive data)
│   └── errorMessages.js
│
├── migrations/ (Database schema)
│   ├── 001_create_customers.js
│   ├── 002_create_orders.js
│   └── ...
│
├── seeders/ (Test data)
│   └── seed.js
│
└── server.js (Express app entry point)
```

---

## 4. KEY BUSINESS LOGIC FLOWS

### 4.1 Order Creation Flow (Offline-First)

```
User Action (Create Order)
    ↓
Frontend Form Validation
    ↓
generateUniqueOrderID() [Client-side]
    ↓
Save to Local SQLite
    ↓
Mark sync_status = "UNSYNCED"
    ↓
Update UI (Order List)
    ↓
[When Online] Sync to Cloud
    ↓
Backend Validates & Creates in PostgreSQL
    ↓
Merge local & cloud, Update sync_status = "SYNCED"
```

### 4.2 Sync Conflict Resolution

```
Conflict Detection
    ↓
Compare last_synced_at timestamps
    ↓
IF local_timestamp > cloud_timestamp
    → Use local version (most recent)
ELSE
    → Use cloud version
    ↓
Update local database
    ↓
Update sync log
    ↓
Notify user if data was overwritten
```

### 4.3 Payment Processing Flow

```
User Enters Payment (offline or online)
    ↓
Frontend validates amount and customer
    ↓
generatePaymentID() & generateVoucher()
    ↓
IF offline:
    → Save to local SQLite, mark UNSYNCED
    → Generate voucher PDF locally
ELSE:
    → Send to Backend immediately
    → Backend creates payment record
    → Backend updates customer balance
    → Generate payment voucher on server
    ↓
Update order/project balance
    ↓
Sync when conditions allow
```

### 4.4 Token Generation & Printing

```
User Creates Order
    ↓
Generate QR Code (contains order_id + timestamp)
    ↓
Create Token Record
    ↓
IF Thermal Printer:
    → Format for thermal printer (80mm width)
    → Send to printer device driver
ELSE IF Normal Printer:
    → Format for A4 paper
    → Send to browser print dialog
```

### 4.5 Search & Filtering Logic

```
User enters search criteria
    ↓
Apply filters (customer_name, order_status, date_range, project_id)
    ↓
Query local SQLite (if offline)
    OR Query cloud database (if online & fresh data needed)
    ↓
Return filtered results
    ↓
Display with pagination
    ↓
Results should return within 0.5 seconds (performance requirement)
```

---

## 5. SYNCHRONIZATION STRATEGY (CRITICAL)

### 5.1 Sync Data Structure

```javascript
LOCAL SQLite Record Example:
{
  order_id: "ORD_2025_001",
  customer_id: "CUST_001",
  amount: 5000,
  status: "pending",
  
  // Sync tracking fields (LOCAL ONLY)
  sync_status: "UNSYNCED" | "SYNCED" | "CONFLICT",
  last_synced_at: "2025-01-15T10:30:00Z",
  created_at: "2025-01-15T09:00:00Z",
  updated_at: "2025-01-15T09:15:00Z",
  device_id: "device_uuid_123" // Track which device created it
}

CLOUD PostgreSQL Record:
{
  id: 1,
  order_id: "ORD_2025_001",
  customer_id: "CUST_001",
  amount: 5000,
  status: "pending",
  
  // Cloud sync fields
  synced_from_device: "device_uuid_123",
  last_cloud_updated_at: "2025-01-15T10:30:00Z",
  version: 1 // Version control for conflicts
}
```

### 5.2 Sync Triggers

- User manually clicks "Sync" button
- Internet connection detected (automatic background sync)
- Critical data change (e.g., payment)
- Periodic sync every 5 minutes when online

### 5.3 Conflict Resolution Rules

```
IF local_updated_at > cloud_last_updated_at:
    Use local version (user's latest work)
ELSE IF local_updated_at < cloud_last_updated_at:
    Use cloud version (might be updated by other user/device)
ELSE IF timestamps equal:
    Use transaction_id or device_id to break tie
ELSE:
    Alert user - manual conflict resolution needed
```

---

## 6. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Components | Hooks | Context | Services | Utils          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────┬──────────────────┬───────────┘
                 │                  │                  │
         [Offline Local DB] [Online Cloud] [Print Driver]
                 │                  │                  │
┌────────────────▼──────────────────▼──────────────────▼───────────┐
│                     BROWSER LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SQLite Database (IndexedDB or WASMdb)                    │   │
│  │ LocalStorage (Cache, user prefs)                         │   │
│  │ Service Worker (Offline sync, background tasks)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────────┘
                 │
     ┌───────────▼───────────┐
     │   API Gateway / REST  │
     │   (JWT Authentication)│
     └───────────┬───────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────────┐  ┌──▼──────────────────┐
│  BACKEND (Node.js)   │  │  CLOUD DATABASE    │
│ ┌──────────────────┐ │  │  (PostgreSQL)      │
│ │ Controllers      │ │  │                    │
│ │ Services         │ │  │ - Customers        │
│ │ Middleware       │ │  │ - Orders           │
│ │ Models (Sequelize)│ │  │ - Projects         │
│ │ Routes           │ │  │ - Payments         │
│ └──────────────────┘ │  │ - Sync Logs        │
│                      │  │                    │
└──────────────────────┘  └────────────────────┘
```

---

## 7. MODULAR BREAKDOWN - WHAT WE'LL BUILD

### Phase 1: Core Infrastructure
- Database setup (SQLite client-side, PostgreSQL server-side)
- Authentication system (Login, JWT, user roles)
- Offline detection & sync state management

### Phase 2: Customer & Order Management
- Customer CRUD (Add, view, edit, delete)
- Order creation and management
- Order filtering and search

### Phase 3: Payment & Check Management
- Payment processing
- Payment voucher generation
- Check tracking with notifications

### Phase 4: Projects & Analytics
- Project management
- Linking orders to projects
- Basic reporting/analytics

### Phase 5: Advanced Features
- Token generation with QR codes
- Multi-printer support (thermal + normal)
- Invoice and receipt printing
- Advanced search across all entities

### Phase 6: Synchronization & Conflict Resolution
- Implement sync queues
- Handle data conflicts
- Sync history logging

---

## 8. TECHNOLOGY STACK

### Frontend
- **React 18** (UI library)
- **TypeScript** (Type safety)
- **React Query** (Data fetching & caching)
- **Zustand** (State management for sync, offline state)
- **React Hook Form** (Form handling)
- **Zod/Yup** (Validation)
- **sql.js** or **IndexedDB** (Local database)
- **QRCode.react** (QR code generation)
- **react-print** (Print functionality)
- **Tailwind CSS** (Styling)

### Backend
- **Node.js + Express** (Server)
- **Sequelize** (ORM for PostgreSQL)
- **PostgreSQL** (Cloud database)
- **JWT** (Authentication)
- **bcryptjs** (Password encryption)
- **Joi/Zod** (Request validation)
- **pdfkit** (PDF generation for vouchers)
- **qrcode** (QR generation)

---

## 9. KEY IMPLEMENTATION CHALLENGES & SOLUTIONS

| Challenge | Solution |
|-----------|----------|
| Offline-first with sync | Use timestamps + device_id for conflict resolution |
| Unique ID generation offline | Use client timestamp + device UUID prefix (e.g., CUST_2025_001_DEV1) |
| SQLite in browser | Use sql.js or IndexedDB with SQLite emulation |
| Thermal printer compatibility | Use browser print APIs + device-specific drivers |
| Real-time notifications | Use WebSockets or polling for check alerts |
| Data validation (client + server) | Validate on both sides independently |
| Multi-language support (Urdu) | Store item names in both English and Urdu columns |
| Large data sync | Implement pagination & batching in sync service |

---

## 10. DATABASE SCHEMA (Brief Overview)

```sql
-- Customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR UNIQUE,
  name VARCHAR,
  address TEXT,
  phone VARCHAR,
  email VARCHAR,
  balance DECIMAL,
  customer_type VARCHAR,
  sync_status VARCHAR,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR UNIQUE,
  customer_id INT REFERENCES customers(id),
  project_id INT REFERENCES projects(id),
  total_amount DECIMAL,
  status VARCHAR,
  payment_status VARCHAR,
  order_date TIMESTAMP,
  sync_status VARCHAR,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR UNIQUE,
  name VARCHAR,
  description TEXT,
  status VARCHAR,
  balance DECIMAL,
  start_date DATE,
  end_date DATE,
  sync_status VARCHAR,
  last_synced_at TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR UNIQUE,
  customer_id INT REFERENCES customers(id),
  project_id INT REFERENCES projects(id),
  amount DECIMAL,
  payment_type VARCHAR,
  payment_method VARCHAR,
  status VARCHAR,
  payment_date TIMESTAMP,
  sync_status VARCHAR,
  last_synced_at TIMESTAMP
);

-- Similar tables for Checks, Items, Tokens, Invoices, Users, SyncLogs
```

---

## 11. NEXT STEPS

1. **Review this analysis** - Make sure the architecture aligns with your vision
2. **Prioritize features** - Which modules should we build first?
3. **Database setup** - We'll set up local SQLite emulation + PostgreSQL
4. **Authentication** - Implement login and role-based permissions
5. **Build features incrementally** - Start with Customer CRUD, then Orders, etc.

---

## 12. USER MANAGEMENT & ACCESS CONTROL SYSTEM

### 12.1 User Roles & Permissions Matrix

```
ROLE HIERARCHY:
├── ADMIN
│   └── Can: Manage users, roles, permissions, view all data, system settings
│
├── MANAGER
│   └── Can: Approve payments, assign projects, view reports, manage team
│
├── SALES_OFFICER
│   └── Can: Create/edit orders, manage customers, process payments (up to limit)
│
├── WAREHOUSE_STAFF
│   └── Can: View inventory, print tokens, mark orders fulfilled
│
└── ACCOUNTANT
    └── Can: Process payments, reconcile checks, generate reports, view financial data
```

### 12.2 Permission Model

```javascript
// Define granular permissions tied to features
const PERMISSIONS = {
  // Customer Management
  CUSTOMER_VIEW: "customer.view",
  CUSTOMER_CREATE: "customer.create",
  CUSTOMER_EDIT: "customer.edit",
  CUSTOMER_DELETE: "customer.delete",
  
  // Order Management
  ORDER_VIEW: "order.view",
  ORDER_CREATE: "order.create",
  ORDER_EDIT: "order.edit",
  ORDER_DELETE: "order.delete",
  
  // Payment Management
  PAYMENT_VIEW: "payment.view",
  PAYMENT_CREATE: "payment.create",
  PAYMENT_APPROVE: "payment.approve", // Approval required
  
  // Check Management
  CHECK_VIEW: "check.view",
  CHECK_CREATE: "check.create",
  CHECK_CLEAR: "check.clear",
  
  // Project Management
  PROJECT_VIEW: "project.view",
  PROJECT_CREATE: "project.create",
  PROJECT_EDIT: "project.edit",
  
  // Reporting
  REPORT_VIEW: "report.view",
  REPORT_EXPORT: "report.export",
  
  // User Management (Admin only)
  USER_CREATE: "user.create",
  USER_EDIT: "user.edit",
  USER_DELETE: "user.delete",
  ROLE_ASSIGN: "role.assign",
  PERMISSION_ASSIGN: "permission.assign",
  
  // System Settings
  PRINT_TEMPLATE_EDIT: "system.print_template_edit",
  SYSTEM_SETTINGS: "system.settings",
  SYNC_MANAGE: "system.sync_manage"
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
  ADMIN: [/* ALL permissions */],
  MANAGER: [
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_APPROVE, PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE, PERMISSIONS.REPORT_VIEW, PERMISSIONS.SYNC_MANAGE
  ],
  SALES_OFFICER: [
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT,
    PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_CREATE, PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.PAYMENT_CREATE
  ],
  WAREHOUSE_STAFF: [
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.PAYMENT_VIEW
  ],
  ACCOUNTANT: [
    PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_CREATE, PERMISSIONS.PAYMENT_APPROVE,
    PERMISSIONS.CHECK_VIEW, PERMISSIONS.CHECK_CREATE, PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT
  ]
};
```

### 12.3 User Management Features

#### User Creation Flow
```
Admin navigates to User Management
  ↓
Clicks "Add New User"
  ↓
Form appears with:
  - Username (unique validation against cloud)
  - Email
  - Full Name
  - Password (generated or custom)
  - Role selection (ADMIN, MANAGER, SALES_OFFICER, etc.)
  - Assign custom permissions (optional)
  - Active/Inactive status
  - Department (optional)
  ↓
Validate & save to cloud PostgreSQL
  ↓
If offline: Queue user creation, sync when online
  ↓
User is created with temporary password
  ↓
Send email/notification with login credentials
  ↓
User logs in on first attempt, must change password
```

#### User Authentication & Login Flow
```
User launches app
  ↓
Check if user already logged in (JWT in localStorage)
  ↓
IF JWT exists & valid:
    → Load user permissions
    → Load last synced data from local SQLite
    → Display dashboard
ELSE:
    → Show login page
    ↓
User enters Username & Password
  ↓
IF offline:
    → Validate against local cache
    → Allow login if credentials match cached user
    → Alert: "Working in offline mode"
ELSE (online):
    → Send credentials to backend (HTTPS)
    → Backend validates username & password
    → Backend checks if user is active
    → Backend generates JWT token (expires in 7 days)
    → Return JWT + user permissions + user profile
    ↓
Store JWT in sessionStorage (not localStorage for security)
    ↓
Store user profile & permissions in React Context
    ↓
Load data from local SQLite
    ↓
Show dashboard
    ↓
Token auto-refreshes before expiry (if online)
```

#### Permission Checking (Runtime)
```javascript
// Example: Checking if user can create an order

// In React Component
function OrderForm() {
  const { user } = useAuth(); // Get user from context
  
  if (!hasPermission(user, PERMISSIONS.ORDER_CREATE)) {
    return <div>You don't have permission to create orders</div>;
  }
  
  return <OrderFormUI />;
}

// Utility function
function hasPermission(user, requiredPermission) {
  return user.permissions.includes(requiredPermission);
}

// Backend validation (double-check)
app.post('/api/orders', authenticate, authorize([PERMISSIONS.ORDER_CREATE]), (req, res) => {
  // Only if user has permission, this executes
  // Create order logic
});
```

### 12.4 User Activity Tracking

```javascript
// Track what user did
USER_ACTIVITY_LOG {
  activity_id: UUID,
  user_id: INT,
  action: "CREATE_ORDER" | "EDIT_CUSTOMER" | "APPROVE_PAYMENT",
  entity_type: "order" | "customer" | "payment",
  entity_id: INT,
  timestamp: DATETIME,
  details: JSON // {old_value, new_value} for edits
}

// Example: When user edits an order
saveUserActivity({
  user_id: 5,
  action: "EDIT_ORDER",
  entity_type: "order",
  entity_id: 123,
  details: {
    field_changed: "status",
    old_value: "pending",
    new_value: "fulfilled"
  }
});
```

### 12.5 Shared SQLite Database with User Context

```javascript
// On app startup (after login)
async function initializeApp(user) {
  // Open shared SQLite database (same for all users on this device)
  const db = await sqlite.open(':memory:'); // or file-based
  
  // Tag all local changes with current user
  window.appState = {
    currentUser: user,
    db: db
  };
}

// When saving an order offline
async function saveOrderLocally(orderData) {
  const order = {
    ...orderData,
    created_by_user_id: window.appState.currentUser.id,
    sync_status: "UNSYNCED"
  };
  
  await window.appState.db.run(
    `INSERT INTO orders (...) VALUES (...)`,
    order
  );
}

// When syncing to cloud
// Backend knows which user created it and can validate permissions
```

### 12.6 User Logout & Session Management

```
User clicks "Logout"
  ↓
Clear JWT from sessionStorage
  ↓
Clear user context
  ↓
Clear sensitive data from memory
  ↓
Redirect to login page
  ↓
SQLite database remains (for next user or same user)
  ↓
When new user logs in, they see same local data but
filtered based on their permissions
```

### 12.7 Access Control Implementation Points

#### Frontend Permission Checks
- Show/hide UI elements based on user permissions
- Disable buttons if user lacks permission
- Conditionally render entire pages/modules
- Prevent navigation to unauthorized pages

#### Backend Permission Checks
- Verify JWT on every API call
- Check permissions before executing business logic
- Return 403 Forbidden if user lacks permission
- Log unauthorized access attempts
- Data isolation: Don't return unauthorized records

#### Data Filtering
```javascript
// When user views orders, filter based on permissions
async function getOrders(user) {
  let query = "SELECT * FROM orders";
  
  // Sales officer only sees their own orders
  if (user.role === "SALES_OFFICER") {
    query += " WHERE created_by_user_id = " + user.id;
  }
  
  // Manager sees team's orders
  if (user.role === "MANAGER") {
    const teamMembers = await getTeamMembers(user.id);
    query += " WHERE created_by_user_id IN (" + teamMembers + ")";
  }
  
  // Admin sees all
  // (no additional WHERE clause)
  
  return db.all(query);
}
```

### 12.8 User Management UI Components

```
Frontend/components/Admin/
├── UserManagement/
│   ├── UserList (Table of all users)
│   ├── UserForm (Create/Edit user)
│   ├── UserDetail (View user info, activity)
│   ├── RoleSelector (Assign roles)
│   ├── PermissionSelector (Custom permissions)
│   ├── UserActivityLog (What user did)
│   └── UserStatusToggle (Activate/Deactivate)
│
├── RoleManagement/
│   ├── RoleList
│   ├── RoleForm (Create custom role)
│   └── PermissionMatrix (Visual permission assignment)
│
└── AuditLog/
    ├── ActivityLog (All user actions)
    └── FilterByUser (View specific user's actions)
```

### 12.9 User Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR,
  role VARCHAR, -- ADMIN, MANAGER, SALES_OFFICER, etc.
  is_active BOOLEAN DEFAULT true,
  department VARCHAR,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by_user_id INT REFERENCES users(id)
);

-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR UNIQUE,
  description TEXT,
  created_at TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  permission_name VARCHAR UNIQUE,
  description TEXT,
  module VARCHAR -- "customer", "order", "payment", etc.
);

-- Role_Permissions Junction Table
CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id),
  permission_id INT REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- User_Permissions (for custom overrides)
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  permission_id INT REFERENCES permissions(id),
  grant_type VARCHAR -- "allow" or "deny"
);

-- Activity Log
CREATE TABLE user_activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR,
  entity_type VARCHAR,
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW()
);
```