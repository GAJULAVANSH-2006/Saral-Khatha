import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import api from '../api/client';

const CATEGORIES = ['Rent','Staff','Utilities','Marketing','Logistics','Raw Material','Miscellaneous'];
const PAYMENT_MODES = ['Cash','UPI','Bank Transfer','Card','Cheque'];
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;
const COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#6b7280'];

function ExpenseModal({ expense, onClose, onSave }) {
  const blank = { category:'Rent', description:'', amount:'', vendor:'', paymentMode:'UPI', date:new Date().toISOString().slice(0,10) };
  const [form, setForm] = useState(expense ? {
    category: expense.category, description: expense.description, amount: expense.amount,
    vendor: expense.vendor||'', paymentMode: expense.paymentMode, date: expense.date.slice(0,10),
  } : blank);
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (expense) { await api.put(`/expenses/${expense._id}`, form); }
      else { await api.post('/expenses', form); }
      onSave();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{expense ? 'Edit Expense' : 'Add Expense'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="input" name="category" value={form.category} onChange={set}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="input" type="date" name="date" value={form.date} onChange={set} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="input" name="description" value={form.description} onChange={set} placeholder="e.g. Office rent — September" required/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="input" type="number" name="amount" value={form.amount} onChange={set} placeholder="0" required min={0}/>
              </div>
              <div className="form-group">
                <label className="form-label">Payment mode</label>
                <select className="input" name="paymentMode" value={form.paymentMode} onChange={set}>
                  {PAYMENT_MODES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Vendor (optional)</label>
              <input className="input" name="vendor" value={form.vendor} onChange={set} placeholder="Vendor name"/>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState('list'); // 'list' | 'analytics'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/analytics'),
      ]);
      setExpenses(listRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setTotalSpend(analyticsRes.data.totalSpend);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); },[load]);

  const del = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const chartData = analytics.map((a,i) => ({
    category: a.category,
    yours: Math.round(a.shareOfSpend * 100),
    benchmark: a.benchmark ? Math.round(a.benchmark * 100) : null,
    fill: COLORS[i % COLORS.length],
    total: a.total,
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-title">Expenses</div>
        <div className="page-sub">Track spending and compare against industry benchmarks</div>
      </div>
      <div className="page-body">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <div className="entity-tabs">
            <button className={`entity-tab${tab==='list'?' active':''}`} onClick={()=>setTab('list')}>All expenses</button>
            <button className={`entity-tab${tab==='analytics'?' active':''}`} onClick={()=>setTab('analytics')}>Analytics</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'create'})}>+ Add expense</button>
        </div>

        {tab === 'list' ? (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th>Mode</th><th>Amount</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--ink-400)'}}>Loading…</td></tr>
                  : expenses.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <div className="empty-title">No expenses recorded</div>
                        <div className="empty-sub">Start tracking your spending to unlock analytics.</div>
                      </div>
                    </td></tr>
                  ) : expenses.map(exp => (
                    <tr key={exp._id}>
                      <td>{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                      <td><span className="badge badge-draft">{exp.category}</span></td>
                      <td>{exp.description}</td>
                      <td>{exp.vendor||'—'}</td>
                      <td>{exp.paymentMode}</td>
                      <td><strong>{fmt(exp.amount)}</strong></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:'edit',expense:exp})}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(exp._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div className="card card-pad">
              <div className="card-title">Spend by category</div>
              <div style={{marginBottom:12, fontSize:'0.88rem', color:'var(--ink-400)'}}>Total spend: <strong style={{color:'var(--ink-900)'}}>{fmt(totalSpend)}</strong></div>
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{left:0}}>
                    <XAxis type="number" tickFormatter={v=>`${v}%`} tick={{fontSize:11, fill:'var(--ink-400)'}} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="category" tick={{fontSize:12, fill:'var(--ink-600)'}} axisLine={false} tickLine={false} width={90}/>
                    <Tooltip formatter={(v,n) => [`${v}%`, n==='yours'?'Your spend':'Benchmark']} contentStyle={{borderRadius:8, border:'1px solid var(--ink-100)', fontSize:13}}/>
                    <Bar dataKey="yours" name="yours" radius={[0,4,4,0]}>
                      {chartData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                    </Bar>
                    <Bar dataKey="benchmark" name="benchmark" fill="rgba(0,0,0,0.12)" radius={[0,4,4,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:'flex', gap:16, marginTop:8, fontSize:'0.78rem', color:'var(--ink-400)'}}>
                <span style={{display:'flex',gap:5,alignItems:'center'}}><span style={{width:10,height:10,borderRadius:2,background:'var(--brand)',display:'block'}}></span>Your spend</span>
                <span style={{display:'flex',gap:5,alignItems:'center'}}><span style={{width:10,height:10,borderRadius:2,background:'rgba(0,0,0,0.18)',display:'block'}}></span>Industry avg</span>
              </div>
            </div>

            <div className="card card-pad">
              <div className="card-title">Category breakdown</div>
              <div style={{display:'flex', flexDirection:'column', gap:2, marginTop:8}}>
                {analytics.map((a,i) => (
                  <div key={a.category} className="bench-bar-row">
                    <span className="bench-cat">{a.category}</span>
                    <div className="bench-track">
                      <div className="bench-fill" style={{width:`${a.shareOfSpend*100}%`, background: COLORS[i%COLORS.length]}}></div>
                      {a.benchmark && <div className="bench-marker" style={{left:`${a.benchmark*100}%`}}></div>}
                    </div>
                    <span className="bench-amt">{fmt(a.total)}</span>
                  </div>
                ))}
                {analytics.length === 0 && <div style={{color:'var(--ink-400)', textAlign:'center', padding:40}}>No data yet</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <ExpenseModal
          expense={modal.expense}
          onClose={()=>setModal(null)}
          onSave={()=>{ setModal(null); load(); }}
        />
      )}
    </>
  );
}
