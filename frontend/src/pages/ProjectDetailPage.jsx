// ============================================================================
// Project Detail Page - Drawer-based detail view
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Business as ProjectIcon,
  Person as PersonIcon,
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  Receipt as CheckIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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
    navigate(`/projects/edit/${id}`);
  };

  const getStatusInfo = (status) => {
    const statuses = {
      PENDING: { color: 'warning', icon: '⏳' },
      IN_PROGRESS: { color: 'info', icon: '🔨' },
      COMPLETED: { color: 'success', icon: '✅' },
      ON_HOLD: { color: 'default', icon: '⏸️' },
      CANCELLED: { color: 'error', icon: '❌' },
    };
    return statuses[status] || statuses.PENDING;
  };

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: '70%', lg: '50%' },
          maxWidth: 800,
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
          bgcolor: '#3b82f6',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProjectIcon />
          <Typography variant="h6" fontWeight={600}>
            Project Details
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
        ) : project ? (
          <>
            {/* Main Info */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {project.project_name || project.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${getStatusInfo(project.status).icon} ${project.status}`}
                      size="small"
                      color={getStatusInfo(project.status).color}
                    />
                    <Chip
                      label={project.project_id}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Balance
                  </Typography>
                  <Typography variant="h6" color={project.balance > 0 ? 'error.main' : 'success.main'}>
                    Rs. {parseFloat(project.balance || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Financial Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        Rs. {parseFloat(project.total_amount || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Paid Amount
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Rs. {parseFloat(project.paid_amount || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Balance
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="error.main">
                        Rs. {parseFloat(project.balance || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Discount
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        Rs. {parseFloat(project.discount || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Customer Info */}
              {project.customer && (
                <Card
                  variant="outlined"
                  sx={{ mb: 3, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => navigate(`/customers/${project.customer.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PersonIcon color="primary" fontSize="small" />
                      <Typography variant="caption" color="text.secondary">
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
              )}

              {/* Dates */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          End Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Location */}
              {project.location && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Location
                    </Typography>
                    <Typography variant="body1">{project.location}</Typography>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {project.description && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Description
                    </Typography>
                    <Typography variant="body2">{project.description}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            <Divider />

            {/* Tabs for Related Data */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label={`Orders (${relatedData.orders.length})`} />
                <Tab label={`Payments (${relatedData.payments.length})`} />
                <Tab label={`Checks (${relatedData.checks.length})`} />
              </Tabs>
            </Box>

            {/* Orders Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3 }}>
                {relatedData.orders.length > 0 ? (
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
                        {relatedData.orders.map((order) => (
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
                              Rs. {parseFloat(order.final_amount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No orders found
                  </Typography>
                )}
              </Box>
            </TabPanel>

            {/* Payments Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3 }}>
                {relatedData.payments.length > 0 ? (
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
                        {relatedData.payments.map((payment) => (
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
                              Rs. {parseFloat(payment.amount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No payments found
                  </Typography>
                )}
              </Box>
            </TabPanel>

            {/* Checks Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3 }}>
                {relatedData.checks.length > 0 ? (
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
                        {relatedData.checks.map((check) => (
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
                              Rs. {parseFloat(check.amount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No checks found
                  </Typography>
                )}
              </Box>
            </TabPanel>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {project.updated_at && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Updated: {new Date(project.updated_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ m: 2 }}>
            Project not found
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}
