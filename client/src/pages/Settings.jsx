import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const ENTITIES = ['invoice', 'expense', 'customer', 'transaction'];
const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'boolean'];

function FieldModal({ field, entity, onClose, onSave }) {
  const [form, setForm] = useState(field ? {
    label: field.label, fieldType: field.fieldType, required: field.required, options: field.options?.join(',') || '', entity: field.entity,
  } : { label:'', fieldType:'text', required:false, options:'', entity });
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm(f=>({...f,[e.target.name]: e.target.type==='checkbox'? e.target.checked : e.target.value}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, options: form.fieldType === 'dropdown' ? form.options.split(',').map(s=>s.trim()).filter(Boolean) : [] };
    try {
      if (field) { await api.put(`/custom-fields/${field._id}`, payload); }
      else { await api.post('/custom-fields', payload); }
      onSave();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <div className="modal-header">
          <div className="modal-title">{field ? 'Edit field' : 'Add custom field'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group">
              <label className="form-label">Field label *</label>
              <input className="input" name="label" value={form.label} onChange={set} placeholder="e.g. Vehicle Number" required/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group">
                <label className="form-label">Field type</label>
                <select className="input" name="fieldType" value={form.fieldType} onChange={set}>
                  {FIELD_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Applies to</label>
                <select className="input" name="entity" value={form.entity} onChange={set}>
                  {ENTITIES.map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            {form.fieldType === 'dropdown' && (
              <div className="form-group">
                <label className="form-label">Options (comma-separated)</label>
                <input className="input" name="options" value={form.options} onChange={set} placeholder="North, South, East, West"/>
              </div>
            )}
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:'0.88rem',color:'var(--ink-700)',cursor:'pointer'}}>
              <input type="checkbox" name="required" checked={form.required} onChange={set} style={{accentColor:'var(--brand)'}}/>
              Mark as required field
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save field'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntity, setActiveEntity] = useState('invoice');
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/custom-fields', { params: { entity: activeEntity } });
      setFields(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [activeEntity]);

  useEffect(()=>{ load(); },[load]);

  const del = async (id) => {
    if (!confirm('Delete this field?')) return;
    await api.delete(`/custom-fields/${id}`);
    load();
  };

  const TYPE_COLORS = { text:'#2563eb', number:'#7c3aed', date:'#0891b2', dropdown:'#d97706', boolean:'#059669' };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Custom Fields</div>
        <div className="page-sub">Define flexible fields for invoices, expenses, customers, and transactions</div>
      </div>
      <div className="page-body">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div className="entity-tabs">
            {ENTITIES.map(e=>(
              <button key={e} className={`entity-tab${activeEntity===e?' active':''}`} onClick={()=>setActiveEntity(e)}>
                {e.charAt(0).toUpperCase()+e.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'create'})}>+ Add field</button>
        </div>

        {loading ? (
          <div style={{color:'var(--ink-400)',textAlign:'center',padding:60}}>Loading…</div>
        ) : fields.length === 0 ? (
          <div className="card card-pad">
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <div className="empty-title">No custom fields for {activeEntity}s</div>
              <div className="empty-sub">Add fields like Vehicle Number, Lot ID, Party Code — anything your business tracks.</div>
            </div>
          </div>
        ) : (
          <div className="field-list">
            {fields.map(f => (
              <div key={f._id} className="field-item">
                <div style={{width:36,height:36,borderRadius:'var(--radius-md)',background:`${TYPE_COLORS[f.fieldType]}18`,display:'grid',placeItems:'center',flexShrink:0}}>
                  <span style={{fontSize:'0.8rem',fontWeight:700,color:TYPE_COLORS[f.fieldType]}}>{f.fieldType[0].toUpperCase()}</span>
                </div>
                <div style={{flex:1}}>
                  <div className="field-item-label">{f.label}</div>
                  {f.fieldType==='dropdown' && f.options?.length > 0 && (
                    <div style={{fontSize:'0.75rem',color:'var(--ink-400)',marginTop:2}}>{f.options.join(' · ')}</div>
                  )}
                </div>
                <span className="field-item-type" style={{background:`${TYPE_COLORS[f.fieldType]}15`,color:TYPE_COLORS[f.fieldType]}}>{f.fieldType}</span>
                {f.required && <span className="badge badge-overdue" style={{fontSize:'0.7rem'}}>required</span>}
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:'edit',field:f})}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>del(f._id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <FieldModal
          field={modal.field}
          entity={activeEntity}
          onClose={()=>setModal(null)}
          onSave={()=>{ setModal(null); load(); }}
        />
      )}
    </>
  );
}
