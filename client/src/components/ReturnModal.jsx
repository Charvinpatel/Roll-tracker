import React, { useState, useEffect } from 'react';
import { returnAPI, vendorAPI, dispatchAPI } from '../utils/api';
import toast from 'react-hot-toast';

function toInputDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  return new Date(d).toISOString().split('T')[0];
}

export default function ReturnModal({ ret, preVendor, onClose, onSave }) {
  const [vendors, setVendors] = useState([]);
  const [holdingMap, setHoldingMap] = useState({});
  const [form, setForm] = useState({
    vendor: ret?.vendor?._id || ret?.vendor || preVendor || '',
    quantity: ret?.quantity || '',
    returnDate: toInputDate(ret?.returnDate),
    notes: ret?.notes || '',
  });

  useEffect(() => {
    Promise.all([vendorAPI.getAll(), dispatchAPI.getAll(), returnAPI.getAll()]).then(([vRes, dRes, rRes]) => {
      setVendors(vRes.data);
      if (!form.vendor && vRes.data.length > 0) setForm(f => ({ ...f, vendor: vRes.data[0]._id }));
      // Build holding map
      const h = {};
      vRes.data.forEach(v => {
        const disp = dRes.data.filter(d => (d.vendor?._id || d.vendor) === v._id).reduce((a, d) => a + d.quantity, 0);
        const returned = rRes.data.filter(r => (r.vendor?._id || r.vendor) === v._id).reduce((a, r) => a + r.quantity, 0);
        h[v._id] = disp - returned;
      });
      setHoldingMap(h);
    });
  }, []);

  const selectedHolding = holdingMap[form.vendor] ?? 0;

  const handleSubmit = async () => {
    if (!form.vendor) { toast.error('Select a vendor'); return; }
    const qty = parseInt(form.quantity);
    if (!qty || qty < 1) { toast.error('Enter valid quantity'); return; }
    if (!ret && qty > selectedHolding) { toast.error(`Vendor only holds ${selectedHolding} rolls!`); return; }
    if (!form.returnDate) { toast.error('Select return date'); return; }
    try {
      const payload = { ...form, quantity: qty };
      if (ret) {
        await returnAPI.update(ret._id, payload);
        toast.success('Return updated');
      } else {
        await returnAPI.create(payload);
        toast.success('Return recorded');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving return');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{ret ? 'Edit Return' : 'Record Return'}</h2>
        <div className="form-group">
          <label>Vendor *</label>
          <select value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}>
            {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        {form.vendor && (
          <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Currently holding: </span>
            <b style={{ color: selectedHolding > 0 ? 'var(--accent2)' : 'var(--green)' }}>{selectedHolding} rolls</b>
          </div>
        )}
        <div className="form-group">
          <label>Quantity Returned *</label>
          <input type="number" min="1" max={selectedHolding} value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
            placeholder={`Max ${selectedHolding} rolls`} />
        </div>
        <div className="form-group">
          <label>Return Date *</label>
          <input type="date" value={form.returnDate}
            onChange={e => setForm({ ...form, returnDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Return</button>
        </div>
      </div>
    </div>
  );
}
