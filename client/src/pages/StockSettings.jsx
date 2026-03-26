import React, { useEffect, useState } from 'react';
import { inventoryAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function StockSettings() {
  const [summary, setSummary] = useState(null);
  const [stockInput, setStockInput] = useState('');

  const load = async () => {
    try {
      const { data } = await inventoryAPI.getSummary();
      setSummary(data);
      setStockInput(data.totalStock);
    } catch (err) {
      toast.error('Failed to load inventory summary');
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async () => {
    const val = parseInt(stockInput);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid stock count'); return; }
    await inventoryAPI.setStock({ totalRolls: val });
    toast.success('Stock updated');
    load();
  };

  if (!summary) return <div className="empty">Loading...</div>;

  const { totalStock, totalDispatched, totalReturned, rollsWithVendors, availableRolls } = summary;

  return (
    <>
      <div className="page-title">Stock Settings</div>
      <div className="page-sub">Manage your total roll inventory count</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700 }}>
        <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: 16 }}>Current Usage Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Dispatched', val: totalDispatched, color: 'var(--accent2)' },
              { label: 'Total Returned', val: totalReturned, color: 'var(--green)' },
              { label: 'Currently with Vendors', val: rollsWithVendors, color: 'var(--accent2)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 7 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.label}</span>
                <b style={{ color: row.color, fontFamily: 'Syne, sans-serif', fontSize: 18 }}>{row.val}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
