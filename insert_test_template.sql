-- ============================================================================
-- Insert Professional Test Template for Phase 6 Token Printing
-- ============================================================================

-- First, remove any existing test template
DELETE FROM print_templates WHERE name = 'Professional Delivery Token';

-- Insert the new professional template
INSERT INTO print_templates (
    template_id,
    name,
    description,
    type,
    html_content,
    css_content,
    page_size,
    orientation,
    margin_top,
    margin_right,
    margin_bottom,
    margin_left,
    is_default,
    is_active,
    version,
    created_at,
    updated_at
) VALUES (
    'TOKEN-TEST-001',
    'Professional Delivery Token',
    'Professional delivery token template with QR code, customer info, and vehicle details',
    'TOKEN',
    -- HTML Content
    '<div class="token-container">
    <div class="token-header">
        <div class="company-name">{{company_name}}</div>
        <div class="company-tagline">Quality Timber & Building Materials</div>
        <div class="token-title">🚚 DELIVERY TOKEN</div>
    </div>
    <div class="token-id-section">
        <div class="token-id">{{token_id}}</div>
        <div class="token-date">📅 Issue Date: {{date}} | ⏰ Time: {{time}}</div>
    </div>
    <div class="token-body">
        <div class="info-section">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-grid">
                <div class="info-item full-width">
                    <div class="info-label">Customer Name</div>
                    <div class="info-value large">{{customer_name}}</div>
                </div>
                <div class="info-item full-width">
                    <div class="info-label">Project/Site Name</div>
                    <div class="info-value">{{project_name}}</div>
                </div>
                <div class="info-item full-width">
                    <div class="info-label">Delivery Address</div>
                    <div class="info-value">{{delivery_address}}</div>
                </div>
            </div>
        </div>
        <div class="info-section">
            <div class="section-title">🚛 Vehicle & Driver Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Vehicle Number</div>
                    <div class="info-value">{{vehicle_number}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Vehicle Type</div>
                    <div class="info-value">{{vehicle_type}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Driver Name</div>
                    <div class="info-value">{{driver_name}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Driver Phone</div>
                    <div class="info-value">{{driver_phone}}</div>
                </div>
            </div>
        </div>
        <div class="qr-section">
            <img src="{{qr_code}}" alt="QR Code" class="qr-code">
            <div class="qr-label">Scan for Details</div>
        </div>
        <div class="notes-section">
            <div class="notes-title">📝 Special Instructions</div>
            <div class="notes-content">{{notes}}</div>
        </div>
    </div>
    <div class="token-footer">
        <div class="footer-left">
            <div><strong>{{company_name}}</strong></div>
            <div class="contact-info">
                📍 {{company_address}}<br>
                📞 {{company_phone}} | ✉️ {{company_email}}
            </div>
        </div>
        <div class="footer-right">
            <div class="status-badge">ACTIVE</div>
            <div style="margin-top: 8px; font-size: 10px;">
                Powered by Timber Mart CRM
            </div>
        </div>
    </div>
</div>',
    -- CSS Content
    '* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    padding: 20mm;
    color: #333;
}

.token-container {
    max-width: 210mm;
    margin: 0 auto;
    border: 3px solid #2c3e50;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.token-header {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    padding: 25px 30px;
    text-align: center;
}

.company-name {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.company-tagline {
    font-size: 12px;
    opacity: 0.9;
    margin-bottom: 15px;
}

.token-title {
    font-size: 24px;
    font-weight: bold;
    background: #e74c3c;
    color: white;
    padding: 10px;
    margin-top: 15px;
    border-radius: 5px;
    letter-spacing: 1px;
}

.token-id-section {
    background: #ecf0f1;
    padding: 20px;
    text-align: center;
    border-bottom: 2px dashed #95a5a6;
}

.token-id {
    font-size: 32px;
    font-weight: bold;
    color: #e74c3c;
    letter-spacing: 3px;
    margin-bottom: 10px;
    font-family: Courier New, monospace;
}

.token-date {
    font-size: 14px;
    color: #7f8c8d;
}

.token-body {
    padding: 30px;
}

.info-section {
    margin-bottom: 25px;
}

.section-title {
    font-size: 14px;
    font-weight: bold;
    color: #2c3e50;
    text-transform: uppercase;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #3498db;
    letter-spacing: 1px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.info-item {
    padding: 12px;
    background: #f8f9fa;
    border-left: 4px solid #3498db;
    border-radius: 4px;
}

.info-label {
    font-size: 11px;
    color: #7f8c8d;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 5px;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 16px;
    color: #2c3e50;
    font-weight: 600;
}

.info-value.large {
    font-size: 18px;
}

.qr-section {
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 25px;
}

.qr-code {
    width: 150px;
    height: 150px;
    margin: 0 auto;
    border: 3px solid #2c3e50;
    border-radius: 8px;
    padding: 10px;
    background: white;
}

.qr-label {
    margin-top: 10px;
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 600;
}

.notes-section {
    margin-top: 25px;
    padding: 15px;
    background: #fff9e6;
    border-left: 4px solid #f39c12;
    border-radius: 4px;
}

.notes-title {
    font-size: 12px;
    font-weight: bold;
    color: #f39c12;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.notes-content {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
}

.token-footer {
    background: #34495e;
    color: white;
    padding: 15px 30px;
    font-size: 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-left {
    text-align: left;
}

.footer-right {
    text-align: right;
}

.contact-info {
    margin-top: 5px;
    opacity: 0.9;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.status-badge {
    display: inline-block;
    padding: 5px 15px;
    background: #27ae60;
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
}

@media print {
    body {
        padding: 0;
        background: white;
    }
    .token-container {
        box-shadow: none;
        border: 2px solid #2c3e50;
        page-break-inside: avoid;
    }
    @page {
        size: A4;
        margin: 10mm;
    }
}',
    'A4',
    'PORTRAIT',
    20,
    20,
    20,
    20,
    false,
    true,
    1,
    NOW(),
    NOW()
);

-- Verify insertion
SELECT
    template_id,
    name,
    type,
    is_active,
    is_default,
    page_size,
    orientation,
    created_at
FROM print_templates
WHERE template_id = 'TOKEN-TEST-001';
