import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Eye, Download, X, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const getSourceConfig = (source) => {
    const configs = {
      shutterstock: { 
        name: 'Shutterstock', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📸'
      },
      unsplash: { 
        name: 'Unsplash', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🌅'
      },
      pixabay: { 
        name: 'Pixabay', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🎨'
      },
      wikimedia: { 
        name: 'Wikimedia', 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '📚'
      }
    };
    return configs[source] || { 
      name: source, 
      color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      icon: '🖼️'
    };
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'educational-image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {images.map((image, index) => {
          const sourceConfig = getSourceConfig(image.source);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/50 border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div 
                className="relative cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.thumbnail_url || image.image_url}
                  alt={image.alt_text}
                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-soft"
                  >
                    <ZoomIn className="w-5 h-5 text-neutral-700" />
                  </motion.div>
                </div>

                {/* Source Badge */}
                <div className="absolute top-3 left-3">
                  <div className={`px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${sourceConfig.color}`}>
                    <span className="mr-1">{sourceConfig.icon}</span>
                    {sourceConfig.name}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                  {image.caption}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(image.image_url, '_blank')}
                      className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-600" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDownload(image.image_url, `${image.source}-educational-image.jpg`)}
                      className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      title="Download image"
                    >
                      <Download className="w-4 h-4 text-neutral-600" />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleImageClick(image)}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-5xl max-h-full bg-white rounded-3xl overflow-hidden shadow-large"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 text-sm font-medium rounded-full border ${getSourceConfig(selectedImage.source).color}`}>
                    <span className="mr-2">{getSourceConfig(selectedImage.source).icon}</span>
                    {getSourceConfig(selectedImage.source).name}
                  </div>
                  <span className="text-sm text-neutral-500">Educational Content</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(selectedImage.image_url, `${selectedImage.source}-educational-image.jpg`)}
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-neutral-600" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </motion.button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.alt_text}
                    className="w-full h-auto max-h-96 object-contain rounded-2xl shadow-soft"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Description</h3>
                    <p className="text-neutral-600 leading-relaxed">{selectedImage.caption}</p>
                  </div>
                  
                  {selectedImage.metadata && selectedImage.metadata.photographer && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-1">Credit</h4>
                      <p className="text-sm text-neutral-500">
                        Photo by {selectedImage.metadata.photographer}
                      </p>
                    </div>
                  )}
                  
                  {selectedImage.metadata && selectedImage.metadata.keywords && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.metadata.keywords.slice(0, 6).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
