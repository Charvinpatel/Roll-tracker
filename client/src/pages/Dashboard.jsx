import React, { useEffect, useState } from 'react';
import { inventoryAPI, dispatchAPI } from '../utils/api';
import toast from 'react-hot-toast';
import DispatchModal from '../components/DispatchModal';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [showDispatch, setShowDispatch] = useState(false);

  const load = () => inventoryAPI.getSummary().then(r => setSummary(r.data)).catch(() => toast.error('Failed to load summary'));

  useEffect(() => { load(); }, []);

  if (!summary) return <div className="empty" style={{marginTop:80}}>Loading...</div>;

  const { totalStock, totalDispatched, totalReturned, rollsWithVendors, availableRolls, vendorStats } = summary;

  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Live overview of your roll inventory across all vendors</div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Total Dispatched</div>
          <div className="stat-val">{totalDispatched}</div>
          <div className="stat-note">Total rolls sent to vendors</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Returns</div>
          <div className="stat-val">{totalReturned}</div>
          <div className="stat-note">Empty rolls received back</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">With Vendors</div>
          <div className="stat-val">{rollsWithVendors}</div>
          <div className="stat-note">Current balance with all vendors</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Vendor-wise Roll Status</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowDispatch(true)}>+ Quick Dispatch</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Vendor</th><th>Dispatched</th><th>Returned</th><th>Holding</th><th>Last Dispatch</th><th>Last Return</th>
            </tr></thead>
            <tbody>
              {vendorStats.map(v => (
                <tr key={v._id}>
                  <td><b>{v.name}</b></td>
                  <td><span className="badge badge-yellow">{v.totalDispatched}</span></td>
                  <td><span className="badge badge-green">{v.totalReturned}</span></td>
                  <td><b style={{ color: v.rollsWithVendor > 0 ? 'var(--accent2)' : 'var(--green)' }}>{v.rollsWithVendor}</b></td>
                  <td style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>
                    {v.lastDispatchDate ? new Date(v.lastDispatchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>
                    {v.lastReturnDate ? new Date(v.lastReturnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="record-list">
          {vendorStats.map(v => (
            <div key={v._id} className="rc">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <b>{v.name}</b>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>
                    D: {v.lastDispatchDate ? new Date(v.lastDispatchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>
                    R: {v.lastReturnDate ? new Date(v.lastReturnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </div>
                </div>
              </div>
              <div className="flex-gap">
                <span className="badge badge-yellow">{v.totalDispatched} Sent</span>
                <span className="badge badge-green">{v.totalReturned} Ret</span>
                <span className="badge badge-blue">{v.rollsWithVendor} Hold</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDispatch && <DispatchModal onClose={() => setShowDispatch(false)} onSave={() => { setShowDispatch(false); load(); }} />}
    </>
  );
}
