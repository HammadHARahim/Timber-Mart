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
  CheckCircle as ConfirmIcon,
  PlayArrow as InProgressIcon,
  Done as CompleteIcon,
  Cancel as CancelIcon,
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: order?.balance_amount || 0,
    payment_method: 'CASH',
    notes: ''
  });

  if (!order) {
    return <div className="empty-state">Order not found</div>;
  }

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
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 2,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          maxWidth: 1200,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 24,
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
            margin: '8px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: '10px',
            border: '2px solid',
            borderColor: 'background.paper',
            '&:hover': {
              bgcolor: 'grey.600',
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Paper elevation={0} sx={{ p: 4 }}>
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
              {canEdit && !(order.payment_status === 'PAID' && order.status === 'CONFIRMED') && (
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Status Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order Status:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <StatusBadge status={order.status} type="order" />
                  {canEdit && !(order.payment_status === 'PAID' && order.status === 'CONFIRMED') && (
                    <>
                      {order.status !== 'CONFIRMED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          startIcon={<ConfirmIcon />}
                          onClick={() => onStatusChange(order.id, 'CONFIRMED')}
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status !== 'IN_PROGRESS' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<InProgressIcon />}
                          onClick={() => onStatusChange(order.id, 'IN_PROGRESS')}
                        >
                          In Progress
                        </Button>
                      )}
                      {order.status !== 'COMPLETED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<CompleteIcon />}
                          onClick={() => onStatusChange(order.id, 'COMPLETED')}
                        >
                          Delivered
                        </Button>
                      )}
                      {order.status !== 'CANCELLED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => onStatusChange(order.id, 'CANCELLED')}
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Status:
                </Typography>
                <StatusBadge status={order.payment_status} type="payment" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order Date:
                </Typography>
                <Typography variant="body1">
                  {new Date(order.order_date).toLocaleDateString()}
                </Typography>
              </Grid>
              {order.delivery_date && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Delivery Date:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer and Project Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Customer & Project
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Customer:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.customer?.name || 'N/A'}
                </Typography>
                {order.customer?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {order.customer.phone}
                  </Typography>
                )}
                {order.customer?.email && (
                  <Typography variant="body2" color="text.secondary">
                    Email: {order.customer.email}
                  </Typography>
                )}
              </Grid>
              {order.project && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {order.project.project_id}
                  </Typography>
                </Grid>
              )}
              {order.delivery_address && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Delivery Address:
                  </Typography>
                  <Typography variant="body1">
                    {order.delivery_address}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Order Items */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Order Items
            </Typography>
            <OrderItemsTable items={order.items || []} readOnly={true} />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Financial Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Financial Summary
            </Typography>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ₨{parseFloat(order.total_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Discount:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      -₨{parseFloat(order.discount_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Final Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ₨{parseFloat(order.final_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  {parseFloat(order.credit_applied || 0) > 0 && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Credit Applied:
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="info.main">
                        ₨{parseFloat(order.credit_applied || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Paid Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      ₨{parseFloat(order.paid_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Balance Due:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={parseFloat(order.balance_amount) > 0 ? 'error.main' : 'success.main'}
                    >
                      ₨{parseFloat(order.balance_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Notes */}
          {order.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{order.notes}</Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* Metadata */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created By:
                </Typography>
                <Typography variant="body1">
                  {order.creator?.full_name || order.creator?.username || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {new Date(order.created_at).toLocaleString()}
                </Typography>
              </Grid>
              {order.updated_at && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sync Status:
                </Typography>
                <Chip
                  label={order.sync_status || 'SYNCED'}
                  size="small"
                  color={order.sync_status === 'SYNCED' ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

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
    </Box>
  );
}
