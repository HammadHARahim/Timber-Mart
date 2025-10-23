## Phase 6: Printing & Tokens - Backend Implementation COMPLETE ✅

**Status:** Backend Complete
**Date:** October 19, 2025
**Progress:** Backend 100% | Frontend 0%

---

## 📦 Backend Files Created

### Models (3 files)
1. **`backend/models/PrintTemplate.js`** - Print template storage
2. **`backend/models/Token.js`** - Token records with QR codes
3. **`backend/models/PrintSettings.js`** - User print preferences
4. **`backend/models/associations.js`** - Updated with new relationships

### Services (3 files)
5. **`backend/services/printTemplateService.js`** - Template management logic
6. **`backend/services/tokenService.js`** - Token and QR code generation
7. **`backend/services/printService.js`** - Print data generation and rendering

### Routes (3 files)
8. **`backend/routes/printTemplates.js`** - 9 template endpoints
9. **`backend/routes/tokens.js`** - 9 token endpoints
10. **`backend/routes/print.js`** - 5 print generation endpoints

### Configuration (3 files)
11. **`backend/server.js`** - Routes registered
12. **`backend/package.json`** - Added `qrcode` dependency
13. **`backend/migrations/006_create_printing_tokens_tables.sql`** - Database migration

**Total Backend Files:** 13 files (10 new + 3 updated)

---

## 🗄️ Database Schema

### New Tables (3)

#### 1. print_templates
Stores custom print templates with HTML/CSS.

```sql
CREATE TABLE print_templates (
  id SERIAL PRIMARY KEY,
  template_id VARCHAR(50) UNIQUE,
  name VARCHAR(200),
  description TEXT,
  type ENUM('TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER', 'CUSTOM'),
  html_content TEXT,
  css_content TEXT,
  page_size VARCHAR(20) DEFAULT 'A4',
  orientation ENUM('PORTRAIT', 'LANDSCAPE'),
  margin_top/bottom/left/right DECIMAL(5,2),
  is_default BOOLEAN,
  is_active BOOLEAN,
  version INTEGER,
  created_by_user_id INTEGER,
  updated_by_user_id INTEGER,
  -- sync fields
);
```

**Features:**
- Custom HTML/CSS templates
- Multiple template types
- Version control
- Default template per type
- Page size and orientation settings
- Margin configuration

#### 2. tokens
Stores delivery tokens with QR codes.

```sql
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(50) UNIQUE,
  order_id INTEGER REFERENCES orders(id),
  customer_id INTEGER REFERENCES customers(id),
  project_id INTEGER REFERENCES projects(id),
  customer_name VARCHAR(200),      -- Snapshot
  project_name VARCHAR(200),       -- Snapshot
  vehicle_number VARCHAR(50),
  vehicle_type VARCHAR(100),
  driver_name VARCHAR(200),
  driver_phone VARCHAR(20),
  token_date TIMESTAMP,
  delivery_address TEXT,
  notes TEXT,
  qr_code_data TEXT,
  qr_code_url VARCHAR(500),       -- Base64 data URL
  print_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMP,
  printed_by_user_id INTEGER,
  template_id INTEGER,
  status ENUM('ACTIVE', 'USED', 'CANCELLED'),
  created_by_user_id INTEGER,
  -- sync fields
);
```

**Features:**
- Links to orders, customers, projects
- Vehicle and driver information
- QR code generation (auto)
- Print tracking
- Status management
- Data snapshots

#### 3. print_settings
User-specific print preferences.

```sql
CREATE TABLE print_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  default_token_template_id INTEGER,
  default_invoice_template_id INTEGER,
  default_receipt_template_id INTEGER,
  default_voucher_template_id INTEGER,
  preferred_printer VARCHAR(200),
  printer_type ENUM('THERMAL', 'NORMAL', 'PDF'),
  thermal_printer_width INTEGER DEFAULT 80,
  auto_print_on_create BOOLEAN,
  show_print_preview BOOLEAN,
  print_copies INTEGER,
  default_page_size VARCHAR(20),
  default_orientation VARCHAR(10),
  default_margin_top/bottom/left/right DECIMAL(5,2),
  include_qr_code BOOLEAN,
  qr_code_size INTEGER,
  company_name/address/phone/email VARCHAR,
  company_logo_url VARCHAR(500),
  preferences JSON,
  -- sync fields
);
```

**Features:**
- Per-user preferences
- Default templates selection
- Printer configuration
- Thermal printer support (58mm, 80mm)
- Company branding info
- QR code settings
- Additional JSON preferences

---

## 🌐 API Endpoints

### Print Templates API (`/api/print-templates`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/print-templates` | Get all templates (with filters) | `template:view` |
| GET | `/api/print-templates/:id` | Get template by ID | `template:view` |
| GET | `/api/print-templates/default/:type` | Get default template for type | `template:view` |
| GET | `/api/print-templates/:type/placeholders` | Get available placeholders | `template:view` |
| POST | `/api/print-templates` | Create new template | `template:create` |
| PUT | `/api/print-templates/:id` | Update template | `template:edit` |
| DELETE | `/api/print-templates/:id` | Delete template | `template:delete` |
| PATCH | `/api/print-templates/:id/set-default` | Set as default | `template:edit` |
| POST | `/api/print-templates/:id/duplicate` | Duplicate template | `template:create` |

