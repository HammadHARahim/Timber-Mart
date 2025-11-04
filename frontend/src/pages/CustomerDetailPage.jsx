// ============================================================================
// Customer Detail Page - Drawer-based detail view with comprehensive info
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
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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
      // Fetch customer details
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
    // Navigate back to customers list
    navigate('/customers');
  };

  const handleEdit = () => {
    // Navigate to edit mode (you can implement this later)
    navigate(`/customers/edit/${id}`);
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
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6" fontWeight={600}>
            Customer Details
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
        ) : customer ? (
          <>
            {/* Basic Info Section */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {customer.name}
                  </Typography>
                  <Chip
                    label={customer.customer_type || 'REGULAR'}
                    size="small"
                    color={customer.customer_type === 'VIP' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={customer.customer_id}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Balance
                  </Typography>
                  <Typography variant="h6" color={customer.balance > 0 ? 'error.main' : 'success.main'}>
                    Rs. {parseFloat(customer.balance || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Contact Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {customer.phone && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PhoneIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Phone
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {customer.phone}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {customer.email && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EmailIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {customer.email}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {customer.address && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <LocationIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Address
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {customer.address}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {customer.business_name && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <BusinessIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Business Name
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {customer.business_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Notes */}
              {customer.notes && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Notes
                    </Typography>
                    <Typography variant="body2">{customer.notes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            <Divider />

            {/* Tabs for Related Data */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label={`Orders (${relatedData.orders.length})`} />
                <Tab label={`Projects (${relatedData.projects.length})`} />
                <Tab label={`Payments (${relatedData.payments.length})`} />
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

            {/* Projects Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3 }}>
                {relatedData.projects.length > 0 ? (
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
                        {relatedData.projects.map((project) => (
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
                              Rs. {parseFloat(project.balance || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No projects found
                  </Typography>
                )}
              </Box>
            </TabPanel>

            {/* Payments Tab */}
            <TabPanel value={tabValue} index={2}>
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

            {/* Footer with Audit Info */}
            <Divider />
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {customer.updated_at && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Updated: {new Date(customer.updated_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ m: 2 }}>
            Customer not found
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}
