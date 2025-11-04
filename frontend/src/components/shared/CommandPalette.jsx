// ============================================================================
// Command Palette - Professional ⌘K Search Interface
// Inspired by Linear, Vercel, GitHub command palettes
// ============================================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Fade,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  People as CustomersIcon,
  ShoppingCart as OrdersIcon,
  Business as ProjectsIcon,
  AttachMoney as PaymentsIcon,
  Receipt as ChecksIcon,
  QrCode as TokensIcon,
  Inventory as ItemsIcon,
  KeyboardArrowRight as ArrowIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/apiClient';

const ENTITY_CONFIG = {
  customers: {
    emoji: '👤',
    icon: <CustomersIcon />,
    label: 'Customers',
    color: '#667eea',
    route: '/customers',
  },
  orders: {
    emoji: '📦',
    icon: <OrdersIcon />,
    label: 'Orders',
    color: '#f59e0b',
    route: '/orders',
  },
  projects: {
    emoji: '🏗️',
    icon: <ProjectsIcon />,
    label: 'Projects',
    color: '#3b82f6',
    route: '/projects',
  },
  payments: {
    emoji: '💸',
    icon: <PaymentsIcon />,
    label: 'Payments',
    color: '#10b981',
    route: '/payments',
  },
  checks: {
    emoji: '🧾',
    icon: <ChecksIcon />,
    label: 'Checks',
    color: '#8b5cf6',
    route: '/checks',
  },
  tokens: {
    emoji: '🪙',
    icon: <TokensIcon />,
    label: 'Tokens',
    color: '#ef4444',
    route: '/tokens',
  },
  items: {
    emoji: '🪵',
    icon: <ItemsIcon />,
    label: 'Items',
    color: '#f97316',
    route: '/items',
  },
};

// Helper function to highlight matched text
const HighlightedText = ({ text, query }) => {
  if (!query || !text) return text;

  const parts = text.toString().split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Box
            component="span"
            key={index}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 0.5,
              borderRadius: 0.5,
              fontWeight: 700,
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function CommandPalette({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('commandPaletteRecent');
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/search', {
          params: {
            q: searchQuery,
            searchMode: 'fuzzy',
            limit: 8, // Limit for command palette
          },
        });

        if (response.success) {
          setResults(response.data);
          setSelectedIndex(0); // Reset selection
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 200); // 200ms debounce for instant feel

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Flatten results for keyboard navigation
  const flattenedResults = useMemo(() => {
    if (!results) return [];

    const items = [];
    Object.entries(ENTITY_CONFIG).forEach(([entityType, config]) => {
      const entityResults = results[entityType];
      if (entityResults && entityResults.length > 0) {
        entityResults.forEach((item) => {
          items.push({
            type: entityType,
            data: item,
            config,
          });
        });
      }
    });
    return items;
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!flattenedResults.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flattenedResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flattenedResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flattenedResults[selectedIndex]) {
            handleItemSelect(flattenedResults[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    },
    [flattenedResults, selectedIndex, onClose]
  );

  // Handle item selection
  const handleItemSelect = (item) => {
    const { type, data } = item;

    // Save to recent searches
    const newRecent = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('commandPaletteRecent', JSON.stringify(newRecent));

    // Navigate to detail page
    navigate(`/${type}/${data.id}`);
    onClose();
  };

  // Handle recent search click
  const handleRecentClick = (query) => {
    setSearchQuery(query);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('commandPaletteRecent');
  };

  // Get formatted display for each result item
  const getResultDisplay = (item) => {
    const { type, data } = item;

    switch (type) {
      case 'customers':
        return {
          primary: data.name,
          secondary: data.phone || data.email || '',
        };
      case 'orders':
        return {
          primary: data.order_id,
          secondary: `${data.customer?.name || 'N/A'} • Rs. ${parseFloat(
            data.final_amount || 0
          ).toLocaleString()}`,
        };
      case 'projects':
        return {
          primary: data.project_name || data.name,
          secondary: data.customer?.name || '',
        };
      case 'payments':
        return {
          primary: data.payment_id,
          secondary: `Rs. ${parseFloat(
            data.amount || 0
          ).toLocaleString()} • ${data.customer?.name || 'N/A'}`,
        };
      case 'checks':
        return {
          primary: `Check ${data.check_id}`,
          secondary: `${data.bank_name || 'N/A'} • Rs. ${parseFloat(
            data.amount || 0
          ).toLocaleString()}`,
        };
      case 'tokens':
        return {
          primary: data.token_id,
          secondary: data.customer_name || data.customer?.name || 'N/A',
        };
      case 'items':
        return {
          primary: data.name,
          secondary: `Rs. ${parseFloat(
            data.default_price || 0
          ).toLocaleString()} / ${data.unit || 'piece'}`,
        };
      default:
        return { primary: '', secondary: '' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 100,
          m: 0,
          borderRadius: 2,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
      }}
      TransitionComponent={Fade}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/* Search Input */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            inputRef={searchInputRef}
            placeholder="Search anything... (customers, orders, items)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon />
                  )}
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Chip
                    label="ESC"
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
              },
            }}
          />
        </Box>

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <HistoryIcon sx={{ fontSize: 14 }} />
                Recent searches
              </Typography>
              <Typography
                variant="caption"
                color="error"
                sx={{ cursor: 'pointer' }}
                onClick={clearRecentSearches}
              >
                Clear
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {recentSearches.map((query, idx) => (
                <Chip
                  key={idx}
                  label={query}
                  size="small"
                  onClick={() => handleRecentClick(query)}
                  clickable
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Results */}
        {searchQuery && (
          <List sx={{ maxHeight: '60vh', overflow: 'auto', p: 0 }}>
            {loading ? (
              // Loading skeleton
              <>
                {[1, 2, 3, 4].map((i) => (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Skeleton width="60%" />}
                      secondary={<Skeleton width="40%" />}
                    />
                  </ListItem>
                ))}
              </>
            ) : flattenedResults.length > 0 ? (
              // Results list
              flattenedResults.map((item, idx) => {
                const { primary, secondary } = getResultDisplay(item);
                const isSelected = idx === selectedIndex;

                return (
                  <ListItemButton
                    key={`${item.type}-${item.data.id}`}
                    selected={isSelected}
                    onClick={() => handleItemSelect(item)}
                    sx={{
                      borderLeft: isSelected ? 3 : 0,
                      borderColor: 'primary.main',
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: `${item.config.color}15`,
                          color: item.config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.config.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            <HighlightedText
                              text={primary}
                              query={searchQuery}
                            />
                          </Typography>
                          <Chip
                            label={item.config.label}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor: `${item.config.color}15`,
                              color: item.config.color,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          <HighlightedText text={secondary} query={searchQuery} />
                        </Typography>
                      }
                    />
                    <ArrowIcon
                      sx={{ color: 'text.disabled', fontSize: 16 }}
                    />
                  </ListItemButton>
                );
              })
            ) : (
              // Empty state
              <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                <SearchIcon
                  sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try searching with different keywords
                </Typography>
              </Box>
            )}
          </List>
        )}

        {/* Help Footer */}
        {!searchQuery && recentSearches.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Start typing to search across all entities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
              <Chip
                label="↑↓ Navigate"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="↵ Select"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="ESC Close"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        )}

        {/* Keyboard Navigation Footer */}
        {searchQuery && flattenedResults.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              bgcolor: 'background.default',
            }}
          >
            <Chip label="↑↓" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            <Chip label="↵ Open" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            <Chip label="ESC" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
