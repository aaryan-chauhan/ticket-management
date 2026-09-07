import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

const emptyForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  customerId: '',
};

export default function TicketForm({ initialData, customers, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        priority: initialData.priority,
        status: initialData.status,
        customerId: initialData.customerId,
      });
    } else {
      setForm({
        ...emptyForm,
        customerId: customers.length > 0 ? customers[0].id : '',
      });
    }
  }, [initialData, customers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.customerId) {
      setError('Please add a customer first, then create a ticket.');
      return;
    }
    try {
      const payload = { ...form, customerId: Number(form.customerId) };
      if (!initialData) {
        // status defaults server-side on create; still fine to send it
      }
      await onSubmit(payload);
      if (!initialData) {
        setForm({ ...emptyForm, customerId: customers.length > 0 ? customers[0].id : '' });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message?.toString() || 'Something went wrong. Please check the fields.',
      );
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initialData ? 'Edit Ticket' : 'Create Ticket'}</h3>
      <div className="form-row">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
        />
      </div>
      <div className="form-row">
        <label>Customer</label>
        <select name="customerId" value={form.customerId} onChange={handleChange} required>
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange}>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      {initialData && (
        <div className="form-row">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit">{initialData ? 'Save' : 'Create Ticket'}</button>
        {initialData && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
