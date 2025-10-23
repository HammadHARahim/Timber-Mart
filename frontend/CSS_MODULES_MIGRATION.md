# CSS Modules Migration Guide

## Overview
The entire Timber Mart CRM web application has been migrated from global CSS to CSS Modules for better style scoping and maintainability.

## What Changed

### File Naming Convention
All CSS files have been renamed from `.css` to `.module.css`:
- `CustomersPage.css` → `CustomersPage.module.css`
- `UserList.css` → `UserList.module.css`
- etc.

### CSS Class Names
All CSS class names were converted from kebab-case to camelCase:
- `customer-list` → `customerList`
- `btn-primary` → `btnPrimary`
- `page-header` → `pageHeader`
- `user-info` → `userInfo`
- etc.

### Import Syntax
**Before:**
```javascript
import '../styles/CustomersPage.css';
```

**After:**
```javascript
import styles from '../styles/CustomersPage.module.css';
```

### className Usage
**Before:**
```jsx
<div className="customers-page">
  <button className="btn-primary">Click Me</button>
</div>
```

**After:**
```jsx
<div className={styles.customersPage}>
  <button className={styles.btnPrimary}>Click Me</button>
</div>
```

### Dynamic Classes
**Before:**
```jsx
<span className={`badge ${isActive ? 'active' : 'inactive'}`}>
  Status
</span>
```

**After:**
```jsx
<span className={`${styles.badge} ${isActive ? styles.active : styles.inactive}`}>
  Status
</span>
```

## Converted Files

### Pages
- ✅ `pages/CustomersPage.jsx` → `styles/CustomersPage.module.css`
- ✅ `pages/UsersPage.jsx` → `styles/UsersPage.module.css`
- ✅ `pages/Dashboard.jsx` → `styles/Dashboard.module.css`
- ✅ `pages/LoginPage.jsx` → `styles/LoginPage.module.css`

### Components
- ✅ `components/features/CustomerList.jsx` → `styles/CustomerList.module.css`
- ✅ `components/features/CustomerForm.jsx` → `styles/CustomerForm.module.css`
- ✅ `components/features/UserList.jsx` → `styles/UserList.module.css`
- ✅ `components/features/UserForm.jsx` → `styles/UserForm.module.css`
- ✅ `components/shared/MainLayout.jsx` → `styles/MainLayout.module.css`

## Benefits

1. **Scoped Styles**: CSS classes are automatically scoped to their components, preventing naming conflicts
2. **Type Safety**: Can use TypeScript to type-check CSS class names
3. **Better Maintainability**: Clear relationship between components and their styles
4. **Smaller Bundles**: Unused styles can be tree-shaken during build
5. **No Global Pollution**: Styles don't leak between components

## Development Notes

- Vite automatically supports CSS Modules - no additional configuration needed
- CSS Module class names are transformed at build time: `.myClass` becomes something like `.MyComponent_myClass__a1b2c`
- Global styles (like `:root` variables) remain in `index.css` which is not a module
- All custom properties (CSS variables) continue to work as expected

## Testing Checklist

- [x] Customers page renders correctly
- [x] Users page renders correctly
- [x] Dashboard renders correctly
- [x] Login page renders correctly
- [x] Customer form modal works
- [x] User form modal works
- [x] All buttons styled correctly
- [x] Hover states working
- [x] Responsive design intact

## Rollback Instructions

If needed, you can rollback by:
1. Renaming `.module.css` files back to `.css`
2. Changing imports from `import styles from '...'` to `import '...'`
3. Changing all `className={styles.className}` back to `className="class-name"`
4. Converting camelCase class names back to kebab-case in CSS files

However, this is **not recommended** as CSS Modules provide significant benefits.
