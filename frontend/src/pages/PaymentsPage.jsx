// ============================================================================
// Payments Page - Material React Table Version
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
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import paymentService from '../services/paymentService';
import PaymentForm from '../components/payments/PaymentForm';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [paginationInfo, setPaginationInfo] = useState({});

  // Fetch payments
  useEffect(() => {
    fetchPayments();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: globalFilter,
        payment_type: columnFilters.find(f => f.id === 'payment_type')?.value || '',
        payment_method: columnFilters.find(f => f.id === 'payment_method')?.value || '',
        status: columnFilters.find(f => f.id === 'status')?.value || '',
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      };
      const response = await paymentService.getAllPayments(filters);
      setPayments(response.data.payments || []);
      setPaginationInfo(response.data.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'payment_id',
        header: 'Payment ID',
        size: 140,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'payment_type',
        header: 'Type',
        size: 140,
        filterVariant: 'select',
        filterSelectOptions: ['LOAN', 'ADVANCE', 'DEPOSIT', 'ORDER_PAYMENT', 'REFUND'],
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const labelMap = {
            LOAN: 'Loan',
            ADVANCE: 'Advance',
            DEPOSIT: 'Deposit',
            ORDER_PAYMENT: 'Order Payment',
            REFUND: 'Refund',
          };
          return (
            <Chip
              label={labelMap[type] || type}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'payment_method',
        header: 'Method',
        size: 130,
        filterVariant: 'select',
        filterSelectOptions: ['CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'ONLINE'],
        Cell: ({ cell }) => {
          const method = cell.getValue();
          const labelMap = {
            CASH: 'Cash',
            CHECK: 'Check',
            BANK_TRANSFER: 'Bank Transfer',
            CARD: 'Card',
            ONLINE: 'Online',
          };
          return (
            <Typography variant="body2">
              {labelMap[method] || method}
            </Typography>
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
        accessorKey: 'customer.name',
        header: 'Customer',
        size: 180,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue() || 'N/A'}
          </Typography>
        ),
      },
      {
        accessorKey: 'reference_number',
        header: 'Reference',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontFamily="monospace">
            {cell.getValue() || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        filterVariant: 'select',
        filterSelectOptions: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            PENDING: 'warning',
            APPROVED: 'info',
            REJECTED: 'error',
            COMPLETED: 'success',
            CANCELLED: 'default',
          };
          const labelMap = {
            PENDING: 'Pending',
            APPROVED: 'Approved',
            REJECTED: 'Rejected',
            COMPLETED: 'Completed',
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
      {
        accessorKey: 'payment_date',
        header: 'Date',
        size: 120,
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
    ],
    []
  );

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingPayment) {
        await paymentService.updatePayment(editingPayment.id, formData);
      } else {
        await paymentService.createPayment(formData);
      }
      setShowForm(false);
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to save payment');
    }
  };

  // Handle delete
  const handleDelete = async (payment) => {
    if (!window.confirm(`Are you sure you want to delete payment ${payment.payment_id}?`)) return;
    try {
      await paymentService.deletePayment(payment.id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  // Handle approve
  const handleApprove = async (payment) => {
    try {
      await paymentService.approvePayment(payment.id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to approve payment');
    }
  };

  // Handle reject
  const handleReject = async (payment) => {
    try {
      await paymentService.rejectPayment(payment.id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to reject payment');
    }
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: payments,
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
            <Tooltip title="Approve">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleApprove(row.original)}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleReject(row.original)}
              >
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => {
              setEditingPayment(row.original);
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
            setEditingPayment(null);
            setShowForm(true);
          }}
        >
          Create Payment
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchPayments()}>
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
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage payment transactions
        </Typography>
      </Box>

      {/* Payment Form Modal */}
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
            setEditingPayment(null);
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
            <PaymentForm
              payment={editingPayment}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPayment(null);
              }}
            />
          </Box>
        </Box>
      )}

      <MaterialReactTable table={table} />
    </Container>
  );
}
