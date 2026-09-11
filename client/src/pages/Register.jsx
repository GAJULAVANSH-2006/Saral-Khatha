import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = ['Trading','Manufacturing','Retail','Services','Agriculture','Logistics','Hospitality','Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', businessName:'', phone:'', gstin:'', state:'', industry:'Trading' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="l-logo-mark" style={{color:'rgba(255,255,255,.85)', fontSize:'1.4rem'}}>सरल <span>Khatha</span></div>
        <p className="auth-tagline">Your business,<br /><em>demystified.</em></p>
        <div className="auth-feature-list">
          {['Takes under 2 minutes to set up','No credit card required','GST-compliant from day one'].map(f => (
            <div key={f} className="auth-feat">
              <div className="auth-feat-icon">✓</div>
              <div className="auth-feat-text">{f}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box" style={{maxWidth:480}}>
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">Start your 14-day Pro trial — free.</div>
          {error && <div className="toast toast-error" style={{marginBottom:16}}>{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input className="input" name="name" value={form.name} onChange={handle} placeholder="Ramesh Sharma" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handle} placeholder="9876543210" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handle} placeholder="Min. 8 characters" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Business name</label>
              <input className="input" name="businessName" value={form.businessName} onChange={handle} placeholder="Sharma Traders" required />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="input" name="industry" value={form.industry} onChange={handle}>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN (optional)</label>
                <input className="input" name="gstin" value={form.gstin} onChange={handle} placeholder="29ABCDE1234F1Z5" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
