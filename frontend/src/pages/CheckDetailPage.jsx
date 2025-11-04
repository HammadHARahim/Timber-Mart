// ============================================================================
// Check Detail Page - Drawer-based detail view
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
  Receipt as CheckIcon,
  Person as PersonIcon,
  Business as ProjectIcon,
  AccountBalance as BankIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AmountIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';

export default function CheckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCheckDetails();
    }
  }, [id]);

  const fetchCheckDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/checks/${id}`);
      if (response.success) {
        setCheck(response.data);
      }
    } catch (err) {
      console.error('Error fetching check:', err);
      setError('Failed to load check details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/checks');
  };

  const handleEdit = () => {
    navigate(`/checks/edit/${id}`);
  };

  const getStatusInfo = (status) => {
    const statuses = {
      PENDING: { color: 'warning', icon: '⏳', label: 'Pending' },
      CLEARED: { color: 'success', icon: '✅', label: 'Cleared' },
      BOUNCED: { color: 'error', icon: '❌', label: 'Bounced' },
      CANCELLED: { color: 'default', icon: '⛔', label: 'Cancelled' },
    };
    return statuses[status] || statuses.PENDING;
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
          bgcolor: '#8b5cf6',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon />
          <Typography variant="h6" fontWeight={600}>
            Check Details
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
        ) : check ? (
          <>
            {/* Main Info */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Check {check.check_id}
                  </Typography>
                  <Chip
                    label={`${getStatusInfo(check.status).icon} ${getStatusInfo(check.status).label}`}
                    size="small"
                    color={getStatusInfo(check.status).color}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Amount
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    Rs. {parseFloat(check.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Check Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Check Number
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {check.check_number || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <BankIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Bank Name
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {check.bank_name || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarIcon color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Issue Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {check.issue_date ? new Date(check.issue_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{
                    borderColor: check.status === 'PENDING' ? 'warning.main' : 'divider',
                    bgcolor: check.status === 'PENDING' ? 'warning.light' : 'background.paper'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarIcon color="warning" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        {check.due_date ? new Date(check.due_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Related Entities */}
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                Related Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {check.customer && (
                  <Grid item xs={12}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/customers/${check.customer.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PersonIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Customer
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {check.customer.name}
                        </Typography>
                        {check.customer.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {check.customer.phone}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {check.project && (
                  <Grid item xs={12}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/projects/${check.project.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <ProjectIcon color="primary" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Project
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {check.project.project_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Status Timeline (if status is cleared or bounced) */}
              {(check.cleared_date || check.bounced_date) && (
                <Card variant="outlined" sx={{ mb: 2, bgcolor: check.status === 'CLEARED' ? 'success.light' : 'error.light' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Status Update
                    </Typography>
                    {check.cleared_date && (
                      <Typography variant="body2">
                        ✅ Cleared on: {new Date(check.cleared_date).toLocaleDateString()}
                      </Typography>
                    )}
                    {check.bounced_date && (
                      <Typography variant="body2">
                        ❌ Bounced on: {new Date(check.bounced_date).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {check.notes && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Notes
                    </Typography>
                    <Typography variant="body2">{check.notes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {check.created_at ? new Date(check.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {check.updated_at && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Updated: {new Date(check.updated_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="warning" sx={{ m: 2 }}>
            Check not found
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}
