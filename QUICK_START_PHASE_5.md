# Phase 5 Order Management - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration (1 min)

```bash
cd backend
psql -U postgres -d timber_mart_crm -f migrations/005_create_order_management_tables.sql
```

**Expected Output:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
INSERT 0 5  # Sample items inserted
```

### Step 2: Start Backend (30 sec)

```bash
cd backend
npm run dev
```

**Look for:**
```
✓ Database connection successful
Setting up model associations...
✓ Model associations configured
✓ Database models synced
✓ Server running on http://localhost:5000
```

### Step 3: Start Frontend (30 sec)

```bash
# New terminal
cd frontend
npm run dev
```

**Look for:**
```
VITE ready in 500ms
➜  Local:   http://localhost:5173/
```

### Step 4: Access Application (1 min)

1. Open: `http://localhost:5173`
2. Login with your admin account
3. Click **"Orders"** in the navigation menu
4. Click **"+ Create Order"** button

### Step 5: Create Your First Order (2 min)

1. **Select Customer** (required)
2. **Add Items:**
   - Start typing in "Add Item" search box
   - Select item from dropdown
   - Adjust quantity/price/discount
   - Click "+ Add" for more items
3. **Review Totals** (auto-calculated)
4. Click **"Create Order"**

✅ **Done!** Your first order is created.

---

## 📋 What You Can Do Now

### Order Operations
- ✅ Create orders with multiple items
- ✅ Edit existing orders
- ✅ View order details
- ✅ Change order status (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)
- ✅ Track payment status (UNPAID → PARTIAL → PAID)
- ✅ Delete orders
- ✅ Search and filter orders
- ✅ Link orders to projects

### Item Catalog
- ✅ Search items (autocomplete)
- ✅ View item prices
- ✅ Add new items (via API)
- ✅ See Urdu names (if available)

---

## 🔍 Testing Features

### Test Autocomplete Search
1. In order form, type "cement" in item search
2. See results appear instantly
3. Click item to add

### Test Calculations
1. Add item with quantity 10, price 100
2. See total = 1000
3. Add 10% discount
4. See discount amount = 100, final = 900
5. Order totals update automatically

### Test Filters
1. Go to Orders list
2. Use search box (search by Order ID or notes)
3. Filter by status
4. Filter by payment status
5. Use date range filters

### Test Status Change
1. Open order details
2. Click "Change Status" button
3. Select new status
4. See badge update

---

## 📊 Sample Data

The migration includes 5 sample items:

| Item | Name | Category | Price | Unit |
|------|------|----------|-------|------|
| 1 | Cement Bag | Construction | ₨950.00 | bag |
| 2 | Steel Rod 10mm | Steel | ₨280.00 | kg |
| 3 | Bricks | Construction | ₨18.00 | piece |
| 4 | Sand | Construction | ₨85.00 | cft |
| 5 | Gravel | Construction | ₨95.00 | cft |

Try creating an order with these items!

---

## 🐛 Quick Troubleshooting

### Issue: Can't see Orders menu
**Fix:** Check user permissions. Admin role should have all permissions.

### Issue: Autocomplete not working
**Fix:**
1. Type at least 2 characters
2. Check items exist in database
3. Check console for errors

### Issue: Totals not calculating
**Fix:** Refresh page. Check console for JavaScript errors.

### Issue: Can't create order
**Fix:**
1. Select a customer (required)
2. Add at least one item (required)
3. Check all fields are valid

---

## 📁 File Locations

**Quick Reference:**

```
Backend Routes:
- /api/orders  → backend/routes/orders.js
- /api/items   → backend/routes/items.js

Frontend Pages:
- Orders Page  → frontend/src/pages/OrdersPage.jsx

Components:
- Order List   → frontend/src/components/features/OrderList.jsx
- Order Form   → frontend/src/components/features/OrderForm.jsx
- Order Detail → frontend/src/components/features/OrderDetail.jsx

Services:
- Order API    → frontend/src/services/orderService.js
- Item API     → frontend/src/services/itemService.js

Database:
- Migration    → backend/migrations/005_create_order_management_tables.sql
```

---

## 🔗 API Quick Reference

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "item_id": 1,
        "quantity": 10,
        "unit_price": 950,
        "discount_percent": 0
      }
    ]
  }'
```

### Get Orders
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Items
```bash
curl "http://localhost:5000/api/items/search?q=cement" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts and loads
- [ ] Can login successfully
- [ ] Orders menu visible
- [ ] Can open Orders page
- [ ] Can click Create Order
- [ ] Customer dropdown works
- [ ] Item search works
- [ ] Can add items to order
- [ ] Totals calculate correctly
- [ ] Can save order
- [ ] Order appears in list
- [ ] Can view order details
- [ ] Can change status
- [ ] Can edit order
- [ ] Can delete order

---

## 📚 Full Documentation

For complete details, see:

1. **[PHASE_5_FINAL_DOCUMENTATION.md](PHASE_5_FINAL_DOCUMENTATION.md)** - Complete guide
2. **[PHASE_5_ORDER_MANAGEMENT.md](PHASE_5_ORDER_MANAGEMENT.md)** - Backend API
3. **[PHASE_5_FRONTEND_COMPLETE.md](PHASE_5_FRONTEND_COMPLETE.md)** - Frontend components

---

## 🎯 Next Steps

After testing Phase 5:

1. **Add more items** to catalog (via API or database)
2. **Create real orders** for your customers
3. **Test offline mode** (disconnect internet, create order, reconnect)
4. **Explore filters** and search features
5. **Review reports** (if implemented)
6. **Plan Phase 6** (Payment Management)

---

**Happy Testing! 🚀**

The Order Management System is ready to use. Start creating orders and managing your business efficiently!

---

**Need Help?** Check the troubleshooting section in [PHASE_5_FINAL_DOCUMENTATION.md](PHASE_5_FINAL_DOCUMENTATION.md)
