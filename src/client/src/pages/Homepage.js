import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BarChart3, CalendarDays, Clock3, History, RefreshCw, ScanFace, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { buildDashboard } from '../utils/dashboardData';
import brandMark from '../image/astra-mark-blue.svg';
import './Homepage.css';

const number=value=>new Intl.NumberFormat().format(value);
const dateLabel=value=>value ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'}) : '—';

function EmptyChart({ children }) {
  return <div className="astra-chart-empty"><BarChart3 aria-hidden="true"/><p>{children}</p></div>;
}

function TrendChart({ points }) {
  if (!points.length) return <EmptyChart>No measured sessions in this period. Complete an analysis to start your trend.</EmptyChart>;
  const first=Date.parse(points[0].date),last=Date.parse(points[points.length-1].date);
  const x=point=>last===first?330:54+(Date.parse(point.date)-first)/(last-first)*552;
  const y=value=>222-value*1.88;
  const path=points.map((point,i)=>`${i?'L':'M'}${x(point)},${y(point.value)}`).join(' ');
  const area=`${path} L${x(points[points.length-1])},222 L${x(points[0])},222 Z`;
  const labels=[...new Set([0,Math.floor((points.length-1)/2),points.length-1])];
  return <>
    <svg className="astra-trend-svg" viewBox="0 0 640 265" role="img" aria-label={`Daily classroom index across ${points.length} recorded days, from ${dateLabel(points[0].date)} to ${dateLabel(points[points.length-1].date)}.`}>
      <defs><linearGradient id="astra-trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#73bdf5" stopOpacity=".28"/><stop offset="100%" stopColor="#73bdf5" stopOpacity=".02"/></linearGradient></defs>
      {[0,25,50,75,100].map(value=><g key={value}><line x1="54" x2="606" y1={y(value)} y2={y(value)} stroke="#e6edf6" strokeDasharray="3 5"/><text x="40" y={y(value)+4} textAnchor="end">{value}</text></g>)}
      <path d={area} fill="url(#astra-trend-fill)"/>
      <path d={path} fill="none" stroke="#449de5" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map(point=><circle key={point.date} cx={x(point)} cy={y(point.value)} r="4" fill="#449de5" stroke="white" strokeWidth="2"><title>{point.date}: {point.value.toFixed(1)} / 100 · {point.sessions} sessions · {number(point.faces)} face observations</title></circle>)}
      {labels.map(i=><text key={i} x={x(points[i])} y="250" textAnchor="middle">{dateLabel(points[i].date)}</text>)}
    </svg>
    <details className="astra-chart-data"><summary>View chart data</summary><div className="astra-table-scroll"><table><caption className="astra-sr-only">Daily classroom index</caption><thead><tr><th>Date</th><th>Index / 100</th><th>Sessions</th></tr></thead><tbody>{points.map(p=><tr key={p.date}><td>{p.date}</td><td>{p.value.toFixed(1)}</td><td>{p.sessions}</td></tr>)}</tbody></table></div></details>
  </>;
}

