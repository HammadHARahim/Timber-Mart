// ============================================================================
// Payment Detail Page - Matches OrderDetail visual pattern
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  ShoppingCart as OrderIcon,
  Business as ProjectIcon,
  Receipt as ReceiptIcon,
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
    navigate('/payments', { state: { editPaymentId: id } });
  };

  const getPaymentTypeInfo = (type) => {
    const types = {
      PAYMENT: { label: 'Payment', color: 'success' },
      ADVANCE: { label: 'Advance', color: 'info' },
      LOAN: { label: 'Loan', color: 'warning' },
      REFUND: { label: 'Refund', color: 'error' },
    };
    return types[type] || types.PAYMENT;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      CASH: 'Cash',
      CHECK: 'Check',
      BANK_TRANSFER: 'Bank Transfer',
      ONLINE: 'Online Payment',
    };
    return methods[method] || method;
  };

  if (loading) {
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
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !payment) {
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
        onClick={handleClose}
      >
        <Alert severity="error">{error || 'Payment not found'}</Alert>
      </Box>
    );
  }

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
      onClick={handleClose}
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
                Payment Details
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {payment.payment_id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={handleClose}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Payment Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Payment Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Type:
                </Typography>
                <Chip
                  label={getPaymentTypeInfo(payment.payment_type).label}
                  size="small"
                  color={getPaymentTypeInfo(payment.payment_type).color}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Method:
                </Typography>
                <Chip
                  label={getPaymentMethodLabel(payment.payment_method)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              {payment.status && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status:
                  </Typography>
                  <Chip
                    label={payment.status}
                    size="small"
                    color={
                      payment.status === 'APPROVED' ? 'success' :
                      payment.status === 'PENDING' ? 'warning' : 'default'
                    }
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Date:
                </Typography>
                <Typography variant="body1">
                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Typography>
              </Grid>
              {payment.reference_number && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reference Number:
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
                    {payment.reference_number}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Amount */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Amount
            </Typography>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Amount:
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      Rs. {parseFloat(payment.amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Related Entities */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Related Information
            </Typography>
            <Grid container spacing={2}>
              {payment.customer && (
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/customers/${payment.customer.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
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
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/orders/${payment.order.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <OrderIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
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
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/projects/${payment.project.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ProjectIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
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
          </Box>

          {/* Check Information (if payment method is CHECK) */}
          {payment.payment_method === 'CHECK' && payment.check && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Check Information
                </Typography>
                <Card variant="outlined" sx={{ bgcolor: 'info.light' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Check Number:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.check.check_number || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Bank:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.check.bank_name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Due Date:
                        </Typography>
                        <Typography variant="body1">
                          {payment.check.due_date ? new Date(payment.check.due_date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status:
                        </Typography>
                        <Chip label={payment.check.status} size="small" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}

          {/* Notes */}
          {payment.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{payment.notes}</Typography>
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
              {payment.created_by && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created By:
                  </Typography>
                  <Typography variant="body1">
                    {payment.created_by.username || payment.created_by.email}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              {payment.updated_at && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(payment.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sync Status:
                </Typography>
                <Chip
                  label={payment.sync_status || 'SYNCED'}
                  size="small"
                  color={payment.sync_status === 'SYNCED' ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
