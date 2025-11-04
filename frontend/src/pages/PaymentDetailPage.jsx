// ============================================================================
// Payment Detail Page - Drawer-based detail view
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  ShoppingCart as OrderIcon,
  Business as ProjectIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/payments/${id}`);
      if (response.success) {
        setPayment(response.data);
      }
    } catch (err) {
      console.error('Error fetching payment:', err);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/payments');
  };

  const handleEdit = () => {
    navigate(`/payments/edit/${id}`);
  };

  const getPaymentTypeInfo = (type) => {
    const types = {
      PAYMENT: { label: 'Payment', color: 'success', icon: '💰' },
      ADVANCE: { label: 'Advance', color: 'info', icon: '⬆️' },
      LOAN: { label: 'Loan', color: 'warning', icon: '💳' },
      REFUND: { label: 'Refund', color: 'error', icon: '↩️' },
    };
    return types[type] || types.PAYMENT;
  };

  const getPaymentMethodInfo = (method) => {
    const methods = {
      CASH: { label: 'Cash', icon: '💵' },
      CHECK: { label: 'Check', icon: '🧾' },
      BANK_TRANSFER: { label: 'Bank Transfer', icon: '🏦' },
      ONLINE: { label: 'Online', icon: '💻' },
    };
    return methods[method] || { label: method, icon: '💳' };
  };

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: '70%', lg: '40%' },
          maxWidth: 700,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'success.main',
          color: 'success.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          <Typography variant="h6" fontWeight={600}>
            Payment Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleEdit} sx={{ color: 'inherit' }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : payment ? (
          <>
            {/* Main Info */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {payment.payment_id}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${getPaymentTypeInfo(payment.payment_type).icon} ${getPaymentTypeInfo(payment.payment_type).label}`}
                      size="small"
                      color={getPaymentTypeInfo(payment.payment_type).color}
                    />
                    <Chip
                      label={`${getPaymentMethodInfo(payment.payment_method).icon} ${getPaymentMethodInfo(payment.payment_method).label}`}
                      size="small"
                      variant="outlined"
                    />
                    {payment.status && (
                      <Chip
                        label={payment.status}
                        size="small"
                        color={payment.status === 'APPROVED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'default'}
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Amount
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    Rs. {parseFloat(payment.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Related Entities */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {payment.customer && (
                  <Grid item xs={12}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/customers/${payment.customer.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PersonIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Customer
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.customer.name}
                        </Typography>
                        {payment.customer.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {payment.customer.phone}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {payment.order && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/orders/${payment.order.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <OrderIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Order
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.order.order_id}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {payment.project && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/projects/${payment.project.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <ProjectIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Project
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.project.project_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Check Details (if payment method is CHECK) */}
              {payment.payment_method === 'CHECK' && payment.check && (
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'info.light', borderColor: 'info.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckIcon color="info" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Check Information
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Check Number
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.check.check_number || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Bank
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.check.bank_name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body2">
                          {payment.check.due_date ? new Date(payment.check.due_date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body2">
                          <Chip label={payment.check.status} size="small" />
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Payment Date */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Payment Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Notes */}
              {payment.notes && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Notes
                    </Typography>
                    <Typography variant="body2">{payment.notes}</Typography>
                  </CardContent>
                </Card>
              )}

              {/* Reference Number */}
              {payment.reference_number && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Reference Number
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {payment.reference_number}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {payment.updated_at && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Updated: {new Date(payment.updated_at).toLocaleString()}
                </Typography>
              )}
              {payment.created_by && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Created By: {payment.created_by.username || payment.created_by.email}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ m: 2 }}>
            Payment not found
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}
