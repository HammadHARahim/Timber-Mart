// ============================================================================
// Users Page - Material React Table Version
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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import UserForm from '../components/features/UserForm';

export default function UsersPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Check permissions
  const canManageUsers = hasPermission('user.create') || currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontFamily="monospace">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Username',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 150,
        filterVariant: 'select',
        filterSelectOptions: ['ADMIN', 'MANAGER', 'SALES_OFFICER', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
        Cell: ({ cell }) => {
          const role = cell.getValue();
          const colorMap = {
            ADMIN: 'error',
            MANAGER: 'warning',
            SALES_OFFICER: 'info',
            WAREHOUSE_STAFF: 'success',
            ACCOUNTANT: 'primary',
          };
          const labelMap = {
            ADMIN: 'Admin',
            MANAGER: 'Manager',
            SALES_OFFICER: 'Sales Officer',
            WAREHOUSE_STAFF: 'Warehouse Staff',
            ACCOUNTANT: 'Accountant',
          };
          return (
            <Chip
              label={labelMap[role] || role}
              color={colorMap[role] || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 100,
        filterVariant: 'checkbox',
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? 'Active' : 'Inactive'}
            color={cell.getValue() ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
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

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: users,
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
        right: ['mrt-row-actions'],
      },
      density: 'compact',
    },
    muiToolbarAlertBannerProps: loading
      ? { color: 'info', children: 'Loading users...' }
      : error
      ? { color: 'error', children: error }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Edit User">
          <IconButton
            size="small"
            onClick={() => handleEditUser(row.original)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Add New User
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchUsers()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
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
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: true,
      showLastButton: true,
    },
  });

  // Access denied check
  if (!canManageUsers) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box textAlign="center" py={5}>
          <Typography variant="h4" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to manage users.
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUsers}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users, roles, and permissions
        </Typography>
      </Box>

      {/* User Form Modal */}
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
          onClick={handleFormClose}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <UserForm
              user={editingUser}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </Box>
        </Box>
      )}

      <MaterialReactTable table={table} />

      {/* Role Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          User Roles & Permissions
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>ADMIN:</strong> Full system access, user management
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>MANAGER:</strong> Team management, approvals, reports
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>SALES_OFFICER:</strong> Customer and order management
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>WAREHOUSE_STAFF:</strong> Inventory and fulfillment
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>ACCOUNTANT:</strong> Financial operations and reports
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
}
