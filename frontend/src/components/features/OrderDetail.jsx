// ============================================================================
// FILE: src/components/features/OrderDetail.jsx
// Order detail view component with complete information
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import StatusBadge from '../shared/StatusBadge.jsx';
import OrderItemsTable from './OrderItemsTable.jsx';

export default function OrderDetail({
  order,
  onEdit,
  onStatusChange,
  onClose,
  canEdit,
  onAddPayment
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'PENDING');
  const [paymentData, setPaymentData] = useState({
    amount: order?.balance_amount || 0,
    payment_method: 'CASH',
    notes: ''
  });

  if (!order) {
    return <div className="empty-state">Order not found</div>;
  }

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus);
    }
    setShowStatusModal(false);
  };

  const handleAddPayment = () => {
    if (onAddPayment) {
      onAddPayment({
        order_id: order.id,
        customer_id: order.customer_id,
        project_id: order.project_id,
        ...paymentData,
        payment_type: 'PAYMENT'
      });
      setShowPaymentModal(false);
    }
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ py: 3 }}>
      <Paper elevation={0} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Order Details
            </Typography>
            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
              {order.order_id}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={onClose}
            >
              Back
            </Button>
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(order)}
              >
                Edit
              </Button>
            )}
            {parseFloat(order.balance_amount) > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<PaymentIcon />}
                onClick={() => setShowPaymentModal(true)}
              >
                Add Payment
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Status and Payment Information */}
        <div className="detail-section">
          <h3>Status Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Order Status:</label>
              <div className="status-display">
                <StatusBadge status={order.status} type="order" />
                {canEdit && (
                  <button
                    className="btn-link"
                    onClick={() => setShowStatusModal(true)}
                  >
                    Change Status
                  </button>
                )}
              </div>
            </div>
            <div className="info-item">
              <label>Payment Status:</label>
              <StatusBadge status={order.payment_status} type="payment" />
            </div>
            <div className="info-item">
              <label>Order Date:</label>
              <span>{new Date(order.order_date).toLocaleDateString()}</span>
            </div>
            {order.delivery_date && (
              <div className="info-item">
                <label>Delivery Date:</label>
                <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer and Project Information */}
        <div className="detail-section">
          <h3>Customer & Project</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Customer:</label>
              <div>
                <div className="customer-name">{order.customer?.name || 'N/A'}</div>
                <div className="customer-details">
                  {order.customer?.phone && <span>Phone: {order.customer.phone}</span>}
                  {order.customer?.email && <span>Email: {order.customer.email}</span>}
                </div>
              </div>
            </div>
            {order.project && (
              <div className="info-item">
                <label>Project:</label>
                <div>
                  <div className="project-name">{order.project.name}</div>
                  <div className="project-id">{order.project.project_id}</div>
                </div>
              </div>
            )}
            {order.delivery_address && (
              <div className="info-item full-width">
                <label>Delivery Address:</label>
                <span>{order.delivery_address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-section">
          <h3>Order Items</h3>
          <OrderItemsTable items={order.items || []} readOnly={true} />
        </div>

        {/* Financial Summary */}
        <div className="detail-section financial-summary">
          <h3>Financial Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Total Amount:</label>
              <span className="amount">₨{parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Total Discount:</label>
              <span className="amount discount">-₨{parseFloat(order.discount_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Final Amount:</label>
              <span className="amount final">₨{parseFloat(order.final_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Paid Amount:</label>
              <span className="amount paid">₨{parseFloat(order.paid_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item highlight">
              <label>Balance Due:</label>
              <span className="amount balance">₨{parseFloat(order.balance_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <div className="notes-content">{order.notes}</div>
          </div>
        )}

        {/* Metadata */}
        <div className="detail-section metadata">
          <h3>Additional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created By:</label>
              <span>{order.creator?.full_name || order.creator?.username || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Created At:</label>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.updated_at && (
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(order.updated_at).toLocaleString()}</span>
              </div>
            )}
            <div className="info-item">
              <label>Sync Status:</label>
              <span className={`sync-status sync-${order.sync_status?.toLowerCase()}`}>
                {order.sync_status || 'SYNCED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Dialog
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Change Order Status
            <IconButton onClick={() => setShowStatusModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status:
              </Typography>
              <StatusBadge status={order.status} type="order" />
            </Box>
            <Select
              fullWidth
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={selectedStatus === order.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Modal */}
      <Dialog
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add Payment
            <IconButton onClick={() => setShowPaymentModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order Balance:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">
                ₨{parseFloat(order.balance_amount || 0).toFixed(2)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) => handlePaymentChange('amount', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
            <Select
              fullWidth
              value={paymentData.payment_method}
              onChange={(e) => handlePaymentChange('payment_method', e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CHECK">Check</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="ONLINE">Online Payment</MenuItem>
            </Select>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={paymentData.notes}
              onChange={(e) => handlePaymentChange('notes', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAddPayment}
            disabled={!paymentData.amount || paymentData.amount <= 0}
          >
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </Box>
  );
}
