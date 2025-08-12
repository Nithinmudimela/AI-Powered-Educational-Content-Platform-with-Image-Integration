import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Check, AlertCircle, Wifi, Server, Image, Brain } from 'lucide-react';

const StatusIndicator = ({ status }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!status) return null;

  const isHealthy = status.health?.status === 'healthy';
  const availableSources = status.imageStatus?.sources ? 
    Object.entries(status.imageStatus.sources).filter(([, available]) => available).length : 0;

  const getStatusColor = () => {
    if (!isHealthy) return 'red';
    if (availableSources >= 3) return 'green';
    if (availableSources >= 1) return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    if (!isHealthy) return 'Offline';
    if (availableSources >= 3) return 'Excellent';
    if (availableSources >= 1) return 'Good';
    return 'Limited';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  const colorClasses = {
    green: 'bg-success-100 text-success-800 border-success-200',
    yellow: 'bg-accent-100 text-accent-800 border-accent-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  const iconColorClasses = {
    green: 'text-success-600',
    yellow: 'text-accent-600',
    red: 'text-red-600'
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${colorClasses[statusColor]}`}
        title="System Status"
      >
        <div className="relative">
          {isHealthy ? (
            <Check className={`w-4 h-4 ${iconColorClasses[statusColor]}`} />
          ) : (
            <AlertCircle className={`w-4 h-4 ${iconColorClasses[statusColor]}`} />
          )}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full ${
              statusColor === 'green' ? 'bg-success-400' :
              statusColor === 'yellow' ? 'bg-accent-400' : 'bg-red-400'
            }`}
          />
        </div>
        <span>{statusText}</span>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-3 w-80 glass-card rounded-2xl shadow-large z-50 p-6 border border-neutral-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-display font-semibold text-neutral-800">System Status</h3>
            </div>
            
            <div className="space-y-4">
              {/* Backend Status */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Server className={`w-5 h-5 ${isHealthy ? 'text-success-600' : 'text-red-600'}`} />
                  <span className="font-medium text-neutral-700">Backend API</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isHealthy ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isHealthy ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* AI Service Status */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-neutral-700">AI Service</span>
                </div>
                <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  Ready
                </div>
              </div>

              {/* Image Sources */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-secondary-600" />
                  <span className="font-medium text-neutral-700">Image Sources</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  availableSources >= 2 ? 'bg-success-100 text-success-700' : 
                  availableSources >= 1 ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-700'
                }`}>
                  {availableSources}/4 Active
                </div>
              </div>

              {/* Detailed Source Status */}
              {status.imageStatus?.sources && (
                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">Available Sources:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(status.imageStatus.sources).map(([source, available]) => (
                      <div key={source} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        available ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        <span className="capitalize font-medium">{source}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          available ? 'bg-success-500' : 'bg-neutral-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connection Quality */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700">Connection Quality</span>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < (isHealthy ? 4 : 1) ? 'bg-primary-500' : 'bg-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusIndicator;
