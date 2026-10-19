import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
jest.mock('./firebase',()=>({auth:{},db:{}}));
jest.mock('firebase/auth',()=>({onAuthStateChanged:(_auth,callback)=>{callback(null);return ()=>{};},signOut:jest.fn()}));
jest.mock('firebase/firestore',()=>({doc:jest.fn(),getDoc:jest.fn()}));
beforeEach(()=>{
  localStorage.clear();document.body.style.overflow='';
  window.matchMedia=jest.fn(()=>({matches:true,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
});
test('mobile navigation exposes state, locks background scrolling, and closes on Escape',async()=>{
  render(<MemoryRouter><Sidebar/></MemoryRouter>);
  const toggle=screen.getByRole('button',{name:'Toggle navigation'});
  expect(toggle).toHaveAttribute('aria-expanded','false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded','true');
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document,{key:'Escape'});
  await waitFor(()=>expect(toggle).toHaveAttribute('aria-expanded','false'));
  expect(document.body.style.overflow).toBe('');
});
