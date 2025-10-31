# Phase 6 Test Template - Professional Delivery Token

## Overview

A professionally designed delivery token template has been created for testing Phase 6 printing functionality. The template includes all Phase 6 features:
- QR Code display
- Customer information
- Vehicle and driver details
- Company branding
- Special instructions/notes
- Print-ready formatting

## Files Created

### 1. **Complete HTML Template**
**File**: `test_token_template.html`
- Full standalone HTML file with embedded CSS
- Can be opened directly in a browser for preview
- Use this for visual testing without the backend

### 2. **HTML Content Only**
**File**: `test_token_template_content.html`
- Pure HTML template content without CSS
- This is what goes in the `html_content` field in database
- Contains all placeholder tags (e.g., `{{token_id}}`, `{{customer_name}}`)

### 3. **CSS Styles Only**
**File**: `test_token_template_styles.css`
- Separated stylesheet
- This is what goes in the `css_content` field in database
- Professional styling with print media queries

### 4. **Database Insert Script**
**File**: `insert_test_template.sql`
- SQL script to insert template into `print_templates` table
- Already executed - template is now in database
- Template ID: `TOKEN-TEST-001`

## Template Features

### Design Elements
✅ Professional header with gradient background
✅ Large, prominent token ID display
✅ Organized sections with icons
✅ Grid layout for vehicle/driver information
✅ QR code with border and styling
✅ Notes section with yellow highlight
✅ Footer with company information
✅ Print-ready with proper page breaks
✅ Responsive design

### Placeholders Supported

**Company Information**:
- `{{company_name}}` - Company name
- `{{company_address}}` - Company address
- `{{company_phone}}` - Company phone
- `{{company_email}}` - Company email
- `{{company_logo}}` - Company logo URL (optional)

**Token Information**:
- `{{token_id}}` - Unique token identifier
- `{{date}}` - Issue date
- `{{time}}` - Issue time

**Customer Information**:
- `{{customer_name}}` - Customer name
- `{{project_name}}` - Project/site name
- `{{delivery_address}}` - Delivery address

**Vehicle & Driver**:
- `{{vehicle_number}}` - Vehicle registration number
- `{{vehicle_type}}` - Type of vehicle (truck, loader, etc.)
- `{{driver_name}}` - Driver name
- `{{driver_phone}}` - Driver phone number

**Other**:
- `{{notes}}` - Special instructions or notes
- `{{qr_code}}` - QR code data URL (base64 image)

## Testing Instructions

### 1. Visual Preview (Browser)
```bash
# Open the complete HTML file in your browser
open test_token_template.html
# or
firefox test_token_template.html
# or
google-chrome test_token_template.html
```

### 2. Test via Backend API

The template is now in your database with ID: `TOKEN-TEST-001`

**Create a test token**:
```bash
curl -X POST http://localhost:5001/api/tokens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer Ltd",
    "project_name": "Building Site A",
    "vehicle_number": "ABC-1234",
    "vehicle_type": "Truck",
    "driver_name": "John Doe",
    "driver_phone": "+92-300-1234567",
    "delivery_address": "123 Main Street, Karachi",
    "notes": "Handle with care. Fragile items included.",
    "template_id": 1
  }'
```

**Generate print data for token**:
```bash
curl -X POST http://localhost:5001/api/print/token/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test via Frontend

1. Navigate to **Tokens** page in the application
2. Click **"Create Token"** button
3. Fill in the form:
   - Customer Name: Test Customer
   - Vehicle Number: ABC-123
   - Driver Name: John Smith
   - Driver Phone: 1234567890
4. Click **"Create Token"**
5. View the token in the list
6. Click **"Print"** or **"Preview"** to see the rendered template

### 4. Test Template Editor

1. Navigate to **Templates** page
2. Find "Professional Delivery Token" template
3. Click **"Edit"** to modify
4. Test placeholder insertion
5. Preview changes in real-time

## Template Specifications

| Property | Value |
|----------|-------|
| **Type** | TOKEN |
| **Page Size** | A4 (210mm × 297mm) |
| **Orientation** | Portrait |
| **Margins** | 20mm all sides |
| **Print Ready** | Yes ✅ |
| **Responsive** | Yes ✅ |
| **QR Code Size** | 150px × 150px |

## Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Header Background | Dark Blue | #2c3e50 |
| Accent Color | Blue | #3498db |
| Token ID | Red | #e74c3c |
| Notes Background | Yellow | #fff9e6 |
| Success Badge | Green | #27ae60 |
| Footer | Dark Gray | #34495e |

## Customization Guide

### Change Header Color
Edit CSS line 23-24:
```css
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARK 100%);
```

### Change Token ID Color
Edit CSS line 77:
```css
color: #YOUR_COLOR;
```

### Adjust Page Size
Edit CSS `@page` rule (line 211):
```css
@page {
    size: A4; /* Change to Letter, Legal, etc. */
    margin: 10mm;
}
```

### Modify Grid Layout
Edit CSS line 103:
```css
grid-template-columns: repeat(2, 1fr); /* Change 2 to 3 for 3 columns */
```

## Print Testing

### Print to PDF
1. Open rendered token in browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Verify:
   - ✅ No content cut off
   - ✅ QR code visible
   - ✅ Colors properly rendered
   - ✅ Text readable

### Print to Thermal Printer
If using thermal printer (58mm or 80mm):
1. Modify template for thermal format
2. Remove colored backgrounds (thermal printers are usually monochrome)
3. Adjust width to match printer paper width
4. Test with actual printer hardware

## Troubleshooting

### Issue: Placeholders not replaced
**Solution**: Ensure backend is using `printService.replacePlaceholders()` method

### Issue: QR code not displaying
**Solution**: Check that QR code is generated as base64 data URL with format:
```
data:image/png;base64,iVBORw0KG...
```

### Issue: Layout breaks on print
**Solution**: Check `@media print` rules in CSS and ensure `page-break-inside: avoid`

### Issue: Template not appearing in dropdown
**Solution**: Verify template `is_active = true` in database:
```sql
UPDATE print_templates
SET is_active = true
WHERE template_id = 'TOKEN-TEST-001';
```

## Database Verification

Check template exists:
```sql
SELECT template_id, name, type, is_active
FROM print_templates
WHERE type = 'TOKEN';
```

View full template:
```sql
SELECT * FROM print_templates
WHERE template_id = 'TOKEN-TEST-001';
```

## Next Steps

1. ✅ Template created and inserted into database
2. ✅ Ready for testing in frontend application
3. ⏳ Create test tokens and verify rendering
4. ⏳ Test print functionality
5. ⏳ Customize colors/branding as needed
6. ⏳ Create additional templates for INVOICE, RECEIPT, VOUCHER types

## Support

For issues or questions:
- Check backend logs: `tail -f backend/logs/app.log`
- Check frontend console: Browser DevTools Console
- Review API responses: Network tab in DevTools
- Verify database data: PostgreSQL queries

---

**Created**: 2025-10-19
**Template ID**: TOKEN-TEST-001
**Phase**: 6 - Printing & Token Management
**Status**: ✅ Ready for Testing
