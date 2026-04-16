import React, { useState } from 'react';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Globe, Building2, User, Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react';

const FullSupplierForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // General Information
    supplierName: '',
    displayName: '',
    supplierCode: `SUP-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generated example
    supplierGroup: 'General',
    registrationNumber: '',
    website: '',
    logoUrl: '',
    // Contact Information
    primaryContactName: '',
    email: '',
    phone: '',
    fax: '',
    // Address Details
    streetAddress: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Nigeria',
    addressType: 'Billing'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      alert("Supplier registered successfully!");
      // Reset form or redirect logic here
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Failed to save supplier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Register New Supplier</h2>
          <p className="text-gray-500">Enter general and contact details for the vendor instance.</p>
        </div>

        <div className="p-8 space-y-10">
          
          {/* Section 1: General Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Building2 size={20} />
              <h3 className="font-bold uppercase tracking-wider text-sm">General Supplier Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier/Company Name *</label>
                <input required name="supplierName" value={formData.supplierName} onChange={handleChange} type="text" placeholder="Legal entity name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name / Alias</label>
                <input name="displayName" value={formData.displayName} onChange={handleChange} type="text" placeholder="Friendly name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier ID/Code</label>
                <input name="supplierCode" value={formData.supplierCode} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" readOnly />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier Group/Type</label>
                <select name="supplierGroup" value={formData.supplierGroup} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>General</option>
                  <option>Manufacturer</option>
                  <option>Services</option>
                  <option>Wholesaler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registration/VAT Number</label>
                <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} type="text" placeholder="TIN / ABN / VAT" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input name="website" value={formData.website} onChange={handleChange} type="url" placeholder="https://example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Logo URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input name="logoUrl" value={formData.logoUrl} onChange={handleChange} type="text" placeholder="Image link" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2: Contact Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <User size={20} />
              <h3 className="font-bold uppercase tracking-wider text-sm">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Contact Name</label>
                <input name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} type="text" placeholder="Account Manager Name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="orders@vendor.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+63 000 0000" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fax (Optional)</label>
                <input name="fax" value={formData.fax} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3: Address Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <MapPin size={20} />
              <h3 className="font-bold uppercase tracking-wider text-sm">Address Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <input name="streetAddress" value={formData.streetAddress} onChange={handleChange} type="text" placeholder="Unit / Street / Brgy" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address Type</label>
                <select name="addressType" value={formData.addressType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Billing</option>
                  <option>Shipping</option>
                  <option>Remittance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State/Province</label>
                <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Postcode</label>
                <input name="postcode" value={formData.postcode} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-all">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Supplier...' : 'Add Supplier'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FullSupplierForm;