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
    } catch (err) {
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
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '—';

  const filteredDispatches = dispatches.filter(d =>
    (d.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex-between">
        <div>
          <div className="page-title">Dispatches</div>
          <div className="page-sub">Filled rolls sent to vendors</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ type: 'add' })}
        >
          + New Dispatch
        </button>
      </div>

      {/* 🔽 Moved Search + Filter BELOW */}
      <div className="flex-gap" style={{ margin: '12px 0' }}>
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
          style={{ width: 'auto' }}
        >
          <option value="">All Vendors</option>
          {vendors.map(v => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Quantity</th>
                <th>Dispatch Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty">No dispatches found</div>
                  </td>
                </tr>
              ) : (
                filteredDispatches.map(d => (
                  <tr key={d._id}>
                    <td><b>{d.vendor?.name || '—'}</b></td>
                    <td>
                      <span className="badge badge-yellow">
                        {d.quantity} rolls
                      </span>
                    </td>
                    <td>
                      <button
                        className="date-btn"
                        title="Click to edit date"
                        onClick={() =>
                          setModal({
                            type: 'date',
                            data: {
                              id: d._id,
                              dtype: 'dispatch',
                              date: d.dispatchDate
                            }
                          })
                        }
                      >
                        {fmtDate(d.dispatchDate)}
                      </button>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {d.notes || '—'}
                    </td>
                    <td>
                      <span className="badge badge-green">{d.status}</span>
                    </td>
                    <td>
                      <div className="flex-gap">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setModal({ type: 'edit', data: d })
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(d._id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="record-list">
          {filteredDispatches.length === 0 ? (
            <div className="empty">No dispatches found</div>
          ) : (
            filteredDispatches.map(d => (
              <div key={d._id} className="rc">
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <b>{d.vendor?.name || '—'}</b>
                  <span className="badge badge-yellow">
                    {d.quantity} rolls
                  </span>
                </div>
                <div className="flex-between">
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {fmtDate(d.dispatchDate)}
                  </div>
                  <div className="flex-gap">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setModal({ type: 'edit', data: d })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(d._id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'add' && (
        <DispatchModal
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {modal?.type === 'edit' && (
        <DispatchModal
          dispatch={modal.data}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {modal?.type === 'date' && (
        <DateEditModal
          dtype={modal.data.dtype}
          id={modal.data.id}
          currentDate={modal.data.date}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Dispatch"
          message="Are you sure you want to delete this dispatch record?"
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
