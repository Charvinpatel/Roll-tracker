import React, { useState } from 'react';
import { vendorAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function VendorModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState({
    name: vendor?.name || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Vendor name is required'); return; }
    try {
      if (vendor) {
        await vendorAPI.update(vendor._id, form);
        toast.success('Vendor updated');
      } else {
        await vendorAPI.create(form);
        toast.success('Vendor added');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving vendor');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
        <div className="form-group">
          <label>Vendor Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mehta Traders" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="98765-43210" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, Area" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Vendor</button>
        </div>
      </div>
    </div>
  );
}
