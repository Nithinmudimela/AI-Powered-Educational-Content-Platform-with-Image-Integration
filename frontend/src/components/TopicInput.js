import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Command, ArrowRight } from 'lucide-react';
import { academicAPI } from '../services/api';

const TopicInput = ({ onSubmit, loading }) => {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (topic.length > 2) {
        fetchSuggestions(topic);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [topic]);

  const fetchSuggestions = async (query) => {
    try {
      const result = await academicAPI.searchTopics(query, 6);
      setSuggestions(result.suggestions || []);
      setShowSuggestions(true);
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion.name);
    setShowSuggestions(false);
    onSubmit(suggestion.name);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const popularTopics = [
    { name: 'Photosynthesis', category: 'Biology', icon: '🌱' },
    { name: 'Quantum Physics', category: 'Physics', icon: '⚛️' },
    { name: 'Machine Learning', category: 'Computer Science', icon: '🤖' },
    { name: 'Renaissance Art', category: 'History', icon: '🎨' },
    { name: 'Calculus', category: 'Mathematics', icon: '📊' },
    { name: 'Climate Change', category: 'Environmental Science', icon: '🌍' }
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 z-10" />
            <input
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => topic.length > 2 && setShowSuggestions(true)}
              placeholder="Enter any academic topic..."
              className="w-full pl-12 pr-12 py-4 bg-white/70 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white outline-none transition-all duration-300 text-neutral-800 placeholder-neutral-400 backdrop-blur-sm"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1 text-neutral-400">
                <Command className="w-4 h-4" />
                <span className="text-xs font-medium">⏎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-large overflow-hidden"
            >
              <div className="max-h-72 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-6 py-4 text-left transition-all duration-200 border-b border-neutral-100 last:border-b-0 ${
                      focusedIndex === index ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-800">{suggestion.name}</div>
                        <div className="text-sm text-neutral-500 capitalize">{suggestion.category}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full mt-4 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 group"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Explanation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:animate-bounce-soft" />
              <span>Explain Topic</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      {/* Popular Topics Grid */}
      <div>
        <h3 className="text-sm font-display font-semibold text-neutral-700 mb-4 flex items-center space-x-2">
          <span>Popular Topics</span>
          <div className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent" />
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularTopics.map((popularTopic, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTopic(popularTopic.name);
                onSubmit(popularTopic.name);
              }}
              className="group p-4 bg-white/40 hover:bg-white/60 border border-neutral-200 rounded-xl transition-all duration-300 text-left hover:shadow-soft"
              disabled={loading}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{popularTopic.icon}</span>
                <div>
                  <div className="font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                    {popularTopic.name}
                  </div>
                  <div className="text-xs text-neutral-500">{popularTopic.category}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicInput;
