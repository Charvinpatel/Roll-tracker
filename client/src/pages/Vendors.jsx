import React, { useEffect, useState } from 'react';
import { vendorAPI, dispatchAPI, returnAPI, inventoryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import VendorModal from '../components/VendorModal';
import DispatchModal from '../components/DispatchModal';
import ReturnModal from '../components/ReturnModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({});
  const [modal, setModal] = useState(null); // null | {type, data}
  const [confirmDelete, setConfirmDelete] = useState(null); // null | id

  const load = async () => {
    try {
      const { data } = await inventoryAPI.getSummary();
      setVendors(data.vendorStats);
      const s = {};
      data.vendorStats.forEach(v => {
        s[v._id] = { disp: v.totalDispatched, ret: v.totalReturned, hold: v.rollsWithVendor };
      });
      setStats(s);
    } catch (err) {
      toast.error('Failed to load vendors');
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await vendorAPI.delete(id);
    toast.success('Vendor deleted');
    load();
  };

  return (
    <>
      <div className="flex-between">
        <div>
          <div className="page-title">Vendors</div>
          <div className="page-sub">Manage your vendors and their roll balances</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'vendor', data: null })}>+ Add Vendor</button>
      </div>

      <div className="vendor-grid">
        {vendors.map(v => {
          const s = stats[v._id] || { disp: 0, ret: 0, hold: 0 };
          return (
            <div className="vendor-card" key={v._id}>
              <h4>{v.name}</h4>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4 }}>
                📞 {v.phone || 'N/A'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                📍 {v.address || 'No address'}
              </div>
              <div className="vendor-mini-stats">
                <div className="vms"><div className="vms-val" style={{ color: 'var(--accent)' }}>{s.disp}</div><div className="vms-label">Sent</div></div>
                <div className="vms"><div className="vms-val" style={{ color: 'var(--green)' }}>{s.ret}</div><div className="vms-label">Returned</div></div>
                <div className="vms"><div className="vms-val" style={{ color: s.hold > 0 ? 'var(--accent2)' : 'var(--muted)' }}>{s.hold}</div><div className="vms-label">Holding</div></div>
              </div>
              <div className="vendor-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'dispatch', data: { vendor: v._id } })}>Dispatch</button>
                <button className="btn btn-green btn-sm" onClick={() => setModal({ type: 'return', data: { vendor: v._id } })}>Return</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'vendor', data: v })}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(v._id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal?.type === 'vendor' && <VendorModal vendor={modal.data} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal?.type === 'dispatch' && <DispatchModal preVendor={modal.data?.vendor} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal?.type === 'return' && <ReturnModal preVendor={modal.data?.vendor} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      
      {confirmDelete && (
        <ConfirmModal 
          title="Delete Vendor"
          message="Are you sure you want to delete this vendor? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
