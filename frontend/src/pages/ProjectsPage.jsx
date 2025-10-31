// ============================================================================
// Projects Page - Material React Table Version
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
import projectService from '../services/projectService';
import ProjectForm from '../components/projects/ProjectForm';
import { formatBalance } from '../utils/formatters';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: globalFilter,
        status: columnFilters.find(f => f.id === 'status')?.value || '',
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      };
      const response = await projectService.getAllProjects(filters);
      if (response.success) {
        setProjects(response.data.projects || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalRecords(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'project_id',
        header: 'Project ID',
        size: 130,
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
        accessorKey: 'estimated_amount',
        header: 'Estimated',
        size: 130,
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
        header: 'Actual',
        size: 130,
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
        accessorKey: 'balance',
        header: 'Balance',
        size: 150,
        Cell: ({ cell }) => {
          const balanceInfo = formatBalance(cell.getValue());
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={balanceInfo.label}
                color={balanceInfo.color}
                size="small"
                sx={{ fontWeight: 600, minWidth: 60 }}
              />
              <Typography
                variant="body2"
                fontWeight={700}
                color={`${balanceInfo.color}.main`}
              >
                {balanceInfo.formatted}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 140,
        filterVariant: 'select',
        filterSelectOptions: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorMap = {
            PLANNED: 'warning',
            IN_PROGRESS: 'info',
            COMPLETED: 'success',
            ON_HOLD: 'default',
            CANCELLED: 'error',
          };
          const labelMap = {
            PLANNED: 'Planned',
            IN_PROGRESS: 'In Progress',
            COMPLETED: 'Completed',
            ON_HOLD: 'On Hold',
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
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to save project');
    }
  };

  // Handle delete
  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete ${project.project_name}?`)) return;
    try {
      await projectService.deleteProject(project.id);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  // Configure Material React Table
  const table = useMaterialReactTable({
    columns,
    data: projects,
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
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => {
              setEditingProject(row.original);
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
            setEditingProject(null);
            setShowForm(true);
          }}
        >
          Add Project
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchProjects()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    rowCount: totalRecords,
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
          Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your project portfolio
        </Typography>
      </Box>

      {/* Project Form Modal */}
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
            setEditingProject(null);
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
            <ProjectForm
              project={editingProject}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          </Box>
        </Box>
      )}

      <MaterialReactTable table={table} />
    </Container>
  );
}