**Total:** 9 endpoints

### Tokens API (`/api/tokens`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/tokens` | Get all tokens (with filters) | `token:view` |
| GET | `/api/tokens/:id` | Get token by ID | `token:view` |
| GET | `/api/tokens/order/:orderId` | Get tokens by order | `token:view` |
| POST | `/api/tokens` | Create new token | `token:create` |
| POST | `/api/tokens/from-order/:orderId` | Generate from order | `token:create` |
| PUT | `/api/tokens/:id` | Update token | `token:edit` |
| PATCH | `/api/tokens/:id/status` | Update status | `token:edit` |
| PATCH | `/api/tokens/:id/print` | Record print | `token:print` |
| DELETE | `/api/tokens/:id` | Delete token | `token:delete` |

**Total:** 9 endpoints

### Print API (`/api/print`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/print/settings` | Get user print settings | - |
| PUT | `/api/print/settings` | Update user print settings | - |
| POST | `/api/print/token/:tokenId` | Generate token print data | `token:print` |
| POST | `/api/print/invoice/:orderId` | Generate invoice print data | `invoice:print` |
| POST | `/api/print/receipt/:paymentId` | Generate receipt print data | `receipt:print` |

**Total:** 5 endpoints

**Grand Total API Endpoints:** 23 new endpoints

---

## 🔧 Key Features

### 1. Template Management
- ✅ Create custom HTML/CSS templates
- ✅ 5 template types (Token, Invoice, Receipt, Voucher, Custom)
- ✅ Default template per type
- ✅ Template versioning
- ✅ Duplicate templates
- ✅ Placeholder system
- ✅ Active/inactive status

### 2. QR Code Generation
- ✅ Automatic QR code creation
- ✅ Base64 data URL format
- ✅ Configurable size
- ✅ Embedded in tokens
- ✅ Contains: token_id, order_id, customer, timestamp

### 3. Token System
- ✅ Generate tokens from orders
- ✅ Vehicle and driver tracking
- ✅ Delivery information
- ✅ Print count tracking
- ✅ Status management (Active, Used, Cancelled)
- ✅ QR code integration

### 4. Print Data Generation
- ✅ Token printing
- ✅ Invoice printing (with items table)
- ✅ Receipt printing
- ✅ Template placeholder replacement
- ✅ Dynamic data injection
- ✅ Currency formatting
- ✅ Amount to words conversion

### 5. User Preferences
- ✅ Per-user print settings
- ✅ Default template selection
- ✅ Printer configuration
- ✅ Thermal printer support
- ✅ Company branding
- ✅ Auto-print options
- ✅ Print preview settings

---

## 📝 Template Placeholders

### Common Placeholders (All Types)
```
{{date}}, {{time}}, {{company_name}}, {{company_address}},
{{company_phone}}, {{company_email}}, {{company_logo}}
```

### Token Placeholders
```
{{token_id}}, {{customer_name}}, {{project_name}},
{{vehicle_number}}, {{vehicle_type}}, {{driver_name}},
{{driver_phone}}, {{delivery_address}}, {{qr_code}}, {{notes}}
```

### Invoice Placeholders
```
{{invoice_number}}, {{order_id}}, {{customer_name}},
{{customer_address}}, {{customer_phone}}, {{items_table}},
{{subtotal}}, {{discount}}, {{total}}, {{paid}}, {{balance}},
{{payment_status}}
```

### Receipt Placeholders
```
{{receipt_number}}, {{customer_name}}, {{amount}},
{{amount_in_words}}, {{payment_method}}, {{payment_type}},
{{received_by}}
```

---

## 🔄 Service Methods

### PrintTemplateService
- `getAllTemplates(filters)` - List with pagination
- `getTemplateById(id)` - Get single template
- `getDefaultTemplate(type)` - Get default for type
- `createTemplate(data, userId)` - Create new
- `updateTemplate(id, data, userId)` - Update existing
- `deleteTemplate(id)` - Delete (not default)
- `setAsDefault(id)` - Set as default
- `duplicateTemplate(id, userId)` - Create copy
- `getPlaceholdersForType(type)` - Get available placeholders

### TokenService
- `getAllTokens(filters)` - List with pagination
- `getTokenById(id)` - Get single token
- `generateQRCode(tokenData)` - Create QR code
- `createToken(data, userId)` - Create new token
- `updateToken(id, data, userId)` - Update token
- `deleteToken(id)` - Delete token
- `updateTokenStatus(id, status)` - Change status
- `recordPrint(id, userId)` - Track printing
- `getTokensByOrder(orderId)` - Get order tokens
- `generateFromOrder(orderId, data, userId)` - Auto-generate

