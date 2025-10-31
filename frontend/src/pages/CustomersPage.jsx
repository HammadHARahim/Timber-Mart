// ============================================================================
// Customers Page - Material React Table Version
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCustomer } from '../hooks/useCustomer';
import CustomerForm from '../components/features/CustomerForm';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { user, hasPermission } = useAuth();
  const {
    customers,
    loading,
    pagination: paginationInfo,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomer();

  // Fetch customers on mount and when filters change
  useEffect(() => {
    fetchCustomers(
      pagination.pageIndex + 1,
      globalFilter,
      columnFilters.find(f => f.id === 'customer_type')?.value || ''
    );
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  // Define columns for Material React Table
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
        header: 'Name',
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
        size: 130,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        size: 130,
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
      {
        accessorKey: 'customer_type',
        header: 'Type',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['regular', 'premium', 'vip'],
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const colorMap = {
            regular: 'default',
            premium: 'primary',
            vip: 'warning',
          };
          return (
            <Chip
              label={type}
              color={colorMap[type] || 'default'}
              size="small"
              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 120,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
    ],
    []
  );

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    let result;
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, formData);
    } else {
      result = await createCustomer(formData);
    }

    if (result) {
      setShowForm(false);
      setEditingCustomer(null);
      fetchCustomers(pagination.pageIndex + 1, globalFilter, '');
    }
  };

  // Handle delete
  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const success = await deleteCustomer(customer.id);
      if (success) {
        fetchCustomers(pagination.pageIndex + 1, globalFilter, '');
      }
    }
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: customers,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: hasPermission('customer.edit') || hasPermission('customer.delete'),
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
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {hasPermission('customer.edit') && (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingCustomer(row.original);
                setShowForm(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {hasPermission('customer.delete') && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(row.original)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {hasPermission('customer.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCustomer(null);
              setShowForm(true);
            }}
          >
            Add Customer
          </Button>
        )}
        <Tooltip title="Refresh">
          <IconButton
            onClick={() =>
              fetchCustomers(pagination.pageIndex + 1, globalFilter, '')
            }
          >
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

  // Check permission
  if (!hasPermission('customer.view')) {
    return (
      <Container maxWidth="xl">
        <Box py={4}>
          <Typography variant="h5" color="error">
            You don't have permission to view customers
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database
        </Typography>
      </Box>

      {/* Customer Form Modal */}
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
            setEditingCustomer(null);
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
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCustomer(null);
              }}
            />
          </Box>
        </Box>
      )}

      <MaterialReactTable table={table} />
    </Container>
  );
}
