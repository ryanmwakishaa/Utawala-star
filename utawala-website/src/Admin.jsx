import React, { useState, useEffect } from 'react';
import { Upload, Save, X, Plus, Trash2, Edit2, Lock, Unlock } from 'lucide-react';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [content, setContent] = useState({
    hero: {
      title: 'Utawala Star Sprints Club',
      subtitle: 'Unleash the champion within'
    },
    welcome: {
      title: 'Welcome to Utawala Star Sprints Club',
      text: 'We are dedicated to developing world-class sprinters in the heart of Kenya. Our club provides professional coaching, state-of-the-art training programs, and a supportive community for athletes of all levels.'
    },
    features: [
      {
        icon: '🏃',
        title: 'Professional Coaching',
        description: 'Train with certified athletics coaches who have experience at national and international levels.'
      },
      {
        icon: '🏆',
        title: 'Competitive Excellence',
        description: 'Participate in local, regional, national and International competitions to showcase your talent.'
      },
      {
        icon: '👥',
        title: 'Community Spirit',
        description: 'Join a family of dedicated athletes who support and motivate each other.'
      }
    ],
    achievements: [
      'Several club members were part of the Kenyan national team at the 2025 World Athletics Championships in Tokyo and the World Relays.',
      'Athletes Meshack Babu, Clinton Aluvi and Dennis Mwai were specifically named to the 4x100m relay squads.',
      'Clinton Aluvi also won the coveted 100m gold medal in the African U-20 championship held in Nigeria 2025.'
    ],
    mission: 'Having recently partnered with USATF central California and Frenso flyers athletics club in California for exchange programmes and cultural exchanges, our ongoing mission is to identify, nurture, and develop sprinting talent from the grassroots to elite levels.',
    vision: 'To be the premier sprint club in Kenya, producing national and international champions who inspire the next generation of athletes.',
    coaches: [
      {
        name: 'Coach Perpetual Mbutu',
        title: 'Head Coach',
        bio: 'IAAF Certified Coach with over 10 years of coaching experience. Former administrative police champion and specialist in sprint training mechanics.'
      },
      {
        name: 'Coach Simon Riga',
        title: 'Assistant Coach',
        bio: 'National coach of the relay team in Guangzhou, China 2025. Known for his pivotal role in Kenya\'s historic 4x100m relay success.'
      }
    ],
    contact: {
      phone: '+254 706 449 949',
      altPhone: '+254 703 1460879',
      email: 'utawalastarsprintsclub@gmail.com'
    },
    images: {
      logo: 'logo.png',
      teamPhoto: 'team-photo.jpeg'
    }
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const result = await window.storage.get('utawala-content');
      if (result && result.value) {
        setContent(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No saved content found, using defaults');
    }
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);
    setMessage('');
    try {
      await window.storage.set('utawala-content', JSON.stringify(content));
      setMessage('✓ Content saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('✗ Error saving content');
    }
    setSaving(false);
  };

  const handleLogin = () => {
    if (password === 'utawala2025') {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  };

  const updateField = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section, index, value) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (section, defaultItem) => {
    setContent(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Dashboard</h1>
          <p className="text-center text-gray-600 mb-6">Utawala Star Sprints Club</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Login
          </button>
          {message && (
            <p className="mt-4 text-center text-red-600">{message}</p>
          )}
          <p className="mt-4 text-xs text-gray-500 text-center">Default password: utawala2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Utawala Star Sprints Club</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
            <button
              onClick={saveContent}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <Unlock className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {['home', 'about', 'achievements', 'coaches', 'contact'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Hero Section</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
                    <input
                      type="text"
                      value={content.hero.title}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={content.hero.subtitle}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Welcome Section</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={content.welcome.title}
                      onChange={(e) => updateField('welcome', 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={content.welcome.text}
                      onChange={(e) => updateField('welcome', 'text', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Features</h2>
                {content.features.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon (emoji)</label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateArrayItem('features', index, { ...feature, icon: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateArrayItem('features', index, { ...feature, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateArrayItem('features', index, { ...feature, description: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Mission</h2>
                <textarea
                  value={content.mission}
                  onChange={(e) => setContent(prev => ({ ...prev, mission: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Vision</h2>
                <textarea
                  value={content.vision}
                  onChange={(e) => setContent(prev => ({ ...prev, vision: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Images</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={content.images.logo}
                      onChange={(e) => setContent(prev => ({ 
                        ...prev, 
                        images: { ...prev.images, logo: e.target.value }
                      }))}
                      placeholder="e.g., logo.png or https://example.com/logo.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Photo URL</label>
                    <input
                      type="text"
                      value={content.images.teamPhoto}
                      onChange={(e) => setContent(prev => ({ 
                        ...prev, 
                        images: { ...prev.images, teamPhoto: e.target.value }
                      }))}
                      placeholder="e.g., team-photo.jpeg or https://example.com/team.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Major Achievements</h2>
                <button
                  onClick={() => addArrayItem('achievements', '')}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>
              {content.achievements.map((achievement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <textarea
                      value={achievement}
                      onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                      rows={3}
                      placeholder="Enter achievement description..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => removeArrayItem('achievements', index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'coaches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Coaching Team</h2>
                <button
                  onClick={() => addArrayItem('coaches', { name: '', title: '', bio: '' })}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Coach
                </button>
              </div>
              {content.coaches.map((coach, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Coach {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('coaches', index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={coach.name}
                        onChange={(e) => updateArrayItem('coaches', index, { ...coach, name: e.target.value })}
                        placeholder="Coach name..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={coach.title}
                        onChange={(e) => updateArrayItem('coaches', index, { ...coach, title: e.target.value })}
                        placeholder="e.g., Head Coach"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={coach.bio}
                        onChange={(e) => updateArrayItem('coaches', index, { ...coach, bio: e.target.value })}
                        rows={4}
                        placeholder="Coach biography..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Phone</label>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) => updateField('contact', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alternative Phone</label>
                  <input
                    type="text"
                    value={content.contact.altPhone}
                    onChange={(e) => updateField('contact', 'altPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => updateField('contact', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;