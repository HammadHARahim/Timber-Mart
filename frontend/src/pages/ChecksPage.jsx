// ============================================================================
// Checks Page - Material React Table Version
// ============================================================================

import { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Check as ClearIcon,
  Warning as BounceIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import checkService from '../services/checkService';
import CheckForm from '../components/checks/CheckForm';

export default function ChecksPage() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [paginationInfo, setPaginationInfo] = useState({});
  const [statistics, setStatistics] = useState({});

  // Fetch checks
  useEffect(() => {
    fetchChecks();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: globalFilter,
        status: columnFilters.find(f => f.id === 'status')?.value || '',
        payee_type: columnFilters.find(f => f.id === 'payee_type')?.value || '',
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      };
      const response = await checkService.getAllChecks(filters);
      setChecks(response.data.checks || []);
      setPaginationInfo(response.data.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load checks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await checkService.getStatistics();
      setStatistics(response.data || {});
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'check_number',
        header: 'Check Number',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'payee_name',
        header: 'Payee',
        size: 180,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'payee_type',
        header: 'Payee Type',
        size: 130,
        filterVariant: 'select',
        filterSelectOptions: ['CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'],
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const labelMap = {
            CUSTOMER: 'Customer',
            SUPPLIER: 'Supplier',
            EMPLOYEE: 'Employee',
            OTHER: 'Other',
          };
          return (
            <Chip
              label={labelMap[type] || type}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 130,
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={700} color="primary.main">
              ₨{amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'bank_name',
        header: 'Bank',
        size: 140,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue() || 'N/A'}
          </Typography>
        ),
      },
      {
        accessorKey: 'issue_date',
        header: 'Issue Date',
        size: 120,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        size: 120,
        Cell: ({ cell }) => {
          const dueDate = new Date(cell.getValue());
          const today = new Date();
          const isOverdue = dueDate < today;
          return (
            <Typography
              variant="body2"
              color={isOverdue ? 'error.main' : 'text.primary'}
              fontWeight={isOverdue ? 600 : 400}
            >
              {dueDate.toLocaleDateString()}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        filterVariant: 'select',
        filterSelectOptions: ['PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            PENDING: 'warning',
            CLEARED: 'success',
            BOUNCED: 'error',
            CANCELLED: 'default',
          };
          const labelMap = {
            PENDING: 'Pending',
            CLEARED: 'Cleared',
            BOUNCED: 'Bounced',
            CANCELLED: 'Cancelled',
          };
          return (
            <Chip
              label={labelMap[status] || status}
              color={colorMap[status] || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
    ],
    []
  );

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingCheck) {
        await checkService.updateCheck(editingCheck.id, formData);
      } else {
        await checkService.createCheck(formData);
      }
      setShowForm(false);
      setEditingCheck(null);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to save check');
    }
  };

  // Handle delete
  const handleDelete = async (check) => {
    if (!window.confirm(`Are you sure you want to delete check ${check.check_number}?`)) return;
    try {
      await checkService.deleteCheck(check.id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to delete check');
    }
  };

  // Handle clear
  const handleClear = async (check) => {
    try {
      await checkService.clearCheck(check.id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to clear check');
    }
  };

  // Handle bounce
  const handleBounce = async (check) => {
    try {
      await checkService.bounceCheck(check.id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to mark check as bounced');
    }
  };

  // Handle cancel
  const handleCancelCheck = async (check) => {
    try {
      await checkService.cancelCheck(check.id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to cancel check');
    }
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: checks,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
      density: 'compact',
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: loading
      ? { color: 'info', children: 'Loading data...' }
      : error
      ? { color: 'error', children: error }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {row.original.status === 'PENDING' && (
          <>
            <Tooltip title="Clear Check">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleClear(row.original)}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark as Bounced">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleBounce(row.original)}
              >
                <BounceIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel Check">
              <IconButton
                size="small"
                onClick={() => handleCancelCheck(row.original)}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => {
              setEditingCheck(row.original);
              setShowForm(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(row.original)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCheck(null);
            setShowForm(true);
          }}
        >
          Add Check
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchChecks()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    rowCount: paginationInfo?.total || 0,
    state: {
      columnFilters,
      globalFilter,
      isLoading: false,
      pagination,
      showAlertBanner: false,
      showProgressBars: false,
      sorting,
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true,
    },
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Checks Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage check payments
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {statistics.total > 0 && (
        <Grid container spacing={2} mb={3}>
          <Grid xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {statistics.pending || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Overdue
              </Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {statistics.overdue || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Cleared
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {statistics.cleared || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Check Form Modal */}
      {showForm && (
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
          onClick={() => {
            setShowForm(false);
            setEditingCheck(null);
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CheckForm
              check={editingCheck}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCheck(null);
              }}
            />
          </Box>
        </Box>
      )}

      <MaterialReactTable table={table} />
    </Container>
  );
}
