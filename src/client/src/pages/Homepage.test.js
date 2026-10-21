import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './Homepage';
import { api } from '../api';
jest.mock('../api',()=>({api:{get:jest.fn()}}));
const rows=[{date:'2026-10-18',subject:'Math',total_faces:10,average_stress:10,stress_category:'Normal'},{date:'2026-10-19',subject:'Science',total_faces:30,average_stress:30,stress_category:'Mild'}];
beforeEach(()=>api.get.mockReset());
test('shows real session totals, trend, emotion counts, and recent history',async()=>{
  api.get.mockImplementation(url=>Promise.resolve({data:url.endsWith('/history')?rows:[{analysis_date:'2026-10-19',emotion_counts:{happy:4,sad:2}}]}));
  render(<MemoryRouter><HomePage/></MemoryRouter>);
  expect(await screen.findByRole('img',{name:/Daily classroom index across 2/})).toBeInTheDocument();
  const stats=within(screen.getByRole('region',{name:'Session overview'}));
  expect(stats.getByText('40')).toBeInTheDocument();
  expect(stats.getByText('25.0')).toBeInTheDocument();
  expect(screen.getByRole('img',{name:/Happiness: 4/})).toBeInTheDocument();
  expect(screen.getByText('Science')).toBeInTheDocument();
});
test('shows empty states without pretending that missing data is a normal result',async()=>{
  api.get.mockResolvedValue({data:[]});
  render(<MemoryRouter><HomePage/></MemoryRouter>);
  expect(await screen.findByText('No sessions in this period')).toBeInTheDocument();
  expect(screen.getByText(/No measured sessions in this period/)).toBeInTheDocument();
  expect(screen.queryByRole('img',{name:/Daily classroom index/})).not.toBeInTheDocument();
});
test('reports a history failure with a retry instead of showing fabricated charts',async()=>{
  api.get.mockRejectedValue(new Error('offline'));
  render(<MemoryRouter><HomePage/></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
  expect(screen.getByRole('button',{name:'Retry'})).toBeInTheDocument();
  expect(screen.queryByText('No sessions in this period')).not.toBeInTheDocument();
});
