import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const CATEGORIES = ['Invoice Payment','Expense','Salary','Tax','Loan','Owner Withdrawal','Other'];
const MODES = ['Cash','UPI','Bank Transfer','Card','Cheque'];
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

function TxnModal({ onClose, onSave }) {
  const [form, setForm] = useState({ type:'credit', category:'Invoice Payment', description:'', amount:'', paymentMode:'UPI', date: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/transactions', form); onSave(); }
    catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add Transaction</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',gap:8}}>
              {['credit','debit'].map(t=>(
                <button key={t} type="button" className={`btn ${form.type===t?'btn-primary':'btn-ghost'}`} style={{flex:1}}
                  onClick={()=>setForm(f=>({...f,type:t}))}>
                  {t==='credit' ? '+ Credit (Money In)' : '− Debit (Money Out)'}
                </button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="input" name="category" value={form.category} onChange={set}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="input" type="date" name="date" value={form.date} onChange={set} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="input" name="description" value={form.description} onChange={set} placeholder="e.g. Payment from Sharma Traders" required/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="input" type="number" name="amount" value={form.amount} onChange={set} placeholder="0" required min={0}/>
              </div>
              <div className="form-group">
                <label className="form-label">Payment mode</label>
                <select className="input" name="paymentMode" value={form.paymentMode} onChange={set}>
                  {MODES.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [summary, setSummary] = useState({ totalCredit:0, totalDebit:0, net:0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = typeFilter !== 'all' ? { type: typeFilter } : {};
      const res = await api.get('/transactions', { params });
      setTxns(res.data.data);
      setSummary(res.data.summary);
    } catch {} finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(()=>{ load(); },[load]);

  const del = async (id) => {
    if (!confirm('Delete transaction?')) return;
    await api.delete(`/transactions/${id}`);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Transactions</div>
        <div className="page-sub">Complete ledger of all inflows and outflows</div>
      </div>
      <div className="page-body">
        {/* PnL summary */}
        <div className="kpi-grid" style={{marginBottom:20}}>
          <div className="kpi-card"><div className="kpi-label">Total Inflows</div><div className="kpi-value kpi-up">{fmt(summary.totalCredit)}</div></div>
          <div className="kpi-card"><div className="kpi-label">Total Outflows</div><div className="kpi-value kpi-down">{fmt(summary.totalDebit)}</div></div>
          <div className="kpi-card">
            <div className="kpi-label">Net</div>
            <div className={`kpi-value ${summary.net >= 0 ? 'kpi-up' : 'kpi-down'}`}>{fmt(Math.abs(summary.net))} {summary.net >= 0 ? '↑' : '↓'}</div>
          </div>
        </div>

        <div className="page-actions">
          <div className="page-actions-left">
            <div className="stat-pills">
              {['all','credit','debit'].map(t=>(
                <button key={t} className={`stat-pill${typeFilter===t?' active':''}`} onClick={()=>setTypeFilter(t)}>
                  {t==='all' ? 'All' : t==='credit'? 'Credits (+)' : 'Debits (−)'}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(true)}>+ Add transaction</button>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Mode</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--ink-400)'}}>Loading…</td></tr>
                : txns.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">📒</div>
                      <div className="empty-title">No transactions yet</div>
                      <div className="empty-sub">Transactions appear here automatically when you mark invoices as paid, or you can add them manually.</div>
                    </div>
                  </td></tr>
                ) : txns.map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span style={{fontWeight:700, color: t.type==='credit'?'var(--green)':'var(--red)', fontSize:'1rem'}}>
                        {t.type==='credit' ? '+' : '−'}
                      </span>
                    </td>
                    <td>{t.description}</td>
                    <td><span className="badge badge-draft">{t.category}</span></td>
                    <td>{t.paymentMode}</td>
                    <td style={{fontWeight:700, color: t.type==='credit'?'var(--green)':'var(--red)'}}>
                      {t.type==='credit'?'+':'-'}{fmt(t.amount)}
                    </td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>del(t._id)}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && <TxnModal onClose={()=>setModal(false)} onSave={()=>{ setModal(false); load(); }}/>}
    </>
  );
}
