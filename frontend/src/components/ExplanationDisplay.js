import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, List, Info, CheckCircle, Star, ArrowRight } from 'lucide-react';

const ExplanationDisplay = ({ explanation, settings = { depth: 'intermediate', analogy: 'moderate' } }) => {
  const sections = [
    {
      key: 'introduction',
      title: 'Introduction',
      icon: Info,
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
      content: explanation.introduction
    },
    {
      key: 'core_concepts',
      title: 'Core Concepts',
      icon: BookOpen,
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      borderColor: 'border-secondary-200',
      content: explanation.core_concepts
    },
    {
      key: 'analogy',
      title: 'Understanding Through Analogy',
      icon: Lightbulb,
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      borderColor: 'border-accent-200',
      content: explanation.analogy,
      show: settings.analogy !== 'none' && explanation.analogy
    },
    {
      key: 'summary',
      title: 'Key Takeaways',
      icon: List,
      gradient: 'from-success-500 to-success-600',
      bgGradient: 'from-success-50 to-success-100',
      borderColor: 'border-success-200',
      content: explanation.summary,
      isList: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
          <Star className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">
            {settings.depth.charAt(0).toUpperCase() + settings.depth.slice(1)} Level
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-sm font-medium text-secondary-700 capitalize">
            {settings.analogy === 'none' ? 'No Analogies' : `${settings.analogy} Analogies`}
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold gradient-text">Explanation Generated</h1>
      </motion.div>

      {/* Sections */}
      {sections.map((section) => {
        if (section.show === false || !section.content) return null;

        const Icon = section.icon;
        
        return (
          <motion.div
            key={section.key}
            variants={itemVariants}
            className={`glass-card rounded-3xl overflow-hidden shadow-medium border-2 ${section.borderColor} group hover:shadow-large transition-all duration-500`}
          >
            {/* Section Header */}
            <div className={`bg-gradient-to-r ${section.bgGradient} px-8 py-6 border-b ${section.borderColor}`}>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${section.gradient} rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-neutral-800">{section.title}</h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    {section.key === 'introduction' && 'Getting started with the basics'}
                    {section.key === 'core_concepts' && 'Deep dive into the fundamentals'}
                    {section.key === 'analogy' && 'Real-world comparisons to aid understanding'}
                    {section.key === 'summary' && 'Essential points to remember'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Section Content */}
            <div className="p-8">
              {section.isList && Array.isArray(section.content) ? (
                <div className="space-y-4">
                  {section.content.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gradient-to-r from-white to-neutral-50 rounded-2xl border border-neutral-100 hover:shadow-soft transition-all duration-300"
                    >
                      <div className={`w-8 h-8 bg-gradient-to-r ${section.gradient} rounded-full flex items-center justify-center flex-shrink-0 shadow-soft`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-700 leading-relaxed font-medium">{item}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="text-neutral-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="text-center pt-8 border-t border-neutral-200"
      >
        <p className="text-neutral-500 text-sm">
          ✨ Explanation generated by AI • Tailored to your learning preferences
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ExplanationDisplay;
