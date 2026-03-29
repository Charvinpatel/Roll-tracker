import React, { useEffect, useState } from 'react';
import { dispatchAPI, vendorAPI } from '../utils/api';
import toast from 'react-hot-toast';
import DispatchModal from '../components/DispatchModal';
import DateEditModal from '../components/DateEditModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Dispatches() {
  const [dispatches, setDispatches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterVendor, setFilterVendor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      const [dRes, vRes] = await Promise.all([
        dispatchAPI.getAll(filterVendor),
        vendorAPI.getAll()
      ]);
      setDispatches(dRes.data);
      setVendors(vRes.data);
    } catch {
      toast.error('Failed to load dispatches');
    }
  };

  useEffect(() => { load(); }, [filterVendor]);

  const handleDelete = async (id) => {
    await dispatchAPI.delete(id);
    toast.success('Dispatch deleted');
    load();
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const filtered = dispatches.filter(d =>
    (d.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex-between wrap">
        <div>
          <div className="page-title">Dispatches</div>
          <div className="page-sub">Filled rolls sent to vendors</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          + New Dispatch
        </button>
      </div>

      {/* Search */}
      <div className="flex-gap wrap" style={{ margin: '12px 0' }}>
        <input
          type="text"
          placeholder="Search dispatches..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="search-bar"
          value={filterVendor}
          onChange={e => setFilterVendor(e.target.value)}
        >
          <option value="">All Vendors</option>
          {vendors.map(v => (
            <option key={v._id} value={v._id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {/* Table (Desktop) */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Qty</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5">No data</td></tr>
              ) : filtered.map(d => (
                <tr key={d._id}>
                  <td>{d.vendor?.name}</td>
                  <td>{d.quantity}</td>
                  <td>{fmtDate(d.dispatchDate)}</td>
                  <td>{d.status}</td>
                  <td>
                    <button onClick={() => setModal({ type: 'edit', data: d })}>Edit</button>
                    <button onClick={() => setConfirmDelete(d._id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="record-list">
          {filtered.map(d => (
            <div key={d._id} className="rc">
              <b>{d.vendor?.name}</b>
              <div>{d.quantity} rolls</div>
              <div>{fmtDate(d.dispatchDate)}</div>
              <div className="flex-gap">
                <button onClick={() => setModal({ type: 'edit', data: d })}>Edit</button>
                <button onClick={() => handleDelete(d._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'add' && <DispatchModal onClose={() => setModal(null)} onSave={load} />}
      {modal?.type === 'edit' && <DispatchModal dispatch={modal.data} onClose={() => setModal(null)} onSave={load} />}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Dispatch"
          message="Are you sure?"
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
    }
