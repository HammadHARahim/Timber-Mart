// ============================================================================
// Global Search Page - Material UI Version
// Phase 9: Advanced Search & Filtering
// ============================================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';
import SearchResults from '../components/search/SearchResults';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GlobalSearchPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchMode, setSearchMode] = useState('fuzzy'); // 'fuzzy' or 'exact'
  const [liveSearch, setLiveSearch] = useState(true);

  // Filter state
  const [selectedEntities, setSelectedEntities] = useState({
    customers: true,
    orders: true,
    projects: true,
    payments: true,
    checks: true,
    tokens: true,
    items: true,
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: '',
  });

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // Search history
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce timer ref
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load saved searches and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved searches:', e);
      }
    }

    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }

    // Load last search filters
    const lastFilters = localStorage.getItem('lastSearchFilters');
    if (lastFilters) {
      try {
        const parsed = JSON.parse(lastFilters);
        if (parsed.filters) setFilters(parsed.filters);
        if (parsed.entities) setSelectedEntities(parsed.entities);
      } catch (e) {
        console.error('Failed to load last filters:', e);
      }
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (isLiveSearch = false) => {
    // REQUIRE search query - don't search with empty query
    if (!searchQuery.trim()) {
      if (!isLiveSearch) {
        setError('Please enter a search query');
      }
      setSearchResults(null);
      return;
    }

    // Build query parameters
    const entitiesParam = Object.keys(selectedEntities).filter(k => selectedEntities[k]).join(',');

    // REQUIRE at least one entity to be selected
    if (!entitiesParam) {
      if (!isLiveSearch) {
        setError('Please select at least one entity type to search in');
      }
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        q: searchQuery.trim(),
        searchMode: searchMode,
        entities: entitiesParam,
        ...filters
      };

      const response = await api.get('/api/search', { params });

      if (response.success) {
        setSearchResults(response.data);

        // Add to search history (only if query is not empty and not a live search)
        if (searchQuery.trim() && !isLiveSearch) {
          const historyItem = {
            query: searchQuery.trim(),
            filters: { ...filters },
            entities: { ...selectedEntities },
            searchMode: searchMode,
            timestamp: new Date().toISOString(),
          };
          const newHistory = [historyItem, ...searchHistory.slice(0, 9)]; // Keep last 10
          setSearchHistory(newHistory);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }

        // Save last filters
        if (!isLiveSearch) {
          localStorage.setItem('lastSearchFilters', JSON.stringify({
            filters,
            entities: selectedEntities,
            searchMode
          }));
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      if (!isLiveSearch) {
        setError('Failed to perform search. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedEntities, filters, searchMode, searchHistory]);

  const hasActiveFilters = () => {
    return filters.startDate || filters.endDate || filters.minAmount ||
           filters.maxAmount || filters.status;
  };

  // Live search effect with debouncing
  useEffect(() => {
    if (!liveSearch) return;

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // ONLY search if there's a query - don't search on filter changes alone
    if (searchQuery.trim()) {
      debounceTimer.current = setTimeout(() => {
        handleSearch(true); // true indicates live search
      }, 500); // 500ms debounce
    } else {
      setSearchResults(null);
    }

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, liveSearch, handleSearch]);

  // Handle quick filters
  const applyQuickFilter = (preset) => {
    const now = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        const first = now.getDate() - now.getDay() + 1;
        startDate = new Date(now);
        startDate.setDate(first);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    setFilters(newFilters);

    // Auto-trigger search if not in live search mode
    if (!liveSearch) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle entity toggle
  const toggleEntity = (entity) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      status: '',
    });
    setSelectedEntities({
      customers: true,
      orders: true,
      projects: true,
      payments: true,
      checks: true,
      tokens: true,
      items: true,
    });
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!searchName.trim()) {
      setError('Please enter a name for this search');
      return;
    }

    const newSearch = {
      id: Date.now(),
      name: searchName.trim(),
      query: searchQuery,
      filters: { ...filters },
      entities: { ...selectedEntities },
      savedAt: new Date().toISOString(),
    };

    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setSearchName('');
    setSuccessMessage('Search saved successfully!');
  };

  // Load saved search
  const loadSavedSearch = (search) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    setSelectedEntities(search.entities);
  };

  // Delete saved search
  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setSuccessMessage('Recent searches cleared!');
  };

  // Export results
  const exportResults = () => {
    if (!searchResults) return;

    const allResults = [
      ...(searchResults.customers || []).map(r => ({ ...r, type: 'Customer' })),
      ...(searchResults.orders || []).map(r => ({ ...r, type: 'Order' })),
      ...(searchResults.projects || []).map(r => ({ ...r, type: 'Project' })),
      ...(searchResults.payments || []).map(r => ({ ...r, type: 'Payment' })),
      ...(searchResults.checks || []).map(r => ({ ...r, type: 'Check' })),
      ...(searchResults.tokens || []).map(r => ({ ...r, type: 'Token' })),
      ...(searchResults.items || []).map(r => ({ ...r, type: 'Item' })),
    ];

    // Create CSV
    const headers = ['Type', 'ID', 'Name/Description', 'Date', 'Amount'];
    const rows = allResults.map(item => [
      item.type,
      item.customer_id || item.order_id || item.project_id || item.payment_id || item.check_id || item.token_id || item.item_id || '-',
      item.name || item.customer_name || item.project_name || item.project?.name || '-',
      item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
      item.amount || item.final_amount || item.balance || item.default_price || '-'
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setSuccessMessage('CSV exported successfully!');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Global Search
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Search across all entities with advanced filtering
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              inputRef={searchInputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 28 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {searchQuery && (
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon />
                        </IconButton>
                      )}
                      <Chip
                        label="⌘K"
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: 'action.selected',
                          cursor: 'help'
                        }}
                      />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.1rem',
                  py: 1
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              onClick={() => handleSearch()}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>

        {/* Search Mode and Live Search Controls */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Search Mode:
            </Typography>
            <ToggleButtonGroup
              value={searchMode}
              exclusive
              onChange={(e, value) => value && setSearchMode(value)}
              size="small"
            >
              <ToggleButton value="fuzzy">
                Fuzzy
              </ToggleButton>
              <ToggleButton value="exact">
                Exact
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={liveSearch}
                onChange={(e) => setLiveSearch(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Live Search (Auto-search as you type)</Typography>}
          />
        </Box>

        {/* Quick Filters */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Quick Filters:
          </Typography>
          <Chip
            label="Today"
            onClick={() => applyQuickFilter('today')}
            clickable
            variant={filters.startDate && filters.startDate === new Date().toISOString().split('T')[0] ? 'filled' : 'outlined'}
          />
          <Chip
            label="This Week"
            onClick={() => applyQuickFilter('thisWeek')}
            clickable
            variant="outlined"
          />
          <Chip
            label="This Month"
            onClick={() => applyQuickFilter('thisMonth')}
            clickable
            variant="outlined"
          />
          {hasActiveFilters() && (
            <Chip
              label="Clear Filters"
              color="error"
              variant="outlined"
              onClick={clearFilters}
              onDelete={clearFilters}
              deleteIcon={<ClearIcon />}
            />
          )}
        </Box>
      </Paper>

      {/* Filters & Options */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">Advanced Filters</Typography>
            {hasActiveFilters() && (
              <Chip label="Active" color="primary" size="small" sx={{ ml: 1 }} />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Entity Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Search In:
              </Typography>
              <FormGroup row>
                {Object.keys(selectedEntities).map(entity => (
                  <FormControlLabel
                    key={entity}
                    control={
                      <Checkbox
                        checked={selectedEntities[entity]}
                        onChange={() => toggleEntity(entity)}
                      />
                    }
                    label={entity.charAt(0).toUpperCase() + entity.slice(1)}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Min Amount"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₨</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Amount"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₨</InputAdornment>,
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>

            {/* Apply Filters Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={!hasActiveFilters() && Object.values(selectedEntities).every(v => v)}
                >
                  Reset All
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => handleSearch()}
                  disabled={loading}
                >
                  Apply Filters & Search
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Saved Searches & History Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab icon={<HistoryIcon />} label="Recent Searches" />
          <Tab icon={<SaveIcon />} label="Saved Searches" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 2 }}>
            {searchHistory.length === 0 ? (
              <Typography color="text.secondary">No recent searches</Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchHistory.length} recent {searchHistory.length === 1 ? 'search' : 'searches'}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<DeleteSweepIcon />}
                    onClick={clearRecentSearches}
                    color="error"
                  >
                    Clear All
                  </Button>
                </Box>
                <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                {searchHistory.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={`"${item.query}" - ${new Date(item.timestamp).toLocaleString()}`}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setFilters(item.filters);
                      setSelectedEntities(item.entities);
                    }}
                    clickable
                    sx={{
                      maxWidth: 'fit-content',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      }
                    }}
                  />
                ))}
              </Box>
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Save Current Search */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveCurrentSearch}
                disabled={!searchQuery && !hasActiveFilters()}
              >
                Save Current
              </Button>
            </Box>

            {/* Saved Searches List */}
            {savedSearches.length === 0 ? (
              <Typography color="text.secondary">No saved searches</Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                {savedSearches.map((search) => (
                  <Chip
                    key={search.id}
                    label={search.name}
                    onClick={() => loadSavedSearch(search)}
                    onDelete={() => deleteSavedSearch(search.id)}
                    clickable
                    sx={{
                      maxWidth: 'fit-content',
                      '&:hover': {
                        backgroundColor: 'secondary.light',
                        color: 'secondary.contrastText',
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {searchResults.summary.totalResults} {searchResults.summary.totalResults === 1 ? 'result' : 'results'} found
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportResults}
              disabled={searchResults.summary.totalResults === 0}
            >
              Export CSV
            </Button>
          </Box>

          <SearchResults results={searchResults} searchQuery={searchQuery} />
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Searching...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we search across all entities
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!searchResults && !loading && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start searching to find results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a search query or apply filters to search across all entities
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
