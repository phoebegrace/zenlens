import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/firebase', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, callback) => { callback(null); return () => {}; },
}));
jest.mock('./pages/LoginPage', () => () => <h1>Sign in to ASTRA</h1>);
jest.mock('./pages/ForgotPasswordPage', () => () => <h1>Reset your password</h1>);
jest.mock('./components/Sidebar', () => () => <nav>Workspace</nav>);
jest.mock('./pages/Homepage', () => () => <h1>Private dashboard</h1>);
jest.mock('./pages/Analysispage', () => () => <div>Analysis</div>);
jest.mock('./pages/Historypage', () => () => <div>History</div>);
jest.mock('./pages/Monitoringpage', () => () => <div>Monitoring</div>);
jest.mock('./pages/RegisterPage', () => () => <div>Register</div>);
jest.mock('./pages/SessionHispage', () => () => <div>Sessions</div>);
jest.mock('./pages/OverallHispage', () => () => <div>Insights</div>);
jest.mock('./pages/Aboutpage', () => () => <div>About</div>);
jest.mock('./pages/HowItWorksPage', () => () => <div>Guide</div>);

test('password reset route renders instead of redirecting to login', async () => {
  window.history.replaceState({}, '', '/forgot-password');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Reset your password' })).toBeInTheDocument();
});

test('anonymous users cannot open the private dashboard', async () => {
  window.history.replaceState({}, '', '/home');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Sign in to ASTRA' })).toBeInTheDocument();
  expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument();
});
