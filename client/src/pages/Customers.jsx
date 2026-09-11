import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n||0}`;

function CustomerModal({ customer, onClose, onSave }) {
  const blank = { name:'', email:'', phone:'', gstin:'', address:'', state:'', industry:'' };
  const [form, setForm] = useState(customer ? {
    name: customer.name, email: customer.email||'', phone: customer.phone||'',
    gstin: customer.gstin||'', address: customer.address||'', state: customer.state||'', industry: customer.industry||'',
  } : blank);
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (customer) { await api.put(`/customers/${customer._id}`, form); }
      else { await api.post('/customers', form); }
      onSave();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{customer ? 'Edit Customer' : 'Add Customer'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group">
              <label className="form-label">Business / Customer name *</label>
              <input className="input" name="name" value={form.name} onChange={set} placeholder="Sharma Traders" required/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={set} placeholder="contact@example.com"/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={set} placeholder="9876543210"/>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">GSTIN</label>
                <input className="input" name="gstin" value={form.gstin} onChange={set} placeholder="29ABCDE…"/>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="input" name="state" value={form.state} onChange={set} placeholder="Maharashtra"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="input" rows={2} name="address" value={form.address} onChange={set} placeholder="Full address…"></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [profitability, setProfitability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState('list');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/customers'),
        api.get('/customers/profitability'),
      ]);
      setCustomers(cRes.data.data);
      setProfitability(pRes.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); },[load]);

  const del = async (id) => {
    if (!confirm('Delete customer?')) return;
    await api.delete(`/customers/${id}`);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Customers</div>
        <div className="page-sub">Manage contacts and see profitability per customer</div>
      </div>
      <div className="page-body">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <div className="entity-tabs">
            <button className={`entity-tab${tab==='list'?' active':''}`} onClick={()=>setTab('list')}>Customers</button>
            <button className={`entity-tab${tab==='profit'?' active':''}`} onClick={()=>setTab('profit')}>Profitability</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'create'})}>+ Add customer</button>
        </div>

        {tab === 'list' ? (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>State</th><th>GSTIN</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--ink-400)'}}>Loading…</td></tr>
                  : customers.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-title">No customers yet</div>
                        <div className="empty-sub">Add your first customer to start creating invoices.</div>
                      </div>
                    </td></tr>
                  ) : customers.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone||'—'}</td>
                      <td>{c.email||'—'}</td>
                      <td>{c.state||'—'}</td>
                      <td style={{fontFamily:'monospace', fontSize:'0.8rem'}}>{c.gstin||'—'}</td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:'edit',customer:c})}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(c._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table className="profit-table">
                <thead><tr><th>Customer</th><th>Revenue</th><th>Profit</th><th>Margin</th><th>Invoices</th></tr></thead>
                <tbody>
                  {profitability.length === 0 ? (
                    <tr><td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <div className="empty-title">No profitability data yet</div>
                        <div className="empty-sub">Create invoices and expenses to see profit per customer.</div>
                      </div>
                    </td></tr>
                  ) : profitability.map(p => (
                    <tr key={p.customer.id}>
                      <td><strong>{p.customer.name}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--ink-400)'}}>{p.customer.email||p.customer.phone||''}</span></td>
                      <td><strong>{fmt(p.revenue)}</strong></td>
                      <td style={{color: p.profit >= 0 ? 'var(--green)' : 'var(--red)'}}><strong>{fmt(p.profit)}</strong></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="margin-bar-wrap">
                            <div className={`margin-bar ${p.margin>=0?'margin-positive':'margin-negative'}`} style={{width:`${Math.min(100,Math.abs(p.margin))}%`}}></div>
                          </div>
                          <span style={{fontWeight:700, color: p.margin>=0 ? 'var(--green)':'var(--red)', fontSize:'0.88rem'}}>{p.margin}%</span>
                        </div>
                      </td>
                      <td>{p.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <CustomerModal
          customer={modal.customer}
          onClose={()=>setModal(null)}
          onSave={()=>{ setModal(null); load(); }}
        />
      )}
    </>
  );
}
