import { useEffect, useState } from 'react';
import { getTickets, getCustomers, createTicket, updateTicket, deleteTicket } from '../api';
import TicketForm from './TicketForm';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, customersRes] = await Promise.all([getTickets(), getCustomers()]);
      setTickets(ticketsRes.data);
      setCustomers(customersRes.data);
      setLoadError('');
    } catch {
      setLoadError('Could not load tickets. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data) => {
    await createTicket(data);
    await loadData();
  };

  const handleUpdate = async (data) => {
    await updateTicket(editingTicket.id, data);
    setEditingTicket(null);
    await loadData();
  };

  const handleDelete = async (ticket) => {
    const confirmed = window.confirm(`Delete ticket "${ticket.title}"?`);
    if (!confirmed) return;
    await deleteTicket(ticket.id);
    await loadData();
  };

  return (
    <div>
      <TicketForm
        key={editingTicket ? editingTicket.id : 'new'}
        initialData={editingTicket}
        customers={customers}
        onSubmit={editingTicket ? handleUpdate : handleCreate}
        onCancel={() => setEditingTicket(null)}
      />

      <div className="card">
        <h3>Tickets</h3>
        {loading && <p>Loading...</p>}
        {loadError && <p className="error">{loadError}</p>}
        {!loading && !loadError && tickets.length === 0 && <p>No tickets yet.</p>}
        {!loading && tickets.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.customer ? t.customer.name : '—'}</td>
                  <td>
                    <span className={`badge priority-${t.priority.toLowerCase()}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${t.status.toLowerCase()}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => setEditingTicket(t)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(t)}>
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
