import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Building, Phone, Mail, MapPin, User, Banknote, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      supplierName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      bankAccountHolder: '',
      bankAccountNumber: '',
      bankName: '',
      additionalNotes: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const supplierData = {
        ...data,
        supplierName: data.supplierName.trim(),
        companyName: data.companyName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        bankAccountHolder: data.bankAccountHolder?.trim() || '',
        bankAccountNumber: data.bankAccountNumber?.trim() || '',
        bankName: data.bankName?.trim() || '',
        additionalNotes: data.additionalNotes?.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
      
      // alert('Supplier added successfully!');
      reset();
      navigate('/suppliers');
    } catch (error) {
      console.error('Error adding supplier: ', error);
      // alert('Error adding supplier to Firebase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Watch form values for preview
  const watchedValues = watch();

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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
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
                {...register('supplierName', { 
                  required: 'Supplier name is required',
                  minLength: { value: 2, message: 'Supplier name must be at least 2 characters' }
                })}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white ${
                  errors.supplierName ? 'border-red-500' : 'border-gray-200'
                }`}
                autoFocus
              />
              {errors.supplierName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.supplierName.message}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('companyName', { 
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                })}
                placeholder="Company Inc."
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white ${
                  errors.companyName ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.companyName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: 'Invalid email address' 
                    }
                  })}
                  placeholder="supplier@company.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                  })}
                  placeholder="+234 123 456 7890"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                Address
              </label>
              <textarea
                {...register('address')}
                placeholder="Full address..."
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white resize-none"
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
                {...register('bankAccountHolder')}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
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
                  {...register('bankAccountNumber')}
                  placeholder="0123456789"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3F0E40' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  {...register('bankName')}
                  placeholder="Bank Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white"
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
                {...register('additionalNotes')}
                placeholder="Additional notes..."
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:#3F0E40 focus:#3F0E40 outline-none transition-all bg-white resize-none"
              />
            </div>

            {/* Preview Section */}
            {(watchedValues.supplierName || watchedValues.companyName || watchedValues.email) && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200"
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#3F0E40' }}>Supplier Preview</h3>
                <div className="space-y-2 text-sm">
                  {watchedValues.supplierName && (
                    <p><span className="font-medium text-gray-600">Supplier:</span> <span className="text-gray-800">{watchedValues.supplierName}</span></p>
                  )}
                  {watchedValues.companyName && (
                    <p><span className="font-medium text-gray-600">Company:</span> <span className="text-gray-800">{watchedValues.companyName}</span></p>
                  )}
                  {watchedValues.email && (
                    <p><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{watchedValues.email}</span></p>
                  )}
                  {watchedValues.phone && (
                    <p><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{watchedValues.phone}</span></p>
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