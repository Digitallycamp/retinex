import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Building, Phone, Mail, MapPin, User, Banknote, FileText, CreditCard } from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankName: '',
    additionalNotes: ''
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
    if (!formData.supplierName.trim()) {
      alert('Please enter supplier name');
      return;
    }
    if (!formData.companyName.trim()) {
      alert('Please enter company name');
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
        supplierName: formData.supplierName.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        bankAccountHolder: formData.bankAccountHolder.trim(),
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankName: formData.bankName.trim(),
        additionalNotes: formData.additionalNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
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
            className="p-2 rounded-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft size={24} style={{ color: '#3F0E40' }} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ 
              fontFamily: "'DM Sans', sans-serif",
              color: '#3F0E40'
            }}>
              Add New Supplier
            </h1>
            <p className="text-gray-500">
              Fill in the details to add a new supplier
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
            <Truck size={48} style={{ color: '#3F0E40' }} />
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
            {/* Basic Information Section */}
            <div className="pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                <User size={20} />
                Basic Information
              </h2>
              <p className="text-xs text-gray-500 mt-1">Supplier contact and company details</p>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                autoFocus
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company Inc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
              />
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="supplier@company.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 123 456 7890"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full address..."
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white resize-none"
              />
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                <Banknote size={20} />
                Bank Details
              </h2>
              <p className="text-xs text-gray-500 mt-1">Payment and banking information</p>
            </div>

            {/* Bank Account Holder */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Account Holder Name
              </label>
              <input
                type="text"
                name="bankAccountHolder"
                value={formData.bankAccountHolder}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
              />
            </div>

            {/* Account Number and Bank Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Account Number
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Bank Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                />
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="pt-4 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#3F0E40' }}>
                <FileText size={20} />
                Additional Notes
              </h2>
              <p className="text-xs text-gray-500 mt-1">Any extra information about the supplier</p>
            </div>

            {/* Additional Notes */}
            <div>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Additional notes..."
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white resize-none"
              />
            </div>

            {/* Preview Section */}
            {(formData.supplierName || formData.companyName || formData.email) && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200"
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#3F0E40' }}>Supplier Preview</h3>
                <div className="space-y-2 text-sm">
                  {formData.supplierName && (
                    <p><span className="font-medium text-gray-600">Supplier:</span> <span className="text-gray-800">{formData.supplierName}</span></p>
                  )}
                  {formData.companyName && (
                    <p><span className="font-medium text-gray-600">Company:</span> <span className="text-gray-800">{formData.companyName}</span></p>
                  )}
                  {formData.email && (
                    <p><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{formData.email}</span></p>
                  )}
                  {formData.phone && (
                    <p><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{formData.phone}</span></p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
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
                style={{ background: '#3F0E40' }}
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
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddSupplier;