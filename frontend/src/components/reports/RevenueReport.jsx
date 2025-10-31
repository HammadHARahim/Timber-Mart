// ============================================================================
// Revenue Report Component - Material UI Version
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { api } from '../../utils/apiClient';

export default function RevenueReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Fetch report data
  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;

      const response = await api.get('/api/projects/revenue-report', { params });
      if (response.success) {
        setReportData(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load revenue report:', err);
      setError('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    fetchRevenueReport();
  };

  const handleClearFilter = () => {
    setDateRange({ start_date: '', end_date: '' });
    setTimeout(() => fetchRevenueReport(), 100);
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = ['Project ID', 'Project Name', 'Customer', 'Status', 'Estimated', 'Actual', 'Revenue', 'Orders', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.project_id,
        `"${row.project_name}"`,
        `"${row.customer_name}"`,
        row.status,
        row.estimated_amount,
        row.actual_amount,
        row.total_revenue,
        row.order_count,
        row.balance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!reportData.length) {
      return {
        totalProjects: 0,
        totalRevenue: 0,
        totalEstimated: 0,
        totalOrders: 0
      };
    }

    return {
      totalProjects: reportData.length,
      totalRevenue: reportData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0),
      totalEstimated: reportData.reduce((sum, item) => sum + parseFloat(item.estimated_amount || 0), 0),
      totalOrders: reportData.reduce((sum, item) => sum + parseInt(item.order_count || 0), 0)
    };
  }, [reportData]);

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'project_id',
        header: 'Project ID',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'project_name',
        header: 'Project Name',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer',
        size: 180,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            PLANNING: 'info',
            IN_PROGRESS: 'primary',
            COMPLETED: 'success',
            ON_HOLD: 'warning',
            CANCELLED: 'error',
          };
          return (
            <Chip
              label={status}
              color={colorMap[status] || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'estimated_amount',
        header: 'Estimated Amount',
        size: 150,
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={600}>
              ₨{amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'actual_amount',
        header: 'Actual Amount',
        size: 150,
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={600}>
              ₨{amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'total_revenue',
        header: 'Total Revenue',
        size: 160,
        Cell: ({ cell }) => {
          const revenue = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={700} color="success.main">
              ₨{revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'order_count',
        header: 'Orders',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" textAlign="center" fontWeight={600}>
            {cell.getValue() || 0}
          </Typography>
        ),
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
          <IconButton onClick={fetchRevenueReport} disabled={loading}>
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
      {/* Date Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filter by Date Range
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={dateRange.start_date}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={dateRange.end_date}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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
                    Total Projects
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.totalProjects}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: '#667eea', opacity: 0.8 }} />
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ₨{summary.totalRevenue.toLocaleString('en-PK')}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.8 }} />
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
                    Estimated Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ₨{summary.totalEstimated.toLocaleString('en-PK')}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.totalOrders}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.8 }} />
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
