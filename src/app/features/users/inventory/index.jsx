import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Edit2, Trash2, Package, Filter, ChevronDown, Plus } from 'lucide-react';
import { useProducts } from './ProductContext';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Header from '../components/Header'; 

const FunctionalInventory = () => {
  // Use products from context
  const { products, updateProduct, deleteProduct, addProduct } = useProducts();
  
  // 2. State for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // 3. State for Edit/Delete functionality
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', stock: '', price: 50 });
  const [addForm, setAddForm] = useState({ name: '', category: 'Office Supplies', stock: '', price: 50 });
  
  // State for loading buttons
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Logic: Filter and Search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory, products]);

  // Helper for status styling
  const getStatus = (stock) => {
    if (stock > 100) {
      return { label: 'In Stock', color: '#059669', bg: '#D1FAE5', width: '75%' };
    } else if (stock >= 60 && stock <= 100) {
      return { label: 'Medium Stock', color: '#CA8A04', bg: '#FEF3C7', width: '50%' };
    }
    return { label: 'Low Stock', color: '#DC2626', bg: '#FEE2E2', width: '25%' };
  };

  // Edit functionality with Firebase
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price || 50
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsEditing(true);
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      const updatedProduct = {
        ...editingProduct,
        ...editForm,
        stock: parseInt(editForm.stock),
        price: parseFloat(editForm.price)
      };
      
      await updateDoc(productRef, {
        name: updatedProduct.name,
        category: updatedProduct.category,
        stock: updatedProduct.stock,
        price: updatedProduct.price
      });
      
      updateProduct(updatedProduct);
      setShowEditModal(false);
      setEditingProduct(null);
      setEditForm({ name: '', category: '', stock: '', price: 50 });
      alert('Product updated successfully in Firebase!');
    } catch (error) {
      console.error('Error updating product: ', error);
      alert('Error updating product in Firebase. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  // Add functionality with Firebase
  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.stock) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsAdding(true);
    try {
      const newProduct = {
        name: addForm.name,
        category: addForm.category,
        stock: parseInt(addForm.stock),
        price: parseFloat(addForm.price)
      };
      
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      addProduct({ ...newProduct, id: docRef.id });
      
      setShowAddModal(false);
      setAddForm({ name: '', category: 'Office Supplies', stock: '', price: 50 });
      alert('Product added successfully to Firebase!');
    } catch (error) {
      console.error('Error adding product: ', error);
      alert('Error adding product to Firebase. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete functionality with Firebase
  const handleDelete = async (productId) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'products', productId));
      deleteProduct(productId);
      setShowDeleteConfirm(null);
      alert('Product deleted successfully from Firebase!');
    } catch (error) {
      console.error('Error deleting product: ', error);
      alert('Error deleting product from Firebase. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <Header 
                      title="Inventory Management"
                      description="Manage and track your product inventory"
                      showDate={true}
                    />
        

        {/* Functional Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-gray-100 bg-white">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none bg-gray-50 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 bg-white outline-none cursor-pointer appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-6 text-sm">
              <span className="text-gray-600">Total Products: <span className="font-bold" style={{ color: '#3F0E40' }}>{filteredProducts.length}</span></span>
              <span className="text-gray-600">Categories: <span className="font-bold" style={{ color: '#CA8A04' }}>{categories.length - 1}</span></span>
            </div>
          </div>

          {/* Empty State */}
          <AnimatePresence>
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-20 text-center text-gray-500"
              >
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-600">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filter</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile View */}
          <div className="md:hidden grid grid-cols-1 gap-4 p-5">
            <AnimatePresence>
              {filteredProducts.map((product, index) => {
                const status = getStatus(product.stock);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-100 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{product.category}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold`} style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">Stock: {product.stock} units</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300`} style={{ width: status.width, backgroundColor: status.color }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600">Price:</span>
                      <span className="text-base font-bold" style={{ color: '#CA8A04' }}>₦{product.price}</span>
                    </div>
                    <div className="flex gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEdit(product)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        <Edit2 size={16} /> Edit
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(product.id)}
                        className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                        style={{ background: '#3F0E40' }}
                      >
                        <Trash2 size={16} /> Delete
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Desktop View */}
          <div className={`hidden md:block overflow-x-auto ${filteredProducts.length === 0 ? 'hidden' : ''}`}>
            <table className="w-full text-left">
              <thead>
                <tr  className="text-#3F0E40 border border-black-200 bg-white hover:bg-gray-50">
                  <th className="p-4 font-bold uppercase text-xs tracking-wider rounded-tl-lg">Product Name</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider">Category</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider text-center">Current Stock</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider text-center">Price</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider">Stock Status</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, idx) => {
                  const status = getStatus(product.stock);
                  return (
                    <motion.tr 
                      key={product.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      
                    >
                      <td className="p-4 font-semibold text-gray-800">{product.name}</td>
                      <td className="p-4 text-gray-600">{product.category}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: status.bg, color: status.color }}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-base font-bold" style={{ color: '#CA8A04' }}>₦{product.price}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300`} style={{ width: status.width, backgroundColor: status.color }}></div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold`} style={{ backgroundColor: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(product)}
                            className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50"
                          >
                            <Edit2 size={14} /> Edit
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                            style={{ background: '#3F0E40' }}
                          >
                            <Trash2 size={14} /> Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3F0E40' }}>Edit Product</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                  >
                    <option value="Offices Supplies">Offices Supplies</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#CA8A04' }}
                  >
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3F0E40' }}>Add New Product</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                  >
                    <option value="Offices Supplies">Offices Supplies</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({...addForm, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                    placeholder="Enter stock quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-#3F0E40 focus:border-#3F0E40 outline-none"
                    placeholder="Enter price"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    disabled={isAdding}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#3F0E40' }}
                  >
                    {isAdding ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Product?</h2>
                <p className="text-gray-600 mb-6">This action cannot be undone. This product will be permanently removed from inventory.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#DC2626' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FunctionalInventory;