import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Package, X } from 'lucide-react';
import { useProducts } from '../inventory/ProductContext';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, updateProduct, addProduct } = useProducts();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Office Supplies',
    stock: '',
    price: ''
  });

  const isEditMode = id && id !== 'new';

  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    setFetchingProduct(true);
    try {
      const localProduct = products.find(p => p.id === id);
      
      if (localProduct) {
        setFormData({
          name: localProduct.name,
          category: localProduct.category,
          stock: localProduct.stock,
          price: localProduct.price
        });
      } else {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          setFormData({
            name: productData.name,
            category: productData.category,
            stock: productData.stock,
            price: productData.price
          });
        } else {
          alert('Product not found');
          navigate('/inventory');
        }
      }
    } catch (error) {
      console.error('Error fetching product: ', error);
      alert('Error loading product data');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!formData.stock) {
      alert('Please enter stock quantity');
      return;
    }
    if (!formData.price) {
      alert('Please enter price');
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price)
      };

      if (isEditMode) {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, productData);
        updateProduct({ ...productData, id });
        alert('Product updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'products'), productData);
        addProduct({ ...productData, id: docRef.id });
        alert('Product added successfully!');
      }
      
      navigate('/inventory');
    } catch (error) {
      console.error('Error saving product: ', error);
      alert(`Error ${isEditMode ? 'updating' : 'adding'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/inventory')}
            className="p-2 rounded-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft size={24} style={{ color: '#3F0E40' }} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ 
              fontFamily: "'DM Sans', sans-serif",
              color: '#3F0E40'
            }}>
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-500">
              {isEditMode ? 'Update product information' : 'Fill in the details to add a new product'}
            </p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="hidden md:block"
        >
          <div className="p-3 rounded-full bg-gray-100">
            <Package size={48} style={{ color: '#3F0E40' }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl shadow-lg overflow-hidden border border-gray-100 bg-white"
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
                autoFocus
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
              >
                <option value="Office Supplies">Office Supplies</option>
                <option value="Offices Supplies">Offices Supplies</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            {/* Stock and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">Number of units available</p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">Price per unit in Naira</p>
              </div>
            </div>

            {/* Preview Section */}
            {formData.name && formData.stock && formData.price && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200"
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#3F0E40' }}>Product Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800">{formData.name}</span></p>
                  <p><span className="font-medium text-gray-600">Category:</span> <span className="text-gray-800">{formData.category}</span></p>
                  <p><span className="font-medium text-gray-600">Stock:</span> <span className="font-bold" style={{ color: '#059669' }}>{formData.stock} units</span></p>
                  <p><span className="font-medium text-gray-600">Price:</span> <span className="font-bold" style={{ color: '#CA8A04' }}>₦{parseFloat(formData.price).toFixed(2)}</span></p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/inventory')}
                className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ background: '#3F0E40' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isEditMode ? 'Saving...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isEditMode ? 'Save Changes' : 'Add Product'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;