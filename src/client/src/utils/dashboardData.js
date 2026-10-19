const EMOTIONS = [
  ['happy','Happiness','#64b7f4'], ['neutral','Neutral','#7d95e8'],
  ['surprise','Surprise','#9b8bea'], ['sad','Sadness','#83a8c3'],
  ['angry','Anger','#e9929b'], ['afraid','Fear','#c4a5df'], ['disgust','Disgust','#91b8aa'],
];
function dateKey(value) {
  if (typeof value !== 'string') return null;
  const key=value.slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const date=new Date(`${key}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===key ? key : null;
}
const count=value=>Number.isFinite(Number(value)) && Number(value)>0 ? Math.floor(Number(value)) : 0;
const index=value=>value!==null && value!=='' && Number.isFinite(Number(value)) && Number(value)>=0 && Number(value)<=100 ? Number(value) : null;

export function buildDashboard(history=[], timeline=[], days=0, now=new Date()) {
  const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const cutoff=days ? new Date(Date.parse(`${today}T00:00:00Z`)-(days-1)*86400000).toISOString().slice(0,10) : null;
  const included=key=>key && (!cutoff || (key>=cutoff && key<=today));
  const sessions=(Array.isArray(history)?history:[]).filter(row=>included(dateKey(row.date))).sort((a,b)=>b.date.localeCompare(a.date)||(Number(b.session)||0)-(Number(a.session)||0));
  const daily=new Map();
  let totalFaces=0, weighted=0, measuredFaces=0;
  for (const row of sessions) {
    const faces=count(row.total_faces), value=index(row.average_stress);
    totalFaces+=faces;
    if (!faces || value===null) continue;
    weighted+=faces*value; measuredFaces+=faces;
    const item=daily.get(row.date)||{date:row.date,weighted:0,faces:0,sessions:0};
    item.weighted+=faces*value; item.faces+=faces; item.sessions+=1; daily.set(row.date,item);
  }
  const emotions=EMOTIONS.map(([key,label,color])=>({key,label,color,count:0}));
  for (const row of Array.isArray(timeline)?timeline:[]) {
    if (!included(dateKey(row.analysis_date)||dateKey(row.timestamp))) continue;
    for (const emotion of emotions) emotion.count+=count(row.emotion_counts?.[emotion.key]);
  }
  return {
    totalSessions:sessions.length,totalFaces,averageStress:measuredFaces?weighted/measuredFaces:null,
    activeDays:new Set(sessions.map(row=>row.date)).size,latestDate:sessions[0]?.date||null,
    recent:sessions.slice(0,6),emotions,
    trend:[...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(item=>({...item,value:item.weighted/item.faces})),
  };
}
