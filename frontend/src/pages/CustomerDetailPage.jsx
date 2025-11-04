// ============================================================================
// Customer Detail Page - Matches OrderDetail visual pattern
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedData, setRelatedData] = useState({
    orders: [],
    projects: [],
    payments: [],
  });

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const customerRes = await api.get(`/api/customers/${id}`);
      if (customerRes.success) {
        setCustomer(customerRes.data);

        // Fetch related data
        const [ordersRes, projectsRes, paymentsRes] = await Promise.all([
          api.get(`/api/orders?customer_id=${id}`),
          api.get(`/api/projects?customer_id=${id}`),
          api.get(`/api/payments?customer_id=${id}`),
        ]);

        setRelatedData({
          orders: ordersRes.success ? ordersRes.data : [],
          projects: projectsRes.success ? projectsRes.data : [],
          payments: paymentsRes.success ? paymentsRes.data : [],
        });
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/customers');
  };

  const handleEdit = () => {
    // Navigate back to list with edit mode (you can implement this)
    navigate('/customers', { state: { editCustomerId: id } });
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

  if (error || !customer) {
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
        <Alert severity="error">{error || 'Customer not found'}</Alert>
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
                Customer Details
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {customer.customer_id}
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

          {/* Customer Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Customer Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {customer.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type:
                </Typography>
                <Chip
                  label={customer.customer_type || 'REGULAR'}
                  size="small"
                  color={customer.customer_type === 'VIP' ? 'success' : 'default'}
                />
              </Grid>
              {customer.phone && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <PhoneIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Phone:
                  </Typography>
                  <Typography variant="body1">
                    {customer.phone}
                  </Typography>
                </Grid>
              )}
              {customer.email && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {customer.email}
                  </Typography>
                </Grid>
              )}
              {customer.business_name && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <BusinessIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Business Name:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {customer.business_name}
                  </Typography>
                </Grid>
              )}
              {customer.address && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Address:
                  </Typography>
                  <Typography variant="body1">
                    {customer.address}
                  </Typography>
                </Grid>
              )}
            </Grid>
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
                      Current Balance:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={parseFloat(customer.balance || 0) > 0 ? 'error.main' : 'success.main'}
                    >
                      Rs. {parseFloat(customer.balance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Orders:
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {relatedData.orders.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Projects:
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {relatedData.projects.length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Notes */}
          {customer.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{customer.notes}</Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* Related Orders */}
          {relatedData.orders.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Orders ({relatedData.orders.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatedData.orders.slice(0, 5).map((order) => (
                        <TableRow
                          key={order.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <TableCell>{order.order_id}</TableCell>
                          <TableCell>
                            {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip label={order.status} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            Rs. {parseFloat(order.final_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* Related Projects */}
          {relatedData.projects.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Projects ({relatedData.projects.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Project Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatedData.projects.slice(0, 5).map((project) => (
                        <TableRow
                          key={project.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <TableCell>{project.project_name}</TableCell>
                          <TableCell>
                            <Chip label={project.status} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            Rs. {parseFloat(project.balance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {/* Related Payments */}
          {relatedData.payments.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Payments ({relatedData.payments.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatedData.payments.slice(0, 5).map((payment) => (
                        <TableRow
                          key={payment.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/payments/${payment.id}`)}
                        >
                          <TableCell>{payment.payment_id}</TableCell>
                          <TableCell>
                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell align="right">
                            Rs. {parseFloat(payment.amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              {customer.updated_at && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(customer.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sync Status:
                </Typography>
                <Chip
                  label={customer.sync_status || 'SYNCED'}
                  size="small"
                  color={customer.sync_status === 'SYNCED' ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
