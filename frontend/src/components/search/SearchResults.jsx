// ============================================================================
// Search Results Component - Unified Layout with Emoji Icons
// Displays all results in a single, scannable view
// ============================================================================

import {
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SearchResults({ results, searchQuery }) {
  const navigate = useNavigate();

  // Entity configurations with emojis
  const entityConfig = {
    customers: {
      emoji: '👤',
      label: 'Customers',
      color: '#667eea',
      renderItem: (item) => (
        <Box
          key={item.id}
          sx={{
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
          onClick={() => navigate(`/customers/${item.id}`)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip
              label="👤 Customer"
              size="small"
              sx={{
                bgcolor: '#667eea20',
                color: '#667eea',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
            <Typography variant="body1" fontWeight={600}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {item.phone || item.email || ''}
            </Typography>
          </Box>
          {item.balance > 0 && (
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="warning.main" fontWeight={500}>
                Outstanding: Rs. {parseFloat(item.balance).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      )
    },
    orders: {
      emoji: '📦',
      label: 'Orders',
      color: '#f59e0b',
      renderItem: (item) => {
        const statusEmoji = {
          'COMPLETED': '✅',
          'CONFIRMED': '✓',
          'IN_PROGRESS': '🕓',
          'PENDING': '⏳',
          'CANCELLED': '❌',
          'DRAFT': '📝'
        };
        return (
          <Box
            key={item.id}
            sx={{
              py: 1.5,
              px: 2,
              cursor: 'pointer',
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => navigate(`/orders/${item.id}`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label="📦 Order"
                size="small"
                sx={{
                  bgcolor: '#f59e0b20',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              <Typography variant="body1" fontWeight={600}>
                {item.order_id}
              </Typography>
              <Chip
                label={`${statusEmoji[item.status] || ''} ${item.status}`}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                {item.customer?.name || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ pl: 2, display: 'flex', gap: 2 }}>
              {item.final_amount && (
                <Typography variant="body2" color="text.secondary">
                  Rs. {parseFloat(item.final_amount).toLocaleString()}
                </Typography>
              )}
              {item.order_date && (
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }
    },
    payments: {
      emoji: '💸',
      label: 'Payments',
      color: '#10b981',
      renderItem: (item) => (
        <Box
          key={item.id}
          sx={{
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
          onClick={() => navigate(`/payments/${item.id}`)}
        >
          <Typography variant="body1" fontWeight={500}>
            • Payment {item.payment_id} | Rs. {parseFloat(item.amount || 0).toLocaleString()} |
            Date: {item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} |
            By: {item.customer?.name || 'N/A'}
          </Typography>
          {item.payment_method && (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
              Method: {item.payment_method.replace('_', ' ')}
            </Typography>
          )}
        </Box>
      )
    },
    checks: {
      emoji: '🧾',
      label: 'Checks',
      color: '#8b5cf6',
      renderItem: (item) => (
        <Box
          key={item.id}
          sx={{
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
          onClick={() => navigate(`/checks/${item.id}`)}
        >
          <Typography variant="body1" fontWeight={500}>
            • Check {item.check_id} | Rs. {parseFloat(item.amount || 0).toLocaleString()} |
            Due: {item.due_date ? new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} |
            Bank: {item.bank_name || 'N/A'}
          </Typography>
          <Box sx={{ pl: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Check Number: {item.check_number || 'N/A'}
            </Typography>
            {item.status && (
              <Chip
                label={item.status}
                size="small"
                color={
                  item.status === 'CLEARED' ? 'success' :
                  item.status === 'PENDING' ? 'warning' :
                  item.status === 'BOUNCED' ? 'error' : 'default'
                }
              />
            )}
          </Box>
        </Box>
      )
    },
    projects: {
      emoji: '🏗️',
      label: 'Projects',
      color: '#3b82f6',
      renderItem: (item) => {
        const statusEmoji = {
          'COMPLETED': '✅',
          'IN_PROGRESS': '🔨',
          'PENDING': '⏳',
          'ON_HOLD': '⏸️',
          'CANCELLED': '❌'
        };
        return (
          <Box
            key={item.id}
            sx={{
              py: 1.5,
              px: 2,
              cursor: 'pointer',
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => navigate(`/projects/${item.id}`)}
          >
            <Typography variant="body1" fontWeight={500}>
              • Project: "{item.project_name || item.name}" | Status: {statusEmoji[item.status] || '•'} {item.status}
            </Typography>
            <Box sx={{ pl: 2, display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Customer: {item.customer?.name || 'N/A'}
              </Typography>
              {item.balance && (
                <Typography variant="body2" color="warning.main">
                  Balance: Rs. {parseFloat(item.balance).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }
    },
    items: {
      emoji: '🪵',
      label: 'Items',
      color: '#f97316',
      renderItem: (item) => (
        <Box
          key={item.id}
          sx={{
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
          onClick={() => navigate(`/items/${item.id}`)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight={500}>
              • {item.name} {item.name_urdu && `(${item.name_urdu})`}
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight={600}>
              Rs. {parseFloat(item.default_price || 0).toLocaleString()} / piece
            </Typography>
          </Box>
          {(item.stock_quantity !== undefined || item.category) && (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
              {item.stock_quantity !== undefined && `Stock: ${item.stock_quantity} pcs`}
              {item.category && ` | Category: ${item.category}`}
            </Typography>
          )}
        </Box>
      )
    },
    tokens: {
      emoji: '🪙',
      label: 'Tokens',
      color: '#ef4444',
      renderItem: (item) => {
        const statusEmoji = {
          'COMPLETED': '✅',
          'IN_TRANSIT': '🚛',
          'PENDING': '⏳',
          'CANCELLED': '❌'
        };
        return (
          <Box
            key={item.id}
            sx={{
              py: 1.5,
              px: 2,
              cursor: 'pointer',
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => navigate(`/tokens/${item.id}`)}
          >
            <Typography variant="body1" fontWeight={500}>
              • Token {item.token_id} | Linked Order: {item.order?.order_id || 'N/A'} |
              Customer: {item.customer_name || item.customer?.name || 'N/A'}
            </Typography>
            <Box sx={{ pl: 2, display: 'flex', gap: 2 }}>
              {item.vehicle_number && (
                <Typography variant="body2" color="text.secondary">
                  Vehicle: {item.vehicle_number}
                </Typography>
              )}
              {item.driver_name && (
                <Typography variant="body2" color="text.secondary">
                  Driver: {item.driver_name}
                </Typography>
              )}
              {item.status && (
                <Typography variant="body2" color="text.secondary">
                  Status: {statusEmoji[item.status] || '•'} {item.status}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }
    },
  };

  // Count total results
  const totalResults = Object.entries(results)
    .filter(([key]) => key !== 'summary')
    .reduce((sum, [, items]) => sum + (Array.isArray(items) ? items.length : 0), 0);

  if (totalResults === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No results found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search query or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Results Header */}
      <Box sx={{ mb: 2, pb: 1, borderBottom: 2, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} color="text.secondary">
          RESULTS FOR: "{searchQuery}"
        </Typography>
      </Box>

      {/* Unified Results List - All entities mixed together */}
      <Box>
        {(() => {
          // Flatten all results into a single array with metadata
          const allResults = [];

          Object.entries(entityConfig).forEach(([entityType, config]) => {
            const items = results[entityType];

            if (items && Array.isArray(items) && items.length > 0) {
              items.forEach((item) => {
                allResults.push({
                  entityType,
                  config,
                  data: item,
                });
              });
            }
          });

          // If no results, show empty state
          if (allResults.length === 0) {
            return null;
          }

          // Render unified list
          return allResults.map((result, idx) => {
            const { entityType, config, data } = result;
            return (
              <Box key={`${entityType}-${data.id || idx}`}>
                {config.renderItem(data)}
                {idx < allResults.length - 1 && <Divider sx={{ mx: 0 }} />}
              </Box>
            );
          });
        })()}
      </Box>

      {/* See All Results Button */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 2, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Showing all {totalResults} results
        </Typography>
      </Box>
    </Box>
  );
}
