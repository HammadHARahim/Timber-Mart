// ============================================================================
// Tokens Page - Material React Table Version
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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import TokenForm from '../components/tokens/TokenForm';
import TokenDetail from '../components/tokens/TokenDetail';
import PrintPreview from '../components/print/PrintPreview';
import printService from '../services/printService';
import tokenService from '../services/tokenService';
import { api } from '../utils/apiClient';

const TokensPage = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState(null);

  // Table state
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch tokens
  useEffect(() => {
    if (view === 'list') {
      fetchTokens();
    }
  }, [view, pagination.pageIndex, globalFilter, columnFilters]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      if (globalFilter) params.append('search', globalFilter);

      const statusFilter = columnFilters.find(f => f.id === 'status')?.value;
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/api/tokens?${params.toString()}`);
      setTokens(response.data?.tokens || []);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedToken(null);
    setView('form');
  };

  const handleEdit = (token) => {
    setSelectedToken(token);
    setView('form');
  };

  const handleView = (token) => {
    setSelectedTokenId(token.id);
    setView('detail');
  };

  const handlePrint = async (token) => {
    try {
      await tokenService.recordPrint(token.id);
      const response = await printService.generateTokenPrint(token.id);
      setPrintData(response.data);
      setShowPrintPreview(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate print');
    }
  };

  const handleMarkAsUsed = async (token) => {
    if (!confirm(`Mark token ${token.token_id} as used?`)) return;
    try {
      await tokenService.markAsUsed(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark token as used');
    }
  };

  const handleCancelToken = async (token) => {
    if (!confirm(`Cancel token ${token.token_id}?`)) return;
    try {
      await tokenService.cancelToken(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  const handleRegenerateQR = async (token) => {
    if (!confirm(`Regenerate QR code for token ${token.token_id}?`)) return;
    try {
      await tokenService.regenerateQRCode(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code');
    }
  };

  const handlePrintNow = (data) => {
    printService.triggerPrint(data);
    setShowPrintPreview(false);
    setPrintData(null);
    fetchTokens();
  };

  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
    setPrintData(null);
  };

  const handleSave = () => {
    setView('list');
    setSelectedToken(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedToken(null);
  };

  const handleCloseDetail = () => {
    setView('list');
    setSelectedTokenId(null);
  };

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'token_id',
        header: 'Token ID',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer',
        size: 180,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
      {
        accessorKey: 'order_number',
        header: 'Order',
        size: 130,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
      {
        accessorKey: 'vehicle_number',
        header: 'Vehicle',
        size: 130,
      },
      {
        accessorKey: 'driver_name',
        header: 'Driver',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
      {
        accessorKey: 'qr_code_url',
        header: 'QR Code',
        size: 100,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          cell.getValue() ? (
            <Tooltip title="Click to view full details">
              <Avatar
                src={cell.getValue()}
                variant="rounded"
                sx={{ width: 40, height: 40, cursor: 'pointer' }}
                onClick={() => handleView(row.original)}
              />
            </Tooltip>
          ) : '-'
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['ACTIVE', 'USED', 'CANCELLED'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            ACTIVE: 'success',
            USED: 'default',
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
        accessorKey: 'print_count',
        header: 'Prints',
        size: 80,
        Cell: ({ cell }) => (
          <Typography variant="body2" align="center">
            {cell.getValue() || 0}
          </Typography>
        ),
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

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: tokens,
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading,
      pagination,
      sorting,
    },
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreate}
      >
        Create Token
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => handleView(row.original)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.status === 'ACTIVE' && (
          <>
            <Tooltip title="Print">
              <IconButton size="small" color="primary" onClick={() => handlePrint(row.original)}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEdit(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark as Used">
              <IconButton size="small" color="success" onClick={() => handleMarkAsUsed(row.original)}>
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel Token">
              <IconButton size="small" color="error" onClick={() => handleCancelToken(row.original)}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate QR">
              <IconButton size="small" onClick={() => handleRegenerateQR(row.original)}>
                <QrCodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    ),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Delivery Tokens
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage delivery tokens with QR codes for orders and deliveries
        </Typography>
      </Box>

      {view === 'list' && <MaterialReactTable table={table} />}

      {view === 'form' && (
        <TokenForm
          token={selectedToken}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {view === 'detail' && selectedTokenId && (
        <TokenDetail
          tokenId={selectedTokenId}
          onClose={handleCloseDetail}
          onEdit={(token) => {
            setSelectedToken(token);
            setView('form');
          }}
          onPrint={handlePrint}
        />
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && printData && (
        <PrintPreview
          printData={printData}
          onPrint={handlePrintNow}
          onClose={handleClosePrintPreview}
          title="Token Print Preview"
        />
      )}
    </Container>
  );
};

export default TokensPage;
