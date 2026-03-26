import React, { useState } from 'react';
import { dispatchAPI, returnAPI } from '../utils/api';
import toast from 'react-hot-toast';

function toInputDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
}

export default function DateEditModal({ dtype, id, currentDate, onClose, onSave }) {
  const [date, setDate] = useState(toInputDate(currentDate));

  const handleSave = async () => {
    if (!date) { toast.error('Select a date'); return; }
    try {
      if (dtype === 'dispatch') {
        await dispatchAPI.update(id, { dispatchDate: date });
      } else {
        await returnAPI.update(id, { returnDate: date });
      }
      toast.success('Date updated');
      onSave();
    } catch (err) {
      toast.error('Failed to update date');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <h2>Edit {dtype === 'dispatch' ? 'Dispatch' : 'Return'} Date</h2>
        <div className="form-group">
          <label>New Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Update Date</button>
        </div>
      </div>
    </div>
  );
}
