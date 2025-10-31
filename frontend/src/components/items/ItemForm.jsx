// ============================================================================
// Item Form - Create/Edit Items with Shortcuts Management
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

export default function ItemForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    default_price: '',
    category: '',
    description: '',
    sku: '',
  });

  const [shortcuts, setShortcuts] = useState([]);
  const [newShortcut, setNewShortcut] = useState({
    shortcut_code: '',
    quantity: 1,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        unit: item.unit || '',
        default_price: item.default_price || '',
        category: item.category || '',
        description: item.description || '',
        sku: item.sku || '',
      });
      setShortcuts(item.shortcuts || []);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleShortcutChange = (e) => {
    const { name, value } = e.target;
    setNewShortcut((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddShortcut = () => {
    if (!newShortcut.shortcut_code.trim()) {
      setErrors((prev) => ({ ...prev, shortcut_code: 'Shortcut code is required' }));
      return;
    }

    // Check for duplicate shortcut codes
    const duplicate = shortcuts.find(
      (s) => s.shortcut_code.toUpperCase() === newShortcut.shortcut_code.toUpperCase()
    );
    if (duplicate) {
      setErrors((prev) => ({ ...prev, shortcut_code: 'Shortcut code already exists' }));
      return;
    }

    setShortcuts((prev) => [
      ...prev,
      {
        ...newShortcut,
        quantity: parseInt(newShortcut.quantity) || 1,
        isNew: true, // Mark as new for UI purposes
      },
    ]);

    // Reset new shortcut form
    setNewShortcut({ shortcut_code: '', quantity: 1, description: '' });
    setErrors((prev) => ({ ...prev, shortcut_code: '' }));
  };

  const handleDeleteShortcut = (index) => {
    setShortcuts((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.default_price || parseFloat(formData.default_price) < 0) {
      newErrors.default_price = 'Valid price is required';
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
      const submitData = {
        ...formData,
        default_price: parseFloat(formData.default_price),
        shortcuts: shortcuts.map((s) => ({
          id: s.id, // Include ID for existing shortcuts
          shortcut_code: s.shortcut_code,
          quantity: parseInt(s.quantity) || 1,
          description: s.description || '',
        })),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to save item:', error);
      setErrors({ submit: error.message || 'Failed to save item' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          {item ? 'Edit Item' : 'Create New Item'}
        </Typography>
        <Divider />
      </Box>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Item Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Item Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Item Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Unit *"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                error={!!errors.unit}
                helperText={errors.unit || 'e.g., piece, meter, kg'}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Price *"
                name="default_price"
                type="number"
                value={formData.default_price}
                onChange={handleChange}
                error={!!errors.default_price}
                helperText={errors.default_price}
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                helperText="e.g., timber, plywood, hardware"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                helperText="Stock Keeping Unit"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Shortcut Management */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Shortcuts
            <Chip
              label={`${shortcuts.length} shortcuts`}
              size="small"
              color="secondary"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add shortcut codes for quick item entry in orders
          </Typography>

          {/* Add Shortcut Form */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Shortcut Code"
                name="shortcut_code"
                value={newShortcut.shortcut_code}
                onChange={handleShortcutChange}
                error={!!errors.shortcut_code}
                helperText={errors.shortcut_code || 'e.g., PINE2X4'}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={newShortcut.quantity}
                onChange={handleShortcutChange}
                fullWidth
                size="small"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Description (optional)"
                name="description"
                value={newShortcut.description}
                onChange={handleShortcutChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddShortcut}
                fullWidth
                sx={{ height: '40px' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {/* Shortcuts List */}
          {shortcuts.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Shortcut Code</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortcuts.map((shortcut, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {shortcut.shortcut_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{shortcut.quantity}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {shortcut.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteShortcut(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No shortcuts added yet. Add shortcuts above for quick order entry.
            </Alert>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
