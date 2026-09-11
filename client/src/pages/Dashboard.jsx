import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

const ScoreRing = ({ score }) => {
  const r = 54; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#f59e0b' : '#dc2626';
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Fair' : 'Needs attention';
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--ink-100)" strokeWidth="10"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset .8s ease'}}/>
      </svg>
      <div className="score-center">
        <span className="score-num" style={{color}}>{score}</span>
        <span className="score-lbl">{label}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--ink-400)'}}>Loading dashboard…</div>;

  const d = data || {};
  const score = d.healthScore || 0;
  const breakdown = d.breakdown || { cashFlow:0, profitability:0, growth:0, concentration:0 };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</div>
        <div className="page-sub">{user?.businessName} — {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</div>
      </div>
      <div className="page-body">

        {/* KPI Grid */}
        <div className="kpi-grid">
          {[
            { label:'Revenue (this month)', value: fmt(d.totalRevenue||0), change: null },
            { label:'Total Expenses', value: fmt(d.totalExpenses||0), change: null },
            { label:'Net Profit', value: fmt(d.netProfit||0), change: (d.netProfit||0) > 0 ? 'kpi-up' : 'kpi-down' },
            { label:'Pending Invoices', value: fmt(d.pendingAmount||0), change: 'kpi-down' },
            { label:'Overdue', value: fmt(d.overdueAmount||0), change: 'kpi-down' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value ${k.change || ''}`}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:20, marginBottom:20}}>
          {/* Health Score */}
          <div className="card card-pad">
            <div className="card-title">Business Health Score</div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:20, paddingTop:8}}>
              <ScoreRing score={score} />
              <div className="score-breakdown" style={{width:'100%'}}>
                {[
                  { label:'Cash Flow', val: breakdown.cashFlow, max:25 },
                  { label:'Profitability', val: breakdown.profitability, max:25 },
                  { label:'Growth', val: breakdown.growth, max:25 },
                  { label:'Concentration', val: breakdown.concentration, max:25 },
                ].map(b => (
                  <div key={b.label} className="sb-row">
                    <span className="sb-label">{b.label}</span>
                    <div className="sb-bar-wrap">
                      <div className="sb-bar" style={{width:`${(b.val/b.max)*100}%`}}></div>
                    </div>
                    <span className="sb-score">{b.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cashflow Chart */}
          <div className="card card-pad">
            <div className="card-title">Cash Flow — Last 6 months</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.cashflow || []} margin={{top:10, right:10, left:0, bottom:0}}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:12, fill:'var(--ink-400)'}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v => `₹${v/1000}K`} tick={{fontSize:11, fill:'var(--ink-400)'}} axisLine={false} tickLine={false} width={50}/>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{borderRadius:8, border:'1px solid var(--ink-100)', fontSize:13}}/>
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" fill="url(#expGrad)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20}}>
          <div className="card card-pad">
            <div className="card-title">Total Invoices This Month</div>
            <div className="kpi-value" style={{fontSize:'2.2rem', marginTop:8}}>{d.totalInvoices || 0}</div>
          </div>
          <div className="card card-pad">
            <div className="card-title">Active Customers</div>
            <div className="kpi-value" style={{fontSize:'2.2rem', marginTop:8}}>{d.totalCustomers || 0}</div>
          </div>
        </div>
      </div>
    </>
  );
}
