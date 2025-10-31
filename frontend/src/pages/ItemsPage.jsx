// ============================================================================
// Items Page - Inventory Management with Shortcuts
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
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocalOffer as ShortcutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import itemService from '../services/itemService';
import ItemForm from '../components/items/ItemForm';
import { formatCurrency } from '../utils/formatters';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [totalItems, setTotalItems] = useState(0);

  const { hasPermission } = useAuth();

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getAllItems({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      if (response.success && response.data) {
        setItems(response.data.items || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.pageIndex, pagination.pageSize]);

  // Handle create/edit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await itemService.updateItem(editingItem.id, formData);
      } else {
        await itemService.createItem(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Failed to save item:', error);
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This will also delete all associated shortcuts.`)) {
      try {
        await itemService.deleteItem(item.id);
        fetchItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Item Name',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            size="small"
            color="default"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        accessorKey: 'default_price',
        header: 'Price',
        size: 130,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={700} color="success.main">
            {formatCurrency(cell.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        Cell: ({ cell }) => {
          const category = cell.getValue();
          return category ? (
            <Chip
              label={category}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          );
        },
      },
      {
        accessorKey: 'shortcuts',
        header: 'Shortcuts',
        size: 250,
        Cell: ({ cell }) => {
          const shortcuts = cell.getValue() || [];
          if (shortcuts.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                No shortcuts
              </Typography>
            );
          }
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {shortcuts.map((shortcut) => (
                <Chip
                  key={shortcut.id}
                  icon={<ShortcutIcon sx={{ fontSize: '0.875rem' }} />}
                  label={`${shortcut.shortcut_code} (${shortcut.quantity})`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? 'Active' : 'Inactive'}
            color={cell.getValue() ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
    ],
    []
  );

  // Table configuration
  const table = useMaterialReactTable({
    columns,
    data: items,
    enableColumnResizing: true,
    enableColumnFilterModes: true,
    enablePagination: true,
    enableSorting: true,
    manualPagination: true,
    rowCount: totalItems,
    state: {
      isLoading: loading,
      pagination,
    },
    onPaginationChange: setPagination,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {hasPermission('order:edit') && (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingItem(row.original);
                setShowForm(true);
              }}
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
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            Add Item
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchItems}
        >
          Refresh
        </Button>
      </Box>
    ),
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Inventory Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage items and their shortcuts for quick order entry
        </Typography>
      </Box>

      {showForm ? (
        <ItemForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      ) : (
        <MaterialReactTable table={table} />
      )}
    </Container>
  );
}
