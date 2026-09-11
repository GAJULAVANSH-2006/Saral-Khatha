import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const STATUSES = ['all','draft','sent','paid','overdue','cancelled'];
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

function InvoiceModal({ invoice, customers, onClose, onSave }) {
  const blank = { customer:'', dueDate:'', lineItems:[{ description:'', qty:1, rate:0, gstRate:18 }], notes:'', status:'draft' };
  const [form, setForm] = useState(invoice ? {
    customer: invoice.customer?._id || invoice.customer,
    dueDate: invoice.dueDate ? invoice.dueDate.slice(0,10) : '',
    lineItems: invoice.lineItems,
    notes: invoice.notes || '',
    status: invoice.status,
  } : blank);
  const [saving, setSaving] = useState(false);

  const setLine = (i, field, val) => {
    setForm(f => { const li = [...f.lineItems]; li[i] = {...li[i], [field]: field==='qty'||field==='rate'||field==='gstRate' ? Number(val) : val }; return {...f, lineItems: li}; });
  };
  const addLine = () => setForm(f => ({...f, lineItems:[...f.lineItems,{description:'',qty:1,rate:0,gstRate:18}]}));
  const removeLine = (i) => setForm(f => ({...f, lineItems: f.lineItems.filter((_,j)=>j!==i)}));

  const subtotal = form.lineItems.reduce((s,i) => s + i.qty*i.rate, 0);
  const gstTotal = form.lineItems.reduce((s,i) => s + i.qty*i.rate*(i.gstRate/100), 0);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (invoice) { await api.put(`/invoices/${invoice._id}`, form); }
      else { await api.post('/invoices', form); }
      onSave();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:680}}>
        <div className="modal-header">
          <div className="modal-title">{invoice ? `Edit ${invoice.invoiceNumber}` : 'New Invoice'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="input" value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} required>
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/>
              </div>
            </div>
            <div>
              <div className="form-label" style={{marginBottom:8}}>Line items</div>
              <table style={{width:'100%', fontSize:'0.83rem', borderCollapse:'collapse'}}>
                <thead><tr style={{color:'var(--ink-400)', textAlign:'left'}}>
                  <th style={{padding:'6px 8px', width:'40%'}}>Description</th>
                  <th style={{padding:'6px 8px'}}>Qty</th>
                  <th style={{padding:'6px 8px'}}>Rate (₹)</th>
                  <th style={{padding:'6px 8px'}}>GST %</th>
                  <th style={{padding:'6px 8px'}}>Amount</th>
                  <th style={{padding:'6px 8px'}}></th>
                </tr></thead>
                <tbody>
                  {form.lineItems.map((li, i) => (
                    <tr key={i}>
                      <td style={{padding:'4px 6px'}}><input className="input" value={li.description} onChange={e=>setLine(i,'description',e.target.value)} placeholder="Item" style={{padding:'7px 10px'}}/></td>
                      <td style={{padding:'4px 6px'}}><input className="input" type="number" min={1} value={li.qty} onChange={e=>setLine(i,'qty',e.target.value)} style={{padding:'7px 10px', width:60}}/></td>
                      <td style={{padding:'4px 6px'}}><input className="input" type="number" min={0} value={li.rate} onChange={e=>setLine(i,'rate',e.target.value)} style={{padding:'7px 10px', width:90}}/></td>
                      <td style={{padding:'4px 6px'}}>
                        <select className="input" value={li.gstRate} onChange={e=>setLine(i,'gstRate',e.target.value)} style={{padding:'7px 10px', width:70}}>
                          {[0,5,12,18,28].map(r=><option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'4px 6px', fontWeight:600}}>{fmt(li.qty*li.rate)}</td>
                      <td style={{padding:'4px 6px'}}><button type="button" className="btn btn-danger btn-icon btn-sm" onClick={()=>removeLine(i)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={addLine}>+ Add line</button>
              <div style={{textAlign:'right', marginTop:12, fontSize:'0.88rem', color:'var(--ink-600)', display:'flex', flexDirection:'column', gap:4}}>
                <span>Subtotal: <strong>{fmt(subtotal)}</strong></span>
                <span>GST: <strong>{fmt(gstTotal)}</strong></span>
                <span style={{fontSize:'1rem', color:'var(--ink-900)'}}>Total: <strong>{fmt(subtotal+gstTotal)}</strong></span>
              </div>
            </div>
            {invoice && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {['draft','sent','paid','overdue','cancelled'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes…"></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save invoice'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReminderModal({ invoice, onClose, onSent }) {
  const [channels, setChannels] = useState(['email']);
  const [sending, setSending] = useState(false);
  const toggle = (ch) => setChannels(c => c.includes(ch) ? c.filter(x=>x!==ch) : [...c,ch]);
  const send = async () => {
    setSending(true);
    try { await api.post(`/invoices/${invoice._id}/remind`, { channels }); onSent(); }
    catch {} finally { setSending(false); }
  };
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:400}}>
        <div className="modal-header">
          <div className="modal-title">Send payment reminder</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{fontSize:'0.88rem', color:'var(--ink-600)', marginBottom:20}}>
            Sending reminder for <strong>{invoice.invoiceNumber}</strong> to <strong>{invoice.customer?.name}</strong>.
          </p>
          <div style={{display:'flex', gap:10, flexDirection:'column'}}>
            {[{id:'email',label:'📧 Email'},{id:'sms',label:'📱 SMS'},{id:'whatsapp',label:'💬 WhatsApp'}].map(ch=>(
              <label key={ch.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',border:`2px solid ${channels.includes(ch.id)?'var(--brand)':'var(--ink-100)'}`,borderRadius:'var(--radius-md)',cursor:'pointer',background:channels.includes(ch.id)?'var(--brand-faint)':'#fff',transition:'all .15s'}}>
                <input type="checkbox" checked={channels.includes(ch.id)} onChange={()=>toggle(ch.id)} style={{accentColor:'var(--brand)'}}/>
                <span style={{fontWeight:600, fontSize:'0.88rem'}}>{ch.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send} disabled={sending||!channels.length}>{sending?'Sending…':'Send reminder'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type, invoice? }
  const [reminderInv, setReminderInv] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const [invRes, custRes] = await Promise.all([
        api.get('/invoices', { params }),
        api.get('/customers'),
      ]);
      setInvoices(invRes.data.data);
      setTotal(invRes.data.total);
      setCustomers(custRes.data.data);
    } catch {} finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await api.delete(`/invoices/${id}`);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Invoices</div>
        <div className="page-sub">Create, track, and send payment reminders</div>
      </div>
      <div className="page-body">
        <div className="page-actions">
          <div className="page-actions-left">
            <div className="stat-pills">
              {STATUSES.map(s => (
                <button key={s} className={`stat-pill${statusFilter===s?' active':''}`} onClick={()=>setStatusFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <span style={{color:'var(--ink-400)', fontSize:'0.82rem'}}>{total} total</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'create'})}>+ New invoice</button>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Invoice #</th><th>Customer</th><th>Issue date</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--ink-400)'}}>Loading…</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">🧾</div>
                      <div className="empty-title">No invoices yet</div>
                      <div className="empty-sub">Create your first invoice to start tracking payments.</div>
                    </div>
                  </td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.customer?.name || '—'}</td>
                    <td>{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td><strong>{fmt(inv.total)}</strong></td>
                    <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                    <td>
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:'edit',invoice:inv})}>Edit</button>
                        {inv.status !== 'paid' && (
                          <button className="btn btn-outline btn-sm" onClick={()=>setReminderInv(inv)}>Remind</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={()=>del(inv._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <InvoiceModal
          invoice={modal.invoice}
          customers={customers}
          onClose={()=>setModal(null)}
          onSave={()=>{ setModal(null); load(); }}
        />
      )}

      {reminderInv && (
        <ReminderModal
          invoice={reminderInv}
          onClose={()=>setReminderInv(null)}
          onSent={()=>{ setReminderInv(null); alert('Reminder queued successfully!'); }}
        />
      )}
    </>
  );
}
