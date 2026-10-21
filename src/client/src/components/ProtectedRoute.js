import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from './firebase';

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ ready: false, user: null });
  useEffect(() => onAuthStateChanged(auth, user => setState({ ready: true, user })), []);
  if (!state.ready) return <div role="status" style={{ padding: '2rem' }}>Loading ASTRA…</div>;
  return state.user ? children : <Navigate to="/login" replace />;
}
