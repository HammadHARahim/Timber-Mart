// ============================================================================
// Check Detail Page - Matches OrderDetail visual pattern
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Receipt as CheckIcon,
  Person as PersonIcon,
  Business as ProjectIcon,
  AccountBalance as BankIcon,
  CalendarToday as CalendarIcon,
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
    navigate('/checks', { state: { editCheckId: id } });
  };

  const getStatusInfo = (status) => {
    const statuses = {
      PENDING: { color: 'warning', label: 'Pending' },
      CLEARED: { color: 'success', label: 'Cleared' },
      BOUNCED: { color: 'error', label: 'Bounced' },
      CANCELLED: { color: 'default', label: 'Cancelled' },
    };
    return statuses[status] || statuses.PENDING;
  };

  if (loading) {
    return (
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
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !check) {
    return (
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
          p: 2,
        }}
        onClick={handleClose}
      >
        <Alert severity="error">{error || 'Check not found'}</Alert>
      </Box>
    );
  }

  return (
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
        p: 2,
      }}
      onClick={handleClose}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          maxWidth: 1200,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 24,
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
            margin: '8px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: '10px',
            border: '2px solid',
            borderColor: 'background.paper',
            '&:hover': {
              bgcolor: 'grey.600',
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Paper elevation={0} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Check Details
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {check.check_id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={handleClose}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Check Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Check Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Check Number:
                </Typography>
                <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                  {check.check_number || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Bank Name:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {check.bank_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status:
                </Typography>
                <Chip
                  label={getStatusInfo(check.status).label}
                  size="small"
                  color={getStatusInfo(check.status).color}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Issue Date:
                </Typography>
                <Typography variant="body1">
                  {check.issue_date ? new Date(check.issue_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Due Date:
                </Typography>
                <Typography variant="body1">
                  {check.due_date ? new Date(check.due_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Amount */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Amount
            </Typography>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Check Amount:
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      Rs. {parseFloat(check.amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Status Timeline */}
          {(check.cleared_date || check.bounced_date) && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Status History
                </Typography>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: check.status === 'CLEARED' ? 'success.light' : 'error.light',
                    borderColor: check.status === 'CLEARED' ? 'success.main' : 'error.main'
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {check.cleared_date && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Cleared Date:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {new Date(check.cleared_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Grid>
                      )}
                      {check.bounced_date && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Bounced Date:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {new Date(check.bounced_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Related Entities */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Related Information
            </Typography>
            <Grid container spacing={2}>
              {check.customer && (
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/customers/${check.customer.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
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
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/projects/${check.project.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ProjectIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
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
          </Box>

          {/* Notes */}
          {check.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{check.notes}</Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* Metadata */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              {check.created_by && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created By:
                  </Typography>
                  <Typography variant="body1">
                    {check.created_by.username || check.created_by.email}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {check.created_at ? new Date(check.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              {check.updated_at && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(check.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sync Status:
                </Typography>
                <Chip
                  label={check.sync_status || 'SYNCED'}
                  size="small"
                  color={check.sync_status === 'SYNCED' ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
