import { useEffect, useState } from 'react';

const emptyForm = { name: '', email: '', phone: '' };

export default function CustomerForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(
      initialData
        ? { name: initialData.name, email: initialData.email, phone: initialData.phone }
        : emptyForm,
    );
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(form);
      if (!initialData) setForm(emptyForm);
    } catch (err) {
      setError(
        err?.response?.data?.message?.toString() || 'Something went wrong. Please check the fields.',
      );
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initialData ? 'Edit Customer' : 'Add Customer'}</h3>
      <div className="form-row">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit">{initialData ? 'Save' : 'Add Customer'}</button>
        {initialData && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
