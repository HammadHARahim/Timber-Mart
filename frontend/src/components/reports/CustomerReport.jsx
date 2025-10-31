// ============================================================================
// Customer Report Component - Material UI Version
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { api } from '../../utils/apiClient';

export default function CustomerReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    customer_type: '',
    start_date: '',
    end_date: ''
  });

  // Fetch report data
  useEffect(() => {
    fetchCustomerReport();
  }, []);

  const fetchCustomerReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 1000 };
      if (filters.customer_type) params.customer_type = filters.customer_type;

      const response = await api.get('/api/customers', { params });
      if (response.success) {
        const customers = response.data.customers || [];

        // Fetch additional statistics for each customer
        const enrichedData = await Promise.all(
          customers.map(async (customer) => {
            try {
              // Fetch orders for customer
              const ordersResponse = await api.get('/api/orders', {
                params: { customer_id: customer.id, limit: 1000 }
              });
              const orders = ordersResponse.data?.orders || [];

              // Fetch payments for customer
              const paymentsResponse = await api.get('/api/payments', {
                params: { customer_id: customer.id, limit: 1000 }
              });
              const payments = paymentsResponse.data?.payments || [];

              // Calculate totals
              const totalOrders = orders.length;
              const totalOrderValue = orders.reduce((sum, order) =>
                sum + parseFloat(order.final_amount || 0), 0
              );
              const totalPayments = payments.reduce((sum, payment) =>
                sum + parseFloat(payment.amount || 0), 0
              );
              const balance = parseFloat(customer.balance || 0);

              return {
                ...customer,
                totalOrders,
                totalOrderValue,
                totalPayments,
                balance
              };
            } catch (err) {
              console.error(`Failed to fetch data for customer ${customer.id}:`, err);
              return {
                ...customer,
                totalOrders: 0,
                totalOrderValue: 0,
                totalPayments: 0,
                balance: parseFloat(customer.balance || 0)
              };
            }
          })
        );

        setReportData(enrichedData);
      }
    } catch (err) {
      console.error('Failed to load customer report:', err);
      setError('Failed to load customer report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    fetchCustomerReport();
  };

  const handleClearFilter = () => {
    setFilters({ customer_type: '', start_date: '', end_date: '' });
    setTimeout(() => fetchCustomerReport(), 100);
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = ['Customer ID', 'Name', 'Phone', 'Email', 'Type', 'Total Orders', 'Order Value', 'Payments', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.customer_id,
        `"${row.name}"`,
        row.phone || '',
        row.email || '',
        row.customer_type,
        row.totalOrders,
        row.totalOrderValue,
        row.totalPayments,
        row.balance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!reportData.length) {
      return {
        totalCustomers: 0,
        totalOrderValue: 0,
        totalPayments: 0,
        totalBalance: 0
      };
    }

    return {
      totalCustomers: reportData.length,
      totalOrderValue: reportData.reduce((sum, item) => sum + parseFloat(item.totalOrderValue || 0), 0),
      totalPayments: reportData.reduce((sum, item) => sum + parseFloat(item.totalPayments || 0), 0),
      totalBalance: reportData.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0)
    };
  }, [reportData]);

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'customer_id',
        header: 'Customer ID',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Customer Name',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        size: 140,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'customer_type',
        header: 'Type',
        size: 120,
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const colorMap = {
            new: 'info',
            regular: 'primary',
            premium: 'success',
          };
          return (
            <Chip
              label={type?.toUpperCase() || 'REGULAR'}
              color={colorMap[type] || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'totalOrders',
        header: 'Total Orders',
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2" textAlign="center" fontWeight={600}>
            {cell.getValue() || 0}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalOrderValue',
        header: 'Order Value',
        size: 160,
        Cell: ({ cell }) => {
          const value = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={700} color="primary.main">
              ₨{value.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'totalPayments',
        header: 'Total Payments',
        size: 160,
        Cell: ({ cell }) => {
          const value = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={700} color="success.main">
              ₨{value.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        size: 150,
        Cell: ({ cell }) => {
          const balance = parseFloat(cell.getValue() || 0);
          return (
            <Typography
              variant="body2"
              fontWeight={700}
              color={balance < 0 ? 'error.main' : 'success.main'}
            >
              ₨{balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
    ],
    []
  );

  // Configure table
  const table = useMaterialReactTable({
    columns,
    data: reportData,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
      density: 'compact',
    },
    muiToolbarAlertBannerProps: loading
      ? { color: 'info', children: 'Loading data...' }
      : error
      ? { color: 'error', children: error }
      : undefined,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchCustomerReport} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={!reportData.length}
        >
          Export CSV
        </Button>
      </Box>
    ),
    state: {
      isLoading: loading,
      showAlertBanner: !!error,
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filter Customers
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Customer Type"
              value={filters.customer_type}
              onChange={(e) => handleFilterChange('customer_type', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleApplyFilter}
                fullWidth
              >
                Apply Filter
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilter}
                fullWidth
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(102, 126, 234, 0.12)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.totalCustomers}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: '#667eea', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Order Value
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ₨{summary.totalOrderValue.toLocaleString('en-PK')}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Payments
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ₨{summary.totalPayments.toLocaleString('en-PK')}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: summary.totalBalance < 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={summary.totalBalance < 0 ? 'error.main' : 'success.main'}
                  >
                    ₨{summary.totalBalance.toLocaleString('en-PK')}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: summary.totalBalance < 0 ? '#ef4444' : '#10b981', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Table */}
      <MaterialReactTable table={table} />
    </Box>
  );
}
