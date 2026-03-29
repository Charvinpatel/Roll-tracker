import React, { useEffect, useState } from 'react';
import { returnAPI, vendorAPI } from '../utils/api';
import toast from 'react-hot-toast';
import ReturnModal from '../components/ReturnModal';
import DateEditModal from '../components/DateEditModal';
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
      const [rRes, vRes] = await Promise.all([returnAPI.getAll(filterVendor), vendorAPI.getAll()]);
      setReturns(rRes.data);
      setVendors(vRes.data);
    } catch (err) {
      toast.error('Failed to load returns');
    }
  };

  useEffect(() => { load(); }, [filterVendor]);

  const handleDelete = async (id) => {
    await returnAPI.delete(id);
    toast.success('Return deleted');
    load();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="flex-between">
        <div>
          <div className="page-title">Returns</div>
          <div className="page-sub">Empty rolls returned by vendors</div>
        </div>
        <div className="flex-gap">
          <input 
            type="text" 
            placeholder="Search returns..." 
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select className="search-bar" value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Vendors</option>
            {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Record Return</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Quantity</th><th>Return Date</th><th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.filter(r => 
                (r.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <tr><td colSpan="5"><div className="empty">No returns recorded</div></td></tr>
              ) : returns.filter(r => 
                (r.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).map(r => (
                <tr key={r._id}>
                  <td><b>{r.vendor?.name || '—'}</b></td>
                  <td><span className="badge badge-green">{r.quantity} rolls</span></td>
                  <td>
                    <button className="date-btn" title="Click to edit date"
                      onClick={() => setModal({ type: 'date', data: { id: r._id, dtype: 'return', date: r.returnDate } })}>
                      {fmtDate(r.returnDate)}
                    </button>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.notes || '—'}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'edit', data: r })}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(r._id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="record-list">
          {returns.filter(r => 
            (r.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? <div className="empty">No returns recorded</div> : returns.filter(r => 
            (r.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
          ).map(r => (
            <div key={r._id} className="rc">
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <b>{r.vendor?.name || '—'}</b>
                <span className="badge badge-green">{r.quantity} rolls</span>
              </div>
              <div className="flex-between">
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(r.returnDate)}</div>
                <div className="flex-gap">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'edit', data: r })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal?.type === 'add' && <ReturnModal onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal?.type === 'edit' && <ReturnModal ret={modal.data} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal?.type === 'date' && (
        <DateEditModal
          dtype={modal.data.dtype}
          id={modal.data.id}
          currentDate={modal.data.date}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal 
          title="Delete Return"
          message="Are you sure you want to delete this return record?"
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
