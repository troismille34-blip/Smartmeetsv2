// ============================================================================
// SmartMeets V2.0 - Main App Component
// ============================================================================

import { useEffect } from 'react';
import { useAuthStore } from './store';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Restore token from localStorage on app load
    const token = localStorage.getItem('smartmeets_token');
    const storedUser = localStorage.getItem('smartmeets_user');
    if (token && storedUser) {
      // Auth state is restored via zustand persist middleware
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <h1 className="text-xl font-bold text-gray-900">SmartMeets V2.0</h1>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <AuthPage />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// AUTH PAGE
// ============================================================================
function AuthPage() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = [
    'login' as 'login' | 'register',
    (v: 'login' | 'register') => {
      clearError();
      // Simple state toggle via DOM
      const form = document.getElementById('auth-form') as HTMLFormElement;
      if (form) form.reset();
      document.getElementById('auth-mode')?.setAttribute('data-mode', v);
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentMode = document.getElementById('auth-mode')?.getAttribute('data-mode') || 'login';

    try {
      if (currentMode === 'login') {
        await login(
          formData.get('email') as string,
          formData.get('password') as string
        );
      } else {
        await register(
          formData.get('email') as string,
          formData.get('name') as string,
          formData.get('password') as string
        );
      }
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">🎤</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">SmartMeets</h2>
          <p className="text-gray-500 text-sm mt-1">Enterprise Meeting Management</p>
        </div>

        <div id="auth-mode" data-mode="login">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className="flex-1 py-2 text-sm font-medium rounded-md bg-white shadow text-gray-900"
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div id="name-field" className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================
function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h2>
        <p className="text-blue-100 mt-1">SmartMeets V2.0 is ready. Start recording your meetings.</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="🎙️"
          title="Record Meeting"
          description="Start recording and get automatic transcription powered by OpenAI Whisper"
          action="Start Recording"
          color="blue"
        />
        <FeatureCard
          icon="📝"
          title="Transcripts"
          description="View, edit and manage all your meeting transcripts"
          action="View Transcripts"
          color="green"
        />
        <FeatureCard
          icon="📅"
          title="Calendar"
          description="Integrate with Outlook and Google Calendar (coming soon)"
          action="Connect Calendar"
          color="purple"
          disabled
        />
      </div>

      {/* API Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
          {[
            { method: 'POST', path: '/api/auth/register', desc: 'Register user' },
            { method: 'POST', path: '/api/auth/login', desc: 'Login user' },
            { method: 'GET', path: '/api/auth/profile', desc: 'Get profile' },
            { method: 'POST', path: '/api/transcriptions/upload', desc: 'Upload audio' },
            { method: 'GET', path: '/api/transcriptions/:id', desc: 'Get transcript' },
            { method: 'PATCH', path: '/api/transcriptions/:id', desc: 'Edit segment' },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                ep.method === 'GET' ? 'bg-green-100 text-green-700' :
                ep.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {ep.method}
              </span>
              <span className="text-gray-700">{ep.path}</span>
              <span className="text-gray-400 text-xs ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FEATURE CARD
// ============================================================================
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  action: string;
  color: 'blue' | 'green' | 'purple';
  disabled?: boolean;
}

function FeatureCard({ icon, title, description, action, color, disabled }: FeatureCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  };

  const btnColorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-colors ${colorMap[color]} ${disabled ? 'opacity-60' : ''}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <button
        disabled={disabled}
        className={`w-full text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnColorMap[color]}`}
      >
        {disabled ? '🔒 Coming Soon' : action}
      </button>
    </div>
  );
}

export default App;
