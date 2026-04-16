import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Building, Phone, Mail, MapPin, User, Package } from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Office Supplies',
    productsSupplied: '',
    paymentTerms: 'Net 30',
    status: 'Active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName.trim()) {
      alert('Please enter company name');
      return;
    }
    if (!formData.contactPerson.trim()) {
      alert('Please enter contact person name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter email address');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return;
    }

    setLoading(true);
    
    try {
      const supplierData = {
        ...formData,
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        productsSupplied: formData.productsSupplied,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
      
      alert('Supplier added successfully!');
      navigate('/suppliers');
    } catch (error) {
      console.error('Error adding supplier: ', error);
      alert('Error adding supplier to Firebase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ 
      background: 'radial-gradient(circle at 0% 0%, rgba(63,14,64,0.08) 0%, rgba(202,138,4,0.05) 50%, rgba(6,78,59,0.08) 100%)'
    }}>
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
              onClick={() => navigate('/suppliers')}
              className="p-2 rounded-lg transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(63,14,64,0.1), rgba(202,138,4,0.1))' }}
            >
              <ArrowLeft size={24} style={{ color: '#3F0E40' }} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ 
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #3F0E40 0%, #CA8A04 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Add New Supplier
              </h1>
              <p className="text-gray-600">
                Fill in the details to add a new supplier to your inventory
              </p>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="hidden md:block"
          >
            <div className="p-3 rounded-full" style={{ 
              background: 'linear-gradient(135deg, rgba(63,14,64,0.1), rgba(202,138,4,0.1))'
            }}>
              <Truck size={48} style={{ color: '#CA8A04' }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.95) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Company Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="pb-4 border-b border-gray-200"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                  <Building size={20} />
                  Company Information
                </h2>
                <p className="text-xs text-gray-500 mt-1">Basic information about the supplier company</p>
              </motion.div>

              {/* Company Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  autoFocus
                />
              </motion.div>

              {/* Contact Person and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  >
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Raw Materials">Raw Materials</option>
                  </select>
                </motion.div>
              </div>

              {/* Contact Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="pt-4 pb-4 border-b border-gray-200"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                  <Mail size={20} />
                  Contact Information
                </h2>
                <p className="text-xs text-gray-500 mt-1">How to reach the supplier</p>
              </motion.div>

              {/* Email and Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  />
                </motion.div>
              </div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50 resize-none"
                />
              </motion.div>

              {/* Additional Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="pt-4 pb-4 border-b border-gray-200"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                  <Package size={20} />
                  Additional Information
                </h2>
                <p className="text-xs text-gray-500 mt-1">Extra details about the supplier</p>
              </motion.div>

              {/* Products Supplied and Payment Terms Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Products Supplied
                  </label>
                  <textarea
                    name="productsSupplied"
                    value={formData.productsSupplied}
                    onChange={handleInputChange}
                    placeholder="List products this supplier provides"
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50 resize-none"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                    Payment Terms
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white/50"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </motion.div>
              </div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={handleInputChange}
                      className="text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={handleInputChange}
                      className="text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </motion.div>

              {/* Preview Section */}
              {(formData.companyName || formData.contactPerson || formData.email) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 p-5 rounded-xl shadow-md"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(6,78,59,0.05) 0%, rgba(202,138,4,0.05) 100%)',
                    border: '1px solid rgba(202,138,4,0.2)'
                  }}
                >
                  <h3 className="text-sm font-semibold mb-3" style={{ 
                    background: 'linear-gradient(135deg, #3F0E40, #CA8A04)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Supplier Preview</h3>
                  <div className="space-y-2 text-sm">
                    {formData.companyName && (
                      <p><span className="font-medium text-gray-600">Company:</span> <span className="text-gray-800">{formData.companyName}</span></p>
                    )}
                    {formData.contactPerson && (
                      <p><span className="font-medium text-gray-600">Contact:</span> <span className="text-gray-800">{formData.contactPerson}</span></p>
                    )}
                    {formData.email && (
                      <p><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{formData.email}</span></p>
                    )}
                    {formData.phone && (
                      <p><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{formData.phone}</span></p>
                    )}
                    <p><span className="font-medium text-gray-600">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${formData.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {formData.status}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="flex gap-4 pt-6 border-t border-gray-200"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/suppliers')}
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
                  style={{ 
                    background: 'linear-gradient(135deg, #3F0E40 0%, #CA8A04 100%)',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Add Supplier
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6 p-5 rounded-xl shadow-md"
          style={{ 
            background: 'linear-gradient(135deg, rgba(63,14,64,0.05) 0%, rgba(202,138,4,0.05) 100%)',
            border: '1px solid rgba(63,14,64,0.1)'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5">💡</div>
            <div>
              <p className="font-semibold mb-2" style={{ color: '#3F0E40' }}>Supplier Management Tips:</p>
              <ul className="space-y-1 text-sm" style={{ color: '#4B5563' }}>
                <li className="flex items-center gap-2">✓ Always verify supplier credentials before adding</li>
                <li className="flex items-center gap-2">✓ Keep contact information up to date</li>
                <li className="flex items-center gap-2">✓ Track supplier performance regularly</li>
                <li className="flex items-center gap-2">✓ Maintain backup suppliers for critical items</li>
                <li className="flex items-center gap-2">✓ All fields marked with <span className="text-red-500 font-semibold">*</span> are required</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddSupplier;