// ============================================================================
// Templates Page - Material React Table Version
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
  ContentCopy as CopyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import TemplateEditor from '../components/templates/TemplateEditor';
import printTemplateService from '../services/printTemplateService';

const TemplatesPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Table state
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch templates
  useEffect(() => {
    if (view === 'list') {
      fetchTemplates();
    }
  }, [view, pagination.pageIndex, globalFilter, columnFilters]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        type: columnFilters.find(f => f.id === 'type')?.value || '',
        is_active: columnFilters.find(f => f.id === 'is_active')?.value ?? true,
      };
      const response = await printTemplateService.getAllTemplates(filters);
      setTemplates(response?.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setView('editor');
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setView('editor');
  };

  const handleDuplicate = async (template) => {
    if (!confirm(`Duplicate template "${template.name}"?`)) return;

    try {
      await printTemplateService.duplicateTemplate(template.id);
      fetchTemplates();
      alert('Template duplicated successfully');
    } catch (err) {
      alert(err.message || 'Failed to duplicate template');
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`Delete template "${template.name}"? This action cannot be undone.`)) return;

    try {
      await printTemplateService.deleteTemplate(template.id);
      fetchTemplates();
      alert('Template deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete template');
    }
  };

  const handleSetDefault = async (template) => {
    try {
      await printTemplateService.setAsDefault(template.id);
      fetchTemplates();
    } catch (err) {
      alert(err.message || 'Failed to set default template');
    }
  };

  const handleSave = () => {
    setView('list');
    setSelectedTemplate(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTemplate(null);
  };

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Template Name',
        size: 250,
        Cell: ({ cell, row }) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {cell.getValue()}
            </Typography>
            {row.original.description && (
              <Typography variant="caption" color="text.secondary">
                {row.original.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER', 'CUSTOM'],
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const colorMap = {
            TOKEN: 'primary',
            INVOICE: 'success',
            RECEIPT: 'info',
            VOUCHER: 'warning',
            CUSTOM: 'default',
          };
          return (
            <Chip
              label={type}
              color={colorMap[type] || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: 'page_size',
        header: 'Page Size',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2">{cell.getValue()}</Typography>
        ),
      },
      {
        accessorKey: 'orientation',
        header: 'Orientation',
        size: 110,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        size: 90,
        Cell: ({ cell, row }) => (
          cell.getValue() ? (
            <Tooltip title="Default Template">
              <StarIcon fontSize="small" color="warning" />
            </Tooltip>
          ) : (
            <Tooltip title="Set as Default">
              <IconButton size="small" onClick={() => handleSetDefault(row.original)}>
                <StarBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 100,
        filterVariant: 'select',
        filterSelectOptions: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? 'Active' : 'Inactive'}
            color={cell.getValue() ? 'success' : 'default'}
            size="small"
            variant={cell.getValue() ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        accessorKey: 'version',
        header: 'Version',
        size: 80,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontFamily="monospace">
            v{cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'created_by_name',
        header: 'Created By',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
    ],
    []
  );

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: templates,
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
        Create Template
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => handleEdit(row.original)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton size="small" color="primary" onClick={() => handleDuplicate(row.original)}>
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => handleDelete(row.original)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
          Print Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage print templates for tokens, invoices, receipts, and vouchers
        </Typography>
      </Box>

      {view === 'list' ? (
        <MaterialReactTable table={table} />
      ) : (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Container>
  );
};

export default TemplatesPage;