export default function HomePage() {
  const [history,setHistory]=useState([]), [timeline,setTimeline]=useState([]);
  const [loading,setLoading]=useState(true), [historyError,setHistoryError]=useState(''),[timelineError,setTimelineError]=useState('');
  const [period,setPeriod]=useState(0);
  const load=useCallback(async signal=>{
    setLoading(true);setHistoryError('');setTimelineError('');
    const results=await Promise.allSettled([api.get('/api/history',{signal}),api.get('/api/emotion-timeline',{signal})]);
    if (signal?.aborted) return;
    if (results[0].status==='fulfilled' && Array.isArray(results[0].value.data)) setHistory(results[0].value.data);
    else {setHistory([]);setHistoryError('Your session history could not be loaded. Please try again.');}
    if (results[1].status==='fulfilled' && Array.isArray(results[1].value.data)) setTimeline(results[1].value.data);
    else {setTimeline([]);if(results[1].reason?.response?.status!==404)setTimelineError('Emotion observations could not be loaded.');}
    setLoading(false);
  },[]);
  useEffect(()=>{const controller=new AbortController();load(controller.signal);return()=>controller.abort();},[load]);
  const data=useMemo(()=>buildDashboard(history,timeline,period),[history,timeline,period]);
  const emotionTotal=data.emotions.reduce((sum,item)=>sum+item.count,0);
  const maxEmotion=Math.max(1,...data.emotions.map(item=>item.count));
  const stats=[
    {label:'Analyzed sessions',value:number(data.totalSessions),detail:'Completed classroom analyses',icon:History},
    {label:'Face observations',value:number(data.totalFaces),detail:'Detections across session images',icon:ScanFace},
    {label:'Average classroom index',value:data.averageStress===null?'—':`${data.averageStress.toFixed(1)}`,detail:'Face-weighted score out of 100',icon:Activity},
    {label:'Days recorded',value:number(data.activeDays),detail:data.latestDate?`Latest session · ${dateLabel(data.latestDate)}`:'Your history begins with one session',icon:CalendarDays},
  ];
  return <div className="zen-dashboard-page astra-dashboard"><main className="zen-dashboard-main astra-dashboard-main"><div className="astra-dashboard-content">
    <header className="astra-dashboard-heading"><div><span className="astra-dashboard-eyebrow">YOUR CLASSROOM AT A GLANCE</span><h1>Classroom dashboard<span>.</span></h1><p>Track recorded sessions, explore emotion patterns, and review your recent history.</p></div><Link className="astra-dashboard-primary" to="/stressdetection"><ScanFace size={18}/>New analysis<ArrowRight size={17}/></Link></header>
    <div className="astra-dashboard-toolbar"><span><Clock3 size={16}/>{loading?'Updating your dashboard…':'Based on your saved analyses'}</span><div><label htmlFor="dashboard-period">Period</label><select id="dashboard-period" value={period} onChange={event=>setPeriod(Number(event.target.value))}><option value="0">All history</option><option value="30">Last 30 days</option><option value="7">Last 7 days</option></select><button type="button" onClick={()=>load()} disabled={loading} aria-label="Refresh dashboard"><RefreshCw size={17}/></button></div></div>
    {historyError && <div className="astra-dashboard-error" role="alert">{historyError}<button type="button" onClick={()=>load()}>Retry</button></div>}
    <section className="astra-dashboard-stats" aria-label="Session overview" aria-busy={loading}>{stats.map(stat=>{const Icon=stat.icon;return <article key={stat.label} className="astra-dashboard-stat"><div><span>{stat.label}</span><Icon size={19} aria-hidden="true"/></div><strong>{loading?'—':historyError?'—':stat.value}</strong><p>{stat.detail}</p></article>;})}</section>
    <section className="astra-dashboard-charts" aria-label="Classroom charts">
      <article className="astra-dashboard-panel astra-dashboard-trend"><div className="astra-panel-heading"><div><span className="astra-dashboard-eyebrow">OVER TIME</span><h2>Classroom index trend</h2></div><TrendingUp aria-hidden="true"/></div><p className="astra-panel-description">Daily average, weighted by face observations. Hover over a point for its session details.</p>{loading?<div role="status" className="astra-chart-empty">Loading your trend…</div>:historyError?<EmptyChart>Session data is unavailable. Retry loading your dashboard.</EmptyChart>:<TrendChart points={data.trend}/>}</article>
      <article className="astra-dashboard-panel"><div className="astra-panel-heading"><div><span className="astra-dashboard-eyebrow">DETECTED EMOTIONS</span><h2>Emotion distribution</h2></div><BarChart3 aria-hidden="true"/></div><p className="astra-panel-description">{number(emotionTotal)} facial observations in the selected period.</p>{loading?<div role="status" className="astra-chart-empty">Loading emotion counts…</div>:timelineError?<EmptyChart>{timelineError}</EmptyChart>:!emotionTotal?<EmptyChart>No emotion observations in this period yet.</EmptyChart>:<div className="astra-emotion-bars" role="img" aria-label={data.emotions.map(e=>`${e.label}: ${e.count}`).join(', ')}>{data.emotions.map(item=><div className="astra-emotion-bar" key={item.key}><div><span>{item.label}</span><strong>{number(item.count)}</strong></div><div className="astra-emotion-track"><span style={{width:`${item.count/maxEmotion*100}%`,background:item.color}}/></div></div>)}</div>}</article>
    </section>
    <section className="astra-dashboard-panel astra-recent-panel"><div className="astra-panel-heading"><div><span className="astra-dashboard-eyebrow">RECENT ACTIVITY</span><h2>Session history</h2></div><Link to="/sessionhistory">View all<ArrowRight size={16}/></Link></div>{loading?<p role="status" className="astra-panel-description">Loading saved sessions…</p>:historyError?<p className="astra-panel-description">History is unavailable until the dashboard reloads successfully.</p>:!data.recent.length?<div className="astra-history-empty"><History size={24}/><h3>No sessions in this period</h3><p>Complete an analysis or choose a wider period to see your classroom history.</p><Link to="/stressdetection">Start an analysis<ArrowRight size={16}/></Link></div>:<div className="astra-recent-list"><div className="astra-recent-labels"><span>Session / subject</span><span>Date</span><span>Faces</span><span>Category</span></div>{data.recent.map((row,i)=><article key={row.session_id||`${row.date}-${i}`} className="astra-recent-row"><div><span className="astra-session-icon"><History size={18}/></span><div><h3>{row.subject||'Classroom session'}</h3><p>{row.teacher||'Teacher not specified'} · Session {row.session||i+1}</p></div></div><time dateTime={row.date}>{dateLabel(row.date)}</time><span className="astra-recent-faces">{number(Number(row.total_faces)||0)}<small> face observations</small></span><span className="astra-category">{row.stress_category||'Unavailable'}</span></article>)}</div>}</section>
    <p className="astra-dashboard-note">The classroom index summarizes detected expressions; it is not a medical or psychological diagnosis. Face observations may include the same person across multiple images.</p>
    <footer className="astra-dashboard-footer"><div><img src={brandMark} alt=""/><strong>ASTRA</strong></div><span>Classroom emotion &amp; stress analytics</span><Link to="/how-it-works">How it works<ArrowRight size={14}/></Link></footer>
  </div></main></div>;
}
