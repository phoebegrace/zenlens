import { buildDashboard } from './dashboardData';

const history = [
  { date:'2026-10-18', subject:'Math', total_faces:10, average_stress:10, stress_category:'Normal' },
  { date:'2026-10-19', subject:'Science', total_faces:30, average_stress:30, stress_category:'Mild' },
];
test('weights the classroom index by face observations and sorts recent history', () => {
  const data=buildDashboard(history,[]);
  expect(data.totalSessions).toBe(2);
  expect(data.totalFaces).toBe(40);
  expect(data.averageStress).toBe(25);
  expect(data.recent[0].subject).toBe('Science');
  expect(data.trend.map(p=>p.value)).toEqual([10,30]);
});
test('combines multiple sessions from the same day without averaging session averages', () => {
  const data=buildDashboard(history.map(r=>({...r,date:'2026-10-19'})),[]);
  expect(data.trend).toHaveLength(1);
  expect(data.trend[0].value).toBe(25);
});
test('does not manufacture a normal result for empty or invalid measurements', () => {
  expect(buildDashboard([],[]).averageStress).toBeNull();
  const data=buildDashboard([{date:'2026-10-19',total_faces:0,average_stress:null},{date:'bad',total_faces:100,average_stress:50}],[]);
  expect(data.totalFaces).toBe(0);
  expect(data.averageStress).toBeNull();
  expect(data.trend).toEqual([]);
});
test('filters both charts to the selected period using session analysis dates', () => {
  const timeline=[{analysis_date:'2026-10-19',timestamp:'2020-01-01T01:00:00',emotion_counts:{happy:4,sad:2,afraid:1}}, {analysis_date:'2026-01-01',emotion_counts:{happy:99}}];
  const data=buildDashboard(history.concat([{date:'2026-01-01',total_faces:10,average_stress:99}]),timeline,7,new Date('2026-10-19T12:00:00Z'));
  expect(data.totalSessions).toBe(2);
  expect(data.emotions.find(e=>e.key==='happy').count).toBe(4);
  expect(data.emotions.find(e=>e.key==='afraid').count).toBe(1);
});
