import React, { useState, useEffect } from 'react';
import { dispatchAPI, vendorAPI } from '../utils/api';
import toast from 'react-hot-toast';

function toInputDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  return new Date(d).toISOString().split('T')[0];
}

export default function DispatchModal({ dispatch, preVendor, onClose, onSave }) {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    vendor: dispatch?.vendor?._id || dispatch?.vendor || preVendor || '',
    quantity: dispatch?.quantity || '',
    dispatchDate: toInputDate(dispatch?.dispatchDate),
    notes: dispatch?.notes || '',
    status: dispatch?.status || 'delivered',
  });

  useEffect(() => {
    vendorAPI.getAll().then(r => {
      setVendors(r.data);
      if (!form.vendor && r.data.length > 0) setForm(f => ({ ...f, vendor: r.data[0]._id }));
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.vendor) { toast.error('Select a vendor'); return; }
    if (!form.quantity || parseInt(form.quantity) < 1) { toast.error('Enter valid quantity'); return; }
    if (!form.dispatchDate) { toast.error('Select dispatch date'); return; }
    try {
      const payload = { ...form, quantity: parseInt(form.quantity) };
      if (dispatch) {
        await dispatchAPI.update(dispatch._id, payload);
        toast.success('Dispatch updated');
      } else {
        await dispatchAPI.create(payload);
        toast.success('Dispatch recorded');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving dispatch');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{dispatch ? 'Edit Dispatch' : 'New Dispatch'}</h2>
        <div className="form-group">
          <label>Vendor *</label>
          <select value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}>
            {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Quantity (Rolls) *</label>
          <input type="number" min="1" value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
            placeholder="Number of filled rolls" />
        </div>
        <div className="form-group">
          <label>Dispatch Date *</label>
          <input type="date" value={form.dispatchDate}
            onChange={e => setForm({ ...form, dispatchDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Dispatch</button>
        </div>
      </div>
    </div>
  );
}
