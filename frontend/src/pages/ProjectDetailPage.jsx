// ============================================================================
// Project Detail Page - Matches OrderDetail visual pattern
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
  Business as ProjectIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedData, setRelatedData] = useState({
    orders: [],
    payments: [],
    checks: [],
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const projectRes = await api.get(`/api/projects/${id}`);
      if (projectRes.success) {
        setProject(projectRes.data);

        // Fetch related data
        const [ordersRes, paymentsRes, checksRes] = await Promise.all([
          api.get(`/api/orders?project_id=${id}`),
          api.get(`/api/payments?project_id=${id}`),
          api.get(`/api/checks?project_id=${id}`),
        ]);

        setRelatedData({
          orders: ordersRes.success ? ordersRes.data : [],
          payments: paymentsRes.success ? paymentsRes.data : [],
          checks: checksRes.success ? checksRes.data : [],
        });
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate('/projects', { state: { editProjectId: id } });
  };

  const getStatusInfo = (status) => {
    const statuses = {
      PENDING: { color: 'warning', label: 'Pending' },
      IN_PROGRESS: { color: 'info', label: 'In Progress' },
      COMPLETED: { color: 'success', label: 'Completed' },
      ON_HOLD: { color: 'default', label: 'On Hold' },
      CANCELLED: { color: 'error', label: 'Cancelled' },
    };
    return statuses[status] || statuses.PENDING;
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

  if (error || !project) {
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
        <Alert severity="error">{error || 'Project not found'}</Alert>
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
                {project.project_name || project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {project.project_id}
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

          {/* Project Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Project Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status:
                </Typography>
                <Chip
                  label={getStatusInfo(project.status).label}
                  size="small"
                  color={getStatusInfo(project.status).color}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {project.location || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Start Date:
                </Typography>
                <Typography variant="body1">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  End Date:
                </Typography>
                <Typography variant="body1">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Typography>
              </Grid>
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      Rs. {parseFloat(project.total_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Paid Amount:
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      Rs. {parseFloat(project.paid_amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Balance:
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      Rs. {parseFloat(project.balance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Discount:
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      Rs. {parseFloat(project.discount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer */}
          {project.customer && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Customer
                </Typography>
                <Card
                  variant="outlined"
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => navigate(`/customers/${project.customer.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Customer
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600}>
                      {project.customer.name}
                    </Typography>
                    {project.customer.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {project.customer.phone}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Description */}
          {project.description && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{project.description}</Typography>
                </Paper>
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Related Orders */}
          {relatedData.orders.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Related Orders ({relatedData.orders.length})
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
                {relatedData.orders.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Showing 5 of {relatedData.orders.length} orders
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Related Payments */}
          {relatedData.payments.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Related Payments ({relatedData.payments.length})
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
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
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
                {relatedData.payments.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Showing 5 of {relatedData.payments.length} payments
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Related Checks */}
          {relatedData.checks.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Related Checks ({relatedData.checks.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Check Number</TableCell>
                        <TableCell>Bank</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatedData.checks.slice(0, 5).map((check) => (
                        <TableRow
                          key={check.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/checks/${check.id}`)}
                        >
                          <TableCell>{check.check_number}</TableCell>
                          <TableCell>{check.bank_name}</TableCell>
                          <TableCell>
                            {check.due_date ? new Date(check.due_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip label={check.status} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            Rs. {parseFloat(check.amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {relatedData.checks.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Showing 5 of {relatedData.checks.length} checks
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Metadata */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              {project.created_by && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created By:
                  </Typography>
                  <Typography variant="body1">
                    {project.created_by.username || project.created_by.email}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              {project.updated_at && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sync Status:
                </Typography>
                <Chip
                  label={project.sync_status || 'SYNCED'}
                  size="small"
                  color={project.sync_status === 'SYNCED' ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
