// ============================================================================
// Orders Page - Material React Table Version
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
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import OrderForm from '../components/features/OrderForm';
import OrderDetail from '../components/features/OrderDetail';
import orderService from '../services/orderService';
import apiService from '../services/apiService';

export default function OrdersPage() {
  const [view, setView] = useState('list'); // 'list', 'detail'
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { user, hasPermission } = useAuth();

  // Fetch orders
  useEffect(() => {
    if (view === 'list') {
      fetchOrders();
    }
  }, [view, pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  // Fetch customers and projects on mount
  useEffect(() => {
    fetchCustomers();
    fetchProjects();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: globalFilter,
        status: columnFilters.find(f => f.id === 'status')?.value || '',
        payment_status: columnFilters.find(f => f.id === 'payment_status')?.value || '',
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      };
      const response = await orderService.getAllOrders(filters);
      // API returns { success: true, data: { orders: [...], total, page, totalPages } }
      setOrders(response.success && response.data?.orders ? response.data.orders : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ limit: 100 });
      // API returns { success: true, data: [...], pagination: {...} }
      setCustomers(response.success && response.data ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]); // Set empty array on error
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiService.get('/api/projects?limit=100');
      // API returns { success: true, data: { projects: [...], pagination: {...} } }
      setProjects(response.success && response.data?.projects ? response.data.projects : []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]); // Set empty array on error
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'order_id',
        header: 'Order ID',
        size: 150,
        Cell: ({ cell, row }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            fontFamily="monospace"
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={() => handleView(row.original)}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'customer.name',
        header: 'Customer',
        size: 180,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue() || 'N/A'}
          </Typography>
        ),
      },
      {
        accessorKey: 'project.name',
        header: 'Project',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue() || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'order_date',
        header: 'Order Date',
        size: 120,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'items',
        header: 'Items',
        size: 80,
        Cell: ({ cell }) => (
          <Typography variant="body2" textAlign="center">
            {cell.getValue()?.length || 0}
          </Typography>
        ),
      },
      {
        accessorKey: 'final_amount',
        header: 'Total',
        size: 130,
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={700}>
              ₨{amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'paid_amount',
        header: 'Paid',
        size: 130,
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue() || 0);
          return (
            <Typography variant="body2" fontWeight={600} color="success.main">
              ₨{amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'balance_amount',
        header: 'Balance',
        size: 130,
        Cell: ({ cell }) => {
          const balance = parseFloat(cell.getValue() || 0);
          return (
            <Typography
              variant="body2"
              fontWeight={700}
              color={balance > 0 ? 'error.main' : 'success.main'}
            >
              ₨{balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 140,
        filterVariant: 'select',
        filterSelectOptions: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            PENDING: 'warning',
            CONFIRMED: 'info',
            IN_PROGRESS: 'primary',
            COMPLETED: 'success',
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
        accessorKey: 'payment_status',
        header: 'Payment',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['UNPAID', 'PARTIAL', 'PAID'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            UNPAID: 'error',
            PARTIAL: 'warning',
            PAID: 'success',
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
    ],
    []
  );

  // Handle view order details
  const handleView = async (order) => {
    setLoading(true);
    try {
      const response = await orderService.getOrderById(order.id);
      setSelectedOrder(response.data);
      setView('detail');
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Handle create new order
  const handleCreate = () => {
    setSelectedOrder(null);
    setShowForm(true);
  };

  // Handle edit order
  const handleEdit = (order) => {
    setSelectedOrder(order);
    setShowForm(true);
  };

  // Handle form submit (create/update)
  const handleFormSubmit = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedOrder) {
        await orderService.updateOrder(selectedOrder.id, orderData);
      } else {
        await orderService.createOrder(orderData);
      }
      setShowForm(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to save order:', err);
      setError(err.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete order
  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order ${order.order_id}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await orderService.deleteOrder(order.id);
      fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.updateOrderStatus(id, status);
      if (view === 'detail' && selectedOrder?.id === id) {
        const response = await orderService.getOrderById(id);
        setSelectedOrder(response.data);
      } else {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setSelectedOrder(null);
    setError(null);
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: orders,
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
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(row.original)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {hasPermission('order:edit') && (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(row.original)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {hasPermission('order:delete') && (
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
        {hasPermission('order:create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Order
          </Button>
        )}
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchOrders()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    rowCount: orders.length,
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

  // Check permissions
  if (!hasPermission('order:view')) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box textAlign="center" py={5}>
          <Typography variant="h4" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to view orders
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {view === 'list' && 'Manage customer orders and track status'}
          {view === 'detail' && 'Order Details'}
        </Typography>
      </Box>

      {/* List View */}
      {view === 'list' && <MaterialReactTable table={table} />}

      {/* Order Form Modal */}
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
            p: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              maxWidth: 600,
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
            <OrderForm
              order={selectedOrder}
              customers={customers}
              projects={projects}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </Box>
        </Box>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onClose={handleCancel}
          canEdit={hasPermission('order:edit')}
        />
      )}
    </Container>
  );
}
