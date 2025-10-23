// ============================================================================
// FILE: src/components/features/OrderItemsTable.jsx
// Dynamic order items table with add/remove and auto-calculation
// ============================================================================

import { useState, useEffect } from 'react';
import ItemSelector from '../shared/ItemSelector.jsx';
import '../../styles/OrderItemsTable.css';

export default function OrderItemsTable({ items = [], onChange, readOnly = false }) {
  const [orderItems, setOrderItems] = useState(items);

  useEffect(() => {
    setOrderItems(items);
  }, [items]);

  // Calculate item totals
  const calculateItemTotals = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discountPercent = parseFloat(item.discount_percent) || 0;

    const totalPrice = quantity * unitPrice;
    const discountAmount = (totalPrice * discountPercent) / 100;
    const finalAmount = totalPrice - discountAmount;

    return {
      ...item,
      total_price: totalPrice,
      discount_amount: discountAmount,
      final_amount: finalAmount
    };
  };

  // Add new item from selector
  const handleAddItem = (selectedItem) => {
    const newItem = {
      item_id: selectedItem.id,
      item_name: selectedItem.name,
      item_name_urdu: selectedItem.name_urdu,
      unit: selectedItem.unit,
      unit_price: selectedItem.default_price,
      quantity: 1,
      discount_percent: 0,
      notes: ''
    };

    const calculatedItem = calculateItemTotals(newItem);
    const updatedItems = [...orderItems, calculatedItem];
    setOrderItems(updatedItems);
    onChange(updatedItems);
  };

  // Update item field
  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate totals if numeric field changed
    if (['quantity', 'unit_price', 'discount_percent'].includes(field)) {
      updatedItems[index] = calculateItemTotals(updatedItems[index]);
    }

    setOrderItems(updatedItems);
    onChange(updatedItems);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    onChange(updatedItems);
  };

  // Calculate order totals
  const calculateOrderTotals = () => {
    const totalAmount = orderItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    const totalDiscount = orderItems.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);
    const finalAmount = orderItems.reduce((sum, item) => sum + (parseFloat(item.final_amount) || 0), 0);

    return { totalAmount, totalDiscount, finalAmount };
  };

  const totals = calculateOrderTotals();

  return (
    <div className="order-items-table">
      {!readOnly && (
        <div className="add-item-section">
          <label>Add Item:</label>
          <ItemSelector onSelect={handleAddItem} placeholder="Search and select items..." />
        </div>
      )}

      {orderItems.length === 0 ? (
        <div className="empty-items">No items added yet</div>
      ) : (
        <>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Discount %</th>
                <th>Discount Amount</th>
                <th>Final Amount</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td className="item-name-cell">
                    <div>{item.item_name}</div>
                    {item.item_name_urdu && (
                      <div className="item-name-urdu-small">{item.item_name_urdu}</div>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      item.quantity
                    ) : (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        className="input-sm"
                      />
                    )}
                  </td>
                  <td>{item.unit}</td>
                  <td>
                    {readOnly ? (
                      `₨${parseFloat(item.unit_price).toFixed(2)}`
                    ) : (
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                        min="0"
                        step="0.01"
                        className="input-sm"
                      />
                    )}
                  </td>
                  <td className="amount">₨{parseFloat(item.total_price || 0).toFixed(2)}</td>
                  <td>
                    {readOnly ? (
                      `${item.discount_percent}%`
                    ) : (
                      <input
                        type="number"
                        value={item.discount_percent}
                        onChange={(e) => handleUpdateItem(index, 'discount_percent', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="input-sm"
                      />
                    )}
                  </td>
                  <td className="amount">₨{parseFloat(item.discount_amount || 0).toFixed(2)}</td>
                  <td className="amount final">₨{parseFloat(item.final_amount || 0).toFixed(2)}</td>
                  {!readOnly && (
                    <td className="actions">
                      <button
                        type="button"
                        className="btn-small btn-delete"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan="4" className="text-right"><strong>Order Totals:</strong></td>
                <td className="amount"><strong>₨{totals.totalAmount.toFixed(2)}</strong></td>
                <td></td>
                <td className="amount"><strong>₨{totals.totalDiscount.toFixed(2)}</strong></td>
                <td className="amount final"><strong>₨{totals.finalAmount.toFixed(2)}</strong></td>
                {!readOnly && <td></td>}
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
}
