import { useState } from 'react';
import Customers from './components/Customers';
import Tickets from './components/Tickets';
import './App.css';

function App() {
  const [tab, setTab] = useState('tickets');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Customer Support Ticket Management</h1>
      </header>

      <nav className="tabs">
        <button
          className={tab === 'tickets' ? 'active' : ''}
          onClick={() => setTab('tickets')}
        >
          Tickets
        </button>
        <button
          className={tab === 'customers' ? 'active' : ''}
          onClick={() => setTab('customers')}
        >
          Customers
        </button>
      </nav>

      <main className="app-main">
        {tab === 'tickets' ? <Tickets /> : <Customers />}
      </main>
    </div>
  );
}

export default App;
