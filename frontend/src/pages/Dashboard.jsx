// ============================================================================
// Dashboard Page - Material UI Version
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as PaymentsIcon,
  Business as ProjectsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/apiClient';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalPayments: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects/dashboard-stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₨${parseFloat(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: 'View all customers',
      icon: PeopleIcon,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.12)',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: 'Manage orders',
      icon: OrdersIcon,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
    },
    {
      title: 'Total Payments',
      value: formatCurrency(stats.totalPayments),
      subtitle: 'View reports',
      icon: PaymentsIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      subtitle: `${stats.activeProjects} active, ${stats.completedProjects} completed`,
      icon: ProjectsIcon,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.12)',
    },
  ];

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user.full_name || user.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} mb={4}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: card.bgColor,
                        color: card.color,
                        width: 56,
                        height: 56,
                      }}
                    >
                      <card.icon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: 0.5,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={700} my={0.5}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* User Info Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Your Account
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="space-between" py={1.5}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Role:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.role}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" py={1.5}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.email}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" py={1.5}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Department:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.department || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
