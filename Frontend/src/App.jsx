import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('login');
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [formData, setFormData] = useState({});

  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/me`);
      setUser(res.data);
      setView('home');
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const fetchTutors = async () => {
    const res = await axios.get(`${API_URL}/tutors`);
    setTutors(res.data);
  };

  const fetchSessions = async () => {
    const res = await axios.get(`${API_URL}/sessions`);
    setSessions(res.data);
  };

  const fetchMySessions = async () => {
    const res = await axios.get(`${API_URL}/my-sessions`);
    setMySessions(res.data);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setView('home');
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setView('home');
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('login');
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/sessions`, formData);
      alert('Session created!');
      setFormData({});
      fetchMySessions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create session');
    }
  };

  const handleBookSession = async (sessionId) => {
    try {
      await axios.post(`${API_URL}/sessions/${sessionId}/book`);
      alert('Session booked!');
      fetchSessions();
      fetchMySessions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to book session');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto mt-10">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">EduConnect</h1>
            <p className="text-center text-gray-600 mb-6 text-sm">Quality Education for All (SDG 4)</p>
            
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setView('login')}
                className={`flex-1 py-2 rounded ${view === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                Login
              </button>
              <button
                onClick={() => setView('register')}
                className={`flex-1 py-2 rounded ${view === 'register' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                Register
              </button>
            </div>

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700">
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <select
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
                <input
                  type="text"
                  placeholder="Subjects (comma separated)"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, subjects: e.target.value.split(',')})}
                />
                <textarea
                  placeholder="Bio"
                  className="w-full p-3 border rounded"
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700">
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">EduConnect</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="bg-indigo-800 px-4 py-1 rounded text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setView('home')}
            className={`px-4 py-2 rounded whitespace-nowrap ${view === 'home' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            Home
          </button>
          {user?.role === 'student' && (
            <>
              <button
                onClick={() => { setView('tutors'); fetchTutors(); }}
                className={`px-4 py-2 rounded whitespace-nowrap ${view === 'tutors' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
              >
                Find Tutors
              </button>
              <button
                onClick={() => { setView('sessions'); fetchSessions(); }}
                className={`px-4 py-2 rounded whitespace-nowrap ${view === 'sessions' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
              >
                Browse Sessions
              </button>
            </>
          )}
          {user?.role === 'tutor' && (
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded whitespace-nowrap ${view === 'create' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >
              Create Session
            </button>
          )}
          <button
            onClick={() => { setView('my-sessions'); fetchMySessions(); }}
            className={`px-4 py-2 rounded whitespace-nowrap ${view === 'my-sessions' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            My Sessions
          </button>
        </div>

        {view === 'home' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
            <p className="text-gray-600 mb-4">
              You are registered as a <span className="font-semibold">{user?.role}</span>
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="font-semibold">Supporting SDG 4: Quality Education</p>
              <p className="text-sm text-gray-700">
                EduConnect provides free peer-to-peer tutoring to ensure inclusive and equitable quality education for all.
              </p>
            </div>
            {user?.role === 'tutor' && (
              <p className="text-gray-700">
                Create tutoring sessions to help students learn. Share your knowledge and make a difference!
              </p>
            )}
            {user?.role === 'student' && (
              <p className="text-gray-700">
                Browse available sessions and book time with tutors. Learning has never been more accessible!
              </p>
            )}
          </div>
        )}

        {view === 'tutors' && (
          <div className="grid gap-4 md:grid-cols-2">
            {tutors.map(tutor => (
              <div key={tutor._id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold">{tutor.name}</h3>
                <p className="text-sm text-gray-600">{tutor.email}</p>
                <p className="mt-2">{tutor.bio}</p>
                <div className="mt-2">
                  <span className="text-sm font-semibold">Subjects: </span>
                  <span className="text-sm">{tutor.subjects?.join(', ')}</span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{tutor.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm text-gray-600 ml-2">({tutor.totalReviews} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'sessions' && (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map(session => (
              <div key={session._id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold">{session.title}</h3>
                <p className="text-sm text-indigo-600 font-semibold">{session.subject}</p>
                <p className="mt-2 text-gray-700">{session.description}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Tutor:</span> {session.tutor?.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Date:</span> {new Date(session.date).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Duration:</span> {session.duration} minutes
                </p>
                <button
                  onClick={() => handleBookSession(session._id)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'create' && user?.role === 'tutor' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Create Tutoring Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <input
                type="text"
                placeholder="Session Title"
                className="w-full p-3 border rounded"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full p-3 border rounded"
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-3 border rounded"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <input
                type="datetime-local"
                className="w-full p-3 border rounded"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                className="w-full p-3 border rounded"
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                required
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700">
                Create Session
              </button>
            </form>
          </div>
        )}

        {view === 'my-sessions' && (
          <div className="grid gap-4 md:grid-cols-2">
            {mySessions.map(session => (
              <div key={session._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{session.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.status === 'available' ? 'bg-green-100 text-green-800' :
                    session.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-sm text-indigo-600 font-semibold">{session.subject}</p>
                <p className="mt-2 text-gray-700">{session.description}</p>
                {user?.role === 'student' && session.tutor && (
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Tutor:</span> {session.tutor.name}
                  </p>
                )}
                {user?.role === 'tutor' && session.student && (
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Student:</span> {session.student.name}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-semibold">Date:</span> {new Date(session.date).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Duration:</span> {session.duration} minutes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;