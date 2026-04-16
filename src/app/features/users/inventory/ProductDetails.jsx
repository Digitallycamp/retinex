import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, TrendingUp, Clock, DollarSign, Tag, Calendar } from 'lucide-react';

const ProductDetails = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' };
    if (stock < 30) return { label: 'Critical', color: '#EA580C', bg: '#FFEDD5' };
    if (stock < 60) return { label: 'Low Stock', color: '#CA8A04', bg: '#FEF3C7' };
    if (stock < 150) return { label: 'In Stock', color: '#059669', bg: '#D1FAE5' };
    return { label: 'Well Stocked', color: '#3B82F6', bg: '#DBEAFE' };
  };

  const status = getStockStatus(product.stock);
  const stockPercentage = Math.min((product.stock / 300) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-32 rounded-t-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #3F0E40, #CA8A04)' }}>
              <div className="absolute inset-0 bg-black/20"></div>
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 text-white hover:bg-white/30">
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6">
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="text-white/80 text-sm">{product.category}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(63,14,64,0.05), rgba(202,138,4,0.05))' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={18} style={{ color: '#CA8A04' }} />
                    <span className="text-xs text-gray-500">Current Stock</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: status.color }}>{product.stock} units</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(63,14,64,0.05), rgba(202,138,4,0.05))' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} style={{ color: '#CA8A04' }} />
                    <span className="text-xs text-gray-500">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">₱{product.price}</p>
                </div>
              </div>

              {/* Stock Status Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Stock Level</span>
                  <span className="text-sm font-medium" style={{ color: status.color }}>{status.label}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stockPercentage}%` }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${status.color}, #CA8A04)` }}
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Product ID</span>
                  <span className="text-sm font-mono text-gray-700">{product.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium text-gray-700">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="text-sm font-bold text-green-600">₱{(product.stock * product.price).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2 text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3F0E40, #CA8A04)' }}
                >
                  <TrendingUp size={18} />
                  Update Stock
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetails;