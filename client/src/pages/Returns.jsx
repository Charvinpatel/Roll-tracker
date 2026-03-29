import React, { useEffect, useState } from 'react';
import { returnAPI, vendorAPI } from '../utils/api';
import toast from 'react-hot-toast';
import ReturnModal from '../components/ReturnModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterVendor, setFilterVendor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      const [rRes, vRes] = await Promise.all([
        returnAPI.getAll(filterVendor),
        vendorAPI.getAll()
      ]);
      setReturns(rRes.data);
      setVendors(vRes.data);
    } catch {
      toast.error('Failed to load returns');
    }
  };

  useEffect(() => { load(); }, [filterVendor]);

  const handleDelete = async (id) => {
    await returnAPI.delete(id);
    toast.success('Return deleted');
    load();
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const filtered = returns.filter(r =>
    (r.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex-between wrap">
        <div>
          <div className="page-title">Returns</div>
          <div className="page-sub">Empty rolls returned</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          + Record Return
        </button>
      </div>

      <div className="flex-gap wrap" style={{ margin: '12px 0' }}>
        <input
          type="text"
          placeholder="Search returns..."
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Qty</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4">No data</td></tr>
              ) : filtered.map(r => (
                <tr key={r._id}>
                  <td>{r.vendor?.name}</td>
                  <td>{r.quantity}</td>
                  <td>{fmtDate(r.returnDate)}</td>
                  <td>
                    <button onClick={() => setModal({ type: 'edit', data: r })}>Edit</button>
                    <button onClick={() => setConfirmDelete(r._id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="record-list">
          {filtered.map(r => (
            <div key={r._id} className="rc">
              <b>{r.vendor?.name}</b>
              <div>{r.quantity} rolls</div>
              <div>{fmtDate(r.returnDate)}</div>
              <div className="flex-gap">
                <button onClick={() => setModal({ type: 'edit', data: r })}>Edit</button>
                <button onClick={() => handleDelete(r._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal?.type === 'add' && <ReturnModal onClose={() => setModal(null)} onSave={load} />}
      {modal?.type === 'edit' && <ReturnModal ret={modal.data} onClose={() => setModal(null)} onSave={load} />}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Return"
          message="Are you sure?"
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
      }
