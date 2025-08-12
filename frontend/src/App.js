// Improved App.js - Professional and Colorful Frontend for EduExplain
// This version enhances the UI with a modern, responsive design, colorful theme (vibrant blues, greens, and purples),
// smooth animations using Framer Motion, and improved structure for better user experience.

import React, { useState, useEffect } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Image as ImageIcon, Settings, Activity, Sparkles, Menu, X, ChevronDown, Star } from 'lucide-react';
import TopicInput from './components/TopicInput';
import ExplanationDisplay from './components/ExplanationDisplay';
import SettingsPanel from './components/SettingsPanel';
import ImageGallery from './components/ImageGallery';
import { academicAPI } from './services/api';

function App() {
  const [explanation, setExplanation] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ depth: 'intermediate', analogy: 'moderate' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const [health, imageStatus] = await Promise.all([
        academicAPI.healthCheck(),
        academicAPI.getImageSourcesStatus()
      ]);
      setSystemStatus({ health, imageStatus });
    } catch (error) {
      console.error('System health check failed:', error);
    }
  };

  const handleTopicSubmit = async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
    setImages([]);
    setSidebarOpen(false);
    try {
      const result = await academicAPI.generateExplanation(
        topic,
        settings.depth,
        settings.analogy
      );
      if (result.success) {
        setExplanation(result.data.explanation);
        setImages(result.data.diagrams || []);
      } else {
        setError(result.error || 'Failed to generate explanation');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header glass-effect">
        <div className="logo-container">
          <BookOpen className="logo-icon" />
          <h1>EduExplain</h1>
        </div>
        <nav className="main-nav">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-button">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -200 }}
                className="sidebar"
              >
                <SettingsPanel settings={settings} setSettings={setSettings} />
                <div className="system-status">
                  <Activity /> System Health: {systemStatus?.health ? 'Online' : 'Offline'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <main className="main-content animate-fade-in">
        {error && <div className="error-message">{error}</div>}
        
        <section className="welcome-section">
          <h2>Welcome to EduExplain <Sparkles className="sparkle-icon" /></h2>
          <p>Transform any academic topic into personalized explanations with stunning visual content. Adjust complexity levels to match your learning journey.</p>
        </section>

        <TopicInput onSubmit={handleTopicSubmit} loading={loading} />

        {loading && <div className="loading-spinner"><Brain className="animate-pulse-soft" /></div>}

        {explanation && (
          <ExplanationDisplay explanation={explanation} />
        )}

        {images.length > 0 && (
          <ImageGallery images={images} />
        )}
      </main>

      <footer className="App-footer">
        <p>Powered by AI <Star /> | © 2025 EduExplain</p>
      </footer>
    </div>
  );
}

export default App;
