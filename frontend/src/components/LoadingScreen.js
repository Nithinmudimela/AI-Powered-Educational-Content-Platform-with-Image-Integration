import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, BookOpen, Image } from 'lucide-react';

const LoadingAnimation = () => {
  const steps = [
    { icon: Brain, text: 'Analyzing topic', color: 'primary' },
    { icon: BookOpen, text: 'Generating explanation', color: 'secondary' },
    { icon: Image, text: 'Finding visual content', color: 'success' },
    { icon: Sparkles, text: 'Finalizing response', color: 'accent' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      secondary: 'from-secondary-500 to-secondary-600',
      success: 'from-success-500 to-success-600',
      accent: 'from-accent-500 to-accent-600'
    };
    return colors[color];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 shadow-large text-center"
    >
      {/* Main Loading Icon */}
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full flex items-center justify-center shadow-glow-blue"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
      
      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-3xl font-display font-bold gradient-text mb-4"
      >
        Generating Your Explanation
      </motion.h2>
      
      <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
        Our AI is analyzing your topic and creating personalized educational content just for you.
      </p>

      {/* Progress Steps */}
      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-neutral-200"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
                className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(step.color)} rounded-xl flex items-center justify-center shadow-soft`}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
              
              <div className="flex-1 text-left">
                <div className="font-semibold text-neutral-800">{step.text}</div>
                <div className="text-sm text-neutral-500">Processing...</div>
              </div>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8 max-w-md mx-auto">
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">This may take a few moments...</p>
      </div>
    </motion.div>
  );
};

export default LoadingAnimation;
