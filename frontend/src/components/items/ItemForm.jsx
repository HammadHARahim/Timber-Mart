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
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
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
    } else {
      setFormData({
        name: '',
        unit: '',
        default_price: '',
        category: '',
        description: '',
        sku: '',
      });
      setShortcuts([]);
    }
    setErrors({});
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

  const handleCancel = () => {
    setFormData({
      name: '',
      unit: '',
      default_price: '',
      category: '',
      description: '',
      sku: '',
    });
    setShortcuts([]);
    setNewShortcut({ shortcut_code: '', quantity: 1, description: '' });
    setErrors({});
    onCancel();
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 800, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <InventoryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            {item ? 'Edit Item' : 'Create New Item'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {item
            ? 'Update item details and manage shortcuts'
            : 'Add a new item to the inventory with optional shortcuts'}
        </Typography>
      </Box>

      <Divider />

      {/* Error Alert */}
      {errors.submit && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setErrors((prev) => ({ ...prev, submit: '' }))}>
            {errors.submit}
          </Alert>
        </Box>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
        {/* Section 1: Item Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Item Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              required
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || 'Name of the product or material'}
              disabled={isSubmitting}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                error={!!errors.unit}
                helperText={errors.unit || 'e.g., piece, meter, kg, bundle'}
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                required
                label="Price"
                name="default_price"
                type="number"
                value={formData.default_price}
                onChange={handleChange}
                error={!!errors.default_price}
                helperText={errors.default_price || 'Default selling price'}
                disabled={isSubmitting}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                helperText="e.g., timber, plywood, hardware"
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                helperText="Stock Keeping Unit (optional)"
                disabled={isSubmitting}
              />
            </Box>

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={isSubmitting}
              helperText="Additional details about this item"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Shortcut Management */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Shortcuts
            </Typography>
            <Chip
              label={`${shortcuts.length} shortcut${shortcuts.length !== 1 ? 's' : ''}`}
              size="small"
              color="secondary"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Add shortcut codes for quick item entry when creating orders
          </Typography>

          {/* Add Shortcut Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Shortcut Code"
                name="shortcut_code"
                value={newShortcut.shortcut_code}
                onChange={handleShortcutChange}
                error={!!errors.shortcut_code}
                helperText={errors.shortcut_code || 'e.g., PINE2X4, OAK-1M'}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={newShortcut.quantity}
                onChange={handleShortcutChange}
                size="small"
                sx={{ width: 120 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Description (optional)"
                name="description"
                value={newShortcut.description}
                onChange={handleShortcutChange}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddShortcut}
                sx={{ height: 40 }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Shortcuts List */}
          {shortcuts.length > 0 ? (
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Shortcut Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortcuts.map((shortcut, index) => (
                    <TableRow key={index} hover>
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
            <Alert severity="info" sx={{ mt: 1 }}>
              No shortcuts added yet. Shortcuts are optional but useful for quick order entry.
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<SaveIcon />}
          >
            {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
