import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food' });

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setAuthError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setAnalysis({});
  };

  const fetchLedger = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        setAnalysis(data.analysis || {});
      } else {
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      console.error("Failed to connect to backend server:", err);
    }
  };

  useEffect(() => { fetchLedger(); }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authFormData)
      });
      const data = await res.json();
      if (res.ok) {
        handleAuthSuccess(data);
      } else {
        setAuthError(data.error || 'Authentication error');
      }
    } catch (err) {
      setAuthError('Cannot reach authentication server.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalAmount = Number(formData.amount);
      if (formData.category !== 'Income' && finalAmount > 0) {
        finalAmount = -finalAmount;
      }
      await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, amount: finalAmount })
      });
      setFormData({ title: '', amount: '', category: 'Food' });
      fetchLedger();
    } catch (err) {
      console.error("Failed to post transaction:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchLedger();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const chartData = Object.entries(
    transactions.reduce((acc, tx) => {
      if (tx.amount < 0) {
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#a855f7', '#64748b'];

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>📊 Cloud Budget Space</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
            {isRegistering ? 'Create a secure dashboard ledger account' : 'Sign in to access your private analytics ledger'}
          </p>
          {authError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>⚠️ {authError}</div>}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Full Name</label>
                <input type="text" required value={authFormData.name} onChange={e => setAuthFormData({...authFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Email Address</label>
              <input type="email" required value={authFormData.email} onChange={e => setAuthFormData({...authFormData, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Secure Password</label>
              <input type="password" required minLength={6} value={authFormData.password} onChange={e => setAuthFormData({...authFormData, password: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>{isRegistering ? 'Register Account' : 'Secure Login'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#94a3b8' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <span onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>{isRegistering ? 'Sign In' : 'Create One'}</span>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📊 Cloud Financial Control</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Welcome back, <strong style={{ color: '#3b82f6' }}>{user?.name}</strong>. Real-time predictive architecture engine</p>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
          <LogOut size={16} /> Log Out
        </button>
      </header>

      {analysis.alertMessage && (
        <div className="glass-card" style={{ borderColor: analysis.alertStatus === 'CRITICAL_DEFICIT' ? '#ef4444' : '#eab308', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle color={analysis.alertStatus === 'CRITICAL_DEFICIT' ? '#ef4444' : '#eab308'} />
          <p style={{ margin: 0, fontWeight: '500' }}>{analysis.alertMessage}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card"><h3><Wallet color="#22c55e" /> Total Income</h3><h2>₱{analysis.totalIncome || 0}</h2></div>
        <div className="glass-card"><h3><TrendingDown color="#ef4444" /> Total Expenses</h3><h2>₱{analysis.totalExpenses || 0}</h2></div>
        <div className="glass-card"><h3><TrendingUp color="#3b82f6" /> Net Savings</h3><h2>₱{analysis.netSavings ?? 0}</h2></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3>Log New Transaction</h3>
          <input type="text" placeholder="Description" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
          <input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
            <option value="Income">Income</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
          </select>
          <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Post to Ledger</button>
        </form>

        <div className="glass-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3>📌 Expense Category Breakdown</h3>
          {chartData.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 'auto' }}>Add expense transactions to generate structural breakdowns.</p>
          ) : (
            <div style={{ width: '100%', height: '220px', marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3>Transaction History Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
          {transactions.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No transactions logged yet.</p>
          ) : (
            transactions.map(tx => (
              <div key={tx._id} className="glass-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderLeft: tx.amount > 0 ? '4px solid #22c55e' : '4px solid #ef4444' }}>
                <span>{tx.title} ({tx.category})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 'bold', color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                  <button onClick={() => handleDelete(tx._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
