import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="l-logo-mark" style={{color:'rgba(255,255,255,.85)', fontSize:'1.4rem'}}>सरल <span>Khatha</span></div>
        <p className="auth-tagline">Know your business.<br /><em>Really know it.</em></p>
        <div className="auth-feature-list">
          {['Business health score updated in real time','GST invoices + WhatsApp reminders','Profit per customer insights'].map(f => (
            <div key={f} className="auth-feat">
              <div className="auth-feat-icon">✓</div>
              <div className="auth-feat-text">{f}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Sign in to your Saral Khatha account</div>
          {error && <div className="toast toast-error" style={{marginBottom:16}}>{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handle} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="auth-footer">
            No account? <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
