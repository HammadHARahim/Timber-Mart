// ============================================================================
// Project Form - Material UI Version
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    customer_id: '',
    estimated_amount: '',
    actual_amount: '',
    status: 'PLANNED'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        description: project.description || '',
        customer_id: project.customer_id || '',
        estimated_amount: project.estimated_amount || '',
        actual_amount: project.actual_amount || '',
        status: project.status || 'PLANNED'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate project_name
    if (!formData.project_name) {
      newErrors.project_name = 'Project name is required';
    }

    // Validate customer_id
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer ID is required';
    }

    // Validate estimated_amount (if provided, must be > 0)
    if (formData.estimated_amount && parseFloat(formData.estimated_amount) <= 0) {
      newErrors.estimated_amount = 'Estimated amount must be greater than 0';
    }

    // Validate actual_amount (if provided, must be > 0)
    if (formData.actual_amount && parseFloat(formData.actual_amount) <= 0) {
      newErrors.actual_amount = 'Actual amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {project ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {project ? 'Edit Project' : 'Create New Project'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {project
            ? 'Update project information and status'
            : 'Add a new project to track work and progress'}
        </Typography>
      </Box>

      <Divider />

      {/* Error Alert */}
      {errors.submit && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}>
            {errors.submit}
          </Alert>
        </Box>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Project Name */}
          <TextField
            fullWidth
            required
            label="Project Name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.project_name}
            helperText={errors.project_name || "Descriptive name for the project"}
          />

          {/* Customer ID */}
          <TextField
            fullWidth
            required
            label="Customer ID"
            name="customer_id"
            type="number"
            value={formData.customer_id}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.customer_id}
            helperText={errors.customer_id || "ID of the customer this project belongs to"}
          />

          {/* Status */}
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
            helperText="Current status of the project"
          >
            <MenuItem value="PLANNED">
              <Box>
                <Typography variant="body2" fontWeight={600}>Planned</Typography>
                <Typography variant="caption" color="text.secondary">
                  Project is being planned
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="IN_PROGRESS">
              <Box>
                <Typography variant="body2" fontWeight={600}>In Progress</Typography>
                <Typography variant="caption" color="text.secondary">
                  Project is actively being worked on
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="COMPLETED">
              <Box>
                <Typography variant="body2" fontWeight={600}>Completed</Typography>
                <Typography variant="caption" color="text.secondary">
                  Project has been finished
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="ON_HOLD">
              <Box>
                <Typography variant="body2" fontWeight={600}>On Hold</Typography>
                <Typography variant="caption" color="text.secondary">
                  Project is temporarily paused
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="CANCELLED">
              <Box>
                <Typography variant="body2" fontWeight={600}>Cancelled</Typography>
                <Typography variant="caption" color="text.secondary">
                  Project has been cancelled
                </Typography>
              </Box>
            </MenuItem>
          </TextField>

          {/* Estimated Amount */}
          <TextField
            fullWidth
            label="Estimated Amount"
            name="estimated_amount"
            type="number"
            value={formData.estimated_amount}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.estimated_amount}
            inputProps={{ step: '0.01' }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₨</Typography>,
            }}
            helperText={errors.estimated_amount || "Estimated cost for the project"}
          />

          {/* Actual Amount */}
          <TextField
            fullWidth
            label="Actual Amount"
            name="actual_amount"
            type="number"
            value={formData.actual_amount}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.actual_amount}
            inputProps={{ step: '0.01' }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₨</Typography>,
            }}
            helperText={errors.actual_amount || "Actual cost incurred (if known)"}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={isSubmitting}
            helperText="Detailed description of the project scope and requirements"
          />
        </Box>

        {/* Form Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            startIcon={<CancelIcon />}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            size="large"
          >
            {isSubmitting
              ? 'Saving...'
              : (project ? 'Update Project' : 'Create Project')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
