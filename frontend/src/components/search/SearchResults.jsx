// ============================================================================
// Search Results Component - Displays results by entity type
// ============================================================================

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Business as ProjectsIcon,
  AttachMoney as PaymentsIcon,
  Receipt as ChecksIcon,
  QrCode as TokensIcon,
  Inventory as ItemsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function SearchResults({ results }) {
  const navigate = useNavigate();

  const entityConfig = {
    customers: {
      icon: <PeopleIcon />,
      label: 'Customers',
      color: '#667eea',
      columns: ['ID', 'Name', 'Phone', 'Email', 'Type'],
      renderRow: (item) => [
        item.customer_id,
        item.name,
        item.phone || '-',
        item.email || '-',
        <Chip label={item.customer_type} size="small" />
      ]
    },
    orders: {
      icon: <OrdersIcon />,
      label: 'Orders',
      color: '#f59e0b',
      columns: ['Order ID', 'Customer', 'Date', 'Amount', 'Status'],
      renderRow: (item) => [
        item.order_id,
        item.customer?.name || '-',
        new Date(item.order_date).toLocaleDateString(),
        `₨${parseFloat(item.final_amount || 0).toLocaleString()}`,
        <Chip label={item.status} size="small" color={item.status === 'COMPLETED' ? 'success' : 'warning'} />
      ]
    },
    projects: {
      icon: <ProjectsIcon />,
      label: 'Projects',
      color: '#3b82f6',
      columns: ['Project ID', 'Name', 'Customer', 'Status', 'Balance'],
      renderRow: (item) => [
        item.project_id,
        item.project_name,
        item.customer?.name || '-',
        <Chip label={item.status} size="small" />,
        `₨${parseFloat(item.balance || 0).toLocaleString()}`
      ]
    },
    payments: {
      icon: <PaymentsIcon />,
      label: 'Payments',
      color: '#10b981',
      columns: ['Payment ID', 'Customer', 'Amount', 'Method', 'Date'],
      renderRow: (item) => [
        item.payment_id,
        item.customer?.name || '-',
        `₨${parseFloat(item.amount || 0).toLocaleString()}`,
        item.payment_method,
        new Date(item.created_at).toLocaleDateString()
      ]
    },
    checks: {
      icon: <ChecksIcon />,
      label: 'Checks',
      color: '#8b5cf6',
      columns: ['Check ID', 'Check Number', 'Bank', 'Amount', 'Status'],
      renderRow: (item) => [
        item.check_id,
        item.check_number,
        item.bank_name || '-',
        `₨${parseFloat(item.amount || 0).toLocaleString()}`,
        <Chip label={item.status} size="small" color={item.status === 'CLEARED' ? 'success' : 'warning'} />
      ]
    },
    tokens: {
      icon: <TokensIcon />,
      label: 'Tokens',
      color: '#ef4444',
      columns: ['Token ID', 'Customer', 'Vehicle', 'Driver', 'Status'],
      renderRow: (item) => [
        item.token_id,
        item.customer_name || '-',
        item.vehicle_number || '-',
        item.driver_name || '-',
        <Chip label={item.status} size="small" />
      ]
    },
    items: {
      icon: <ItemsIcon />,
      label: 'Items',
      color: '#f97316',
      columns: ['Item ID', 'Name', 'Name (Urdu)', 'Category', 'Price'],
      renderRow: (item) => [
        item.item_id,
        item.name || '-',
        item.name_urdu || '-',
        item.category || '-',
        `₨${parseFloat(item.default_price || 0).toLocaleString()}`
      ]
    },
  };

  return (
    <Box>
      {Object.entries(results).map(([entityType, items]) => {
        if (entityType === 'summary' || !items || items.length === 0) return null;

        const config = entityConfig[entityType];
        if (!config) return null;

        return (
          <Accordion key={entityType} defaultExpanded={items.length > 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {config.label}
                </Typography>
                <Badge badgeContent={items.length} color="primary" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {config.columns.map((col, idx) => (
                        <TableCell key={idx} sx={{ fontWeight: 600 }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => {
                      const rowData = config.renderRow(item);
                      return (
                        <TableRow
                          key={idx}
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => {
                            // Navigate to respective page
                            const routes = {
                              customers: '/customers',
                              orders: '/orders',
                              projects: '/projects',
                              payments: '/payments',
                              checks: '/checks',
                              tokens: '/tokens',
                              items: '/items',
                            };
                            navigate(routes[entityType]);
                          }}
                        >
                          {rowData.map((cell, cellIdx) => (
                            <TableCell key={cellIdx}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* No results */}
      {Object.values(results).every(v => !Array.isArray(v) || v.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search query or filters
          </Typography>
        </Box>
      )}
    </Box>
  );
}