### PrintService
- `replacePlaceholders(template, data)` - Replace placeholders
- `formatCurrency(amount)` - Format as ₨XX.XX
- `getUserPrintSettings(userId)` - Get user settings
- `generateTokenPrint(tokenId, templateId, userId)` - Token print data
- `generateInvoicePrint(orderId, templateId, userId)` - Invoice print data
- `generateReceiptPrint(paymentId, templateId, userId)` - Receipt print data
- `generateItemsTable(items)` - Create items HTML table
- `convertAmountToWords(amount)` - Amount to words
- `updateUserPrintSettings(userId, data)` - Update settings

---

## 📊 Sample Data

### Default Templates Seeded
1. **Default Token Template** (TPL-DEFAULT-TOKEN)
   - Type: TOKEN
   - Layout: Company header, QR code, token details table
   - Page size: A4
   - Orientation: Portrait

2. **Default Invoice Template** (TPL-DEFAULT-INVOICE)
   - Type: INVOICE
   - Layout: Company header, customer info, items table, totals
   - Page size: A4
   - Orientation: Portrait

---

## 🔐 Permissions Required

New permissions added:
```javascript
'template:view', 'template:create', 'template:edit', 'template:delete',
'token:view', 'token:create', 'token:edit', 'token:delete', 'token:print',
'invoice:print', 'receipt:print', 'voucher:print'
```

---

## 🚀 Usage Examples

### 1. Create Template
```bash
POST /api/print-templates
{
  "name": "Custom Token",
  "type": "TOKEN",
  "html_content": "<html>...</html>",
  "css_content": "body { ... }",
  "page_size": "A4",
  "orientation": "PORTRAIT"
}
```

### 2. Generate Token from Order
```bash
POST /api/tokens/from-order/123
{
  "vehicle_number": "ABC-123",
  "driver_name": "John Doe",
  "driver_phone": "123-456-7890"
}
```

### 3. Get Print Data for Token
```bash
POST /api/print/token/1
{
  "template_id": 5  // Optional, uses default if not provided
}

Response:
{
  "html": "<!DOCTYPE html>...",
  "css": "body { ... }",
  "pageSize": "A4",
  "orientation": "PORTRAIT",
  "margins": { top: 10, bottom: 10, left: 10, right: 10 }
}
```

### 4. Update Print Settings
```bash
PUT /api/print/settings
{
  "default_token_template_id": 5,
  "printer_type": "THERMAL",
  "thermal_printer_width": 80,
  "show_print_preview": true,
  "include_qr_code": true,
  "company_name": "Timber Mart Ltd"
}
```

---

## ✅ Implementation Checklist

### Backend
- [x] PrintTemplate model
- [x] Token model
- [x] PrintSettings model
- [x] Model associations
- [x] printTemplateService
- [x] tokenService
- [x] printService
- [x] Print templates routes (9 endpoints)
- [x] Tokens routes (9 endpoints)
- [x] Print routes (5 endpoints)
- [x] QRCode dependency added
- [x] Migration SQL file
- [x] Default templates seeded
- [x] Routes registered in server.js

### Pending
- [ ] Frontend components
- [ ] Frontend services
- [ ] Template editor UI
- [ ] Token management UI
- [ ] Print preview component
- [ ] Print settings page
- [ ] IndexedDB schema update
- [ ] Full integration testing

---

## 📈 Next Steps

### Frontend Implementation Needed:
1. **Template Management**
   - TemplateList component
   - TemplateEditor (HTML/CSS editor)
   - TemplatePlaceholders helper
   - Template preview

2. **Token Management**
   - TokenList component
   - TokenForm component
   - TokenDetail view
   - Generate from order button

3. **Print Components**
   - PrintPreview component
   - PrintSettings page
   - Print button integration
   - QR code display

4. **Services**
   - printTemplateService.js (frontend)
   - tokenService.js (frontend)
   - printService.js (frontend)

5. **IndexedDB**
   - Add print_templates store
   - Add tokens store
   - Add print_settings store

---

## 🐛 Testing Checklist

### Backend API Testing
- [ ] Create print template
- [ ] Get all templates
- [ ] Update template
- [ ] Set default template
- [ ] Create token
- [ ] Generate token from order
- [ ] Get token with QR code
- [ ] Generate print data (token/invoice/receipt)
- [ ] Update print settings
- [ ] Verify QR code generation

---

## 💾 Dependencies

**New Package:**
```json
{
  "qrcode": "^1.5.3"
}
```

**Install:**
```bash
cd backend
npm install qrcode
```

---

## 📚 Documentation Status

- [x] Backend API documented
- [x] Database schema documented
- [x] Service methods documented
- [x] Placeholder system documented
- [x] Usage examples provided
- [ ] Frontend documentation (pending)
- [ ] Integration guide (pending)

---

**Phase 6 Backend Status:** ✅ **COMPLETE**
**Ready for:** Frontend Implementation

**Total Backend Progress:** ~50% of Phase 6
