import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Brain, MessageCircle, Zap, Target, Lightbulb } from 'lucide-react';

const SettingsPanel = ({ settings, onChange }) => {
  const depthLevels = [
    { 
      value: 'beginner', 
      label: 'Beginner', 
      description: 'Simple concepts, no jargon',
      icon: Target,
      color: 'success'
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate', 
      description: 'Moderate technical detail',
      icon: Brain,
      color: 'primary'
    },
    { 
      value: 'advanced', 
      label: 'Advanced', 
      description: 'Technical language, equations',
      icon: Zap,
      color: 'secondary'
    }
  ];

  const analogyLevels = [
    { 
      value: 'simple', 
      label: 'Simple', 
      description: 'Everyday analogies',
      icon: Lightbulb,
      color: 'accent'
    },
    { 
      value: 'moderate', 
      label: 'Moderate', 
      description: 'Technical but relatable',
      icon: MessageCircle,
      color: 'primary'
    },
    { 
      value: 'complex', 
      label: 'Complex', 
      description: 'Sophisticated analogies',
      icon: Brain,
      color: 'secondary'
    },
    { 
      value: 'none', 
      label: 'None', 
      description: 'No analogies',
      icon: Target,
      color: 'neutral'
    }
  ];

  const getColorClasses = (color, selected = false) => {
    const colors = {
      success: selected ? 'bg-success-100 border-success-300 text-success-800' : 'border-success-200 hover:border-success-300 hover:bg-success-50',
      primary: selected ? 'bg-primary-100 border-primary-300 text-primary-800' : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50',
      secondary: selected ? 'bg-secondary-100 border-secondary-300 text-secondary-800' : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50',
      accent: selected ? 'bg-accent-100 border-accent-300 text-accent-800' : 'border-accent-200 hover:border-accent-300 hover:bg-accent-50',
      neutral: selected ? 'bg-neutral-100 border-neutral-300 text-neutral-800' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
    };
    return colors[color] || colors.neutral;
  };

  const getIconColorClasses = (color, selected = false) => {
    const colors = {
      success: selected ? 'text-success-600' : 'text-success-500',
      primary: selected ? 'text-primary-600' : 'text-primary-500',
      secondary: selected ? 'text-secondary-600' : 'text-secondary-500',
      accent: selected ? 'text-accent-600' : 'text-accent-500',
      neutral: selected ? 'text-neutral-600' : 'text-neutral-500'
    };
    return colors[color] || colors.neutral;
  };

  const handleDepthChange = (depth) => {
    onChange({ ...settings, depth });
  };

  const handleAnalogyChange = (analogy) => {
    onChange({ ...settings, analogy });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
          <Sliders className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-display font-semibold text-neutral-800">Learning Settings</h2>
      </div>

      {/* Depth Level */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-primary-600" />
          <label className="text-base font-semibold text-neutral-700">Explanation Depth</label>
        </div>
        <div className="space-y-3">
          {depthLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = settings.depth === level.value;
            
            return (
              <motion.label
                key={level.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-start space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  getColorClasses(level.color, isSelected)
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  value={level.value}
                  checked={isSelected}
                  onChange={(e) => handleDepthChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white shadow-soft' : 'bg-neutral-100'
                }`}>
                  <Icon className={`w-5 h-5 ${getIconColorClasses(level.color, isSelected)}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-800 mb-1">{level.label}</div>
                  <div className="text-sm text-neutral-600 leading-relaxed">{level.description}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </div>
      </div>

      {/* Analogy Level */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-secondary-600" />
          <label className="text-base font-semibold text-neutral-700">Analogy Style</label>
        </div>
        <div className="space-y-3">
          {analogyLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = settings.analogy === level.value;
            
            return (
              <motion.label
                key={level.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-start space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  getColorClasses(level.color, isSelected)
                }`}
              >
                <input
                  type="radio"
                  name="analogy"
                  value={level.value}
                  checked={isSelected}
                  onChange={(e) => handleAnalogyChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white shadow-soft' : 'bg-neutral-100'
                }`}>
                  <Icon className={`w-5 h-5 ${getIconColorClasses(level.color, isSelected)}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-800 mb-1">{level.label}</div>
                  <div className="text-sm text-neutral-600 leading-relaxed">{level.description}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
