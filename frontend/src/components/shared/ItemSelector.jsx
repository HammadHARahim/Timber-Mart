// ============================================================================
// FILE: src/components/shared/ItemSelector.jsx
// Autocomplete item selector component
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import itemService from '../../services/itemService.js';
import '../../styles/ItemSelector.css';

export default function ItemSelector({ onSelect, placeholder = "Search items..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setItems([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await itemService.searchItems(searchTerm);
        setItems(response.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search failed:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item, shortcut = null) => {
    // If a shortcut was selected, include its quantity
    const itemData = shortcut
      ? { ...item, selectedShortcut: shortcut }
      : item;

    onSelect(itemData);
    setSearchTerm('');
    setItems([]);
    setShowDropdown(false);
  };

  return (
    <div className="item-selector" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="item-search-input"
        onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
      />

      {loading && <div className="search-loading">Searching...</div>}

      {showDropdown && items.length > 0 && (
        <ul className="item-dropdown">
          {items.flatMap((item) => {
            const options = [
              /* Main item option */
              <li
                key={`item-${item.id}`}
                onClick={() => handleSelect(item)}
                className="item-dropdown-option"
              >
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.name_urdu && (
                    <span className="item-name-urdu">{item.name_urdu}</span>
                  )}
                </div>
                <div className="item-meta">
                  <span className="item-category">{item.category}</span>
                  <span className="item-price">₨{parseFloat(item.default_price).toFixed(2)}/{item.unit}</span>
                </div>
              </li>
            ];

            /* Add shortcut options for this item */
            if (item.shortcuts && item.shortcuts.length > 0) {
              item.shortcuts.forEach((shortcut) => {
                options.push(
                  <li
                    key={`shortcut-${shortcut.id}`}
                    onClick={() => handleSelect(item, shortcut)}
                    className="item-dropdown-option shortcut-option"
                    style={{ paddingLeft: '20px', backgroundColor: '#f8f9fa' }}
                  >
                    <div className="item-info">
                      <span className="item-name">
                        <strong style={{ color: '#6366f1' }}>{shortcut.shortcut_code}</strong>
                        {' → '}{item.name}
                      </span>
                      {shortcut.description && (
                        <span className="item-name-urdu" style={{ fontSize: '0.85em' }}>
                          {shortcut.description}
                        </span>
                      )}
                    </div>
                    <div className="item-meta">
                      <span className="item-category">Qty: {shortcut.quantity}</span>
                      <span className="item-price">
                        ₨{(parseFloat(item.default_price) * shortcut.quantity).toFixed(2)}
                      </span>
                    </div>
                  </li>
                );
              });
            }

            return options;
          })}
        </ul>
      )}

      {showDropdown && searchTerm.length >= 2 && items.length === 0 && !loading && (
        <div className="no-results">No items found</div>
      )}
    </div>
  );
}
