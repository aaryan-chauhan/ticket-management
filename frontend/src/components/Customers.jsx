import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';
import CustomerForm from './CustomerForm';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data);
      setLoadError('');
    } catch {
      setLoadError('Could not load customers. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async (data) => {
    await createCustomer(data);
    await loadCustomers();
  };

  const handleUpdate = async (data) => {
    await updateCustomer(editingCustomer.id, data);
    setEditingCustomer(null);
    await loadCustomers();
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"? This will also delete all of their tickets.`,
    );
    if (!confirmed) return;
    await deleteCustomer(customer.id);
    await loadCustomers();
  };

  return (
    <div>
      <CustomerForm
        key={editingCustomer ? editingCustomer.id : 'new'}
        initialData={editingCustomer}
        onSubmit={editingCustomer ? handleUpdate : handleCreate}
        onCancel={() => setEditingCustomer(null)}
      />

      <div className="card">
        <h3>Customers</h3>
        {loading && <p>Loading...</p>}
        {loadError && <p className="error">{loadError}</p>}
        {!loading && !loadError && customers.length === 0 && <p>No customers yet.</p>}
        {!loading && customers.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td className="actions">
                    <button onClick={() => setEditingCustomer(c)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
