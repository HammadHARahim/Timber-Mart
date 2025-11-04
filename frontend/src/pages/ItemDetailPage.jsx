// ============================================================================
// Item Detail Page - Drawer-based detail view
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Inventory as ItemIcon,
  AttachMoney as PriceIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/items/${id}`);
      if (response.success) {
        setItem(response.data);
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/items');
  };

  const handleEdit = () => {
    navigate(`/items/edit/${id}`);
  };

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: '70%', lg: '40%' },
          maxWidth: 700,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: '#f97316',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ItemIcon />
          <Typography variant="h6" fontWeight={600}>
            Item Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleEdit} sx={{ color: 'inherit' }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : item ? (
          <>
            {/* Main Info */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {item.name}
                  </Typography>
                  {item.name_urdu && (
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {item.name_urdu}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {item.category && (
                      <Chip
                        label={item.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {item.item_id && (
                      <Chip
                        label={item.item_id}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Default Price
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    Rs. {parseFloat(item.default_price || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per {item.unit || 'piece'}
                  </Typography>
                </Box>
              </Box>

              {/* Pricing & Stock Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PriceIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Default Price
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Rs. {parseFloat(item.default_price || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per {item.unit || 'piece'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {item.stock_quantity !== undefined && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <ItemIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Stock Quantity
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          {item.stock_quantity} {item.unit || 'pcs'}
                        </Typography>
                        {item.stock_quantity < 10 && (
                          <Chip
                            label="Low Stock"
                            size="small"
                            color="warning"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {item.category && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <CategoryIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Category
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {item.category}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {item.unit && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <DescriptionIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Unit of Measurement
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {item.unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Additional Details */}
              {item.description && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Description
                    </Typography>
                    <Typography variant="body2">{item.description}</Typography>
                  </CardContent>
                </Card>
              )}

              {/* Pricing Details */}
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    📊 Pricing Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Base Price:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          Rs. {parseFloat(item.default_price || 0).toLocaleString()} / {item.unit || 'piece'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts (if defined) */}
              {item.keyboard_shortcut && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      ⌨️ Keyboard Shortcut
                    </Typography>
                    <Chip
                      label={item.keyboard_shortcut}
                      color="primary"
                      sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Status */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Status
                  </Typography>
                  <Chip
                    label={item.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={item.is_active ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {item.updated_at && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Updated: {new Date(item.updated_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ m: 2 }}>
            Item not found
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}
