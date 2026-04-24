import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Plus, X, User, Building2, Mail, Phone, MapPin, 
    CreditCard, StickyNote, Eye, ChevronLeft, ChevronRight,
    Package, Users, Store, AlertCircle, CheckCircle,
    PlusCircle
} from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import Header from '../components/Header';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const itemsPerPage = 8;

    // Form states
    const [formData, setFormData] = useState({
        supplierName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        notes: ''
    });

    // Fetch suppliers from Firebase
    useEffect(() => {
        let isMounted = true;
        
        const fetchSuppliers = async () => {
            try {
                setIsLoading(true);
                const querySnapshot = await getDocs(collection(db, "suppliers"));
                
                if (isMounted) {
                    const suppliersData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setSuppliers(suppliersData);
                }
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                showNotification("Failed to load suppliers", "error");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchSuppliers();

        return () => {
            isMounted = false;
        };
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Filter suppliers based on search
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => 
            supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    
    const paginatedSuppliers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSuppliers.slice(startIndex, endIndex);
    }, [filteredSuppliers, currentPage]);

    // Reset to first page when search changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        document.querySelector('.suppliers-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openEditModal = (supplier) => {
        setSelectedSupplier(supplier);
        setFormData({
            supplierName: supplier.supplierName || '',
            companyName: supplier.companyName || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            accountHolderName: supplier.accountHolderName || '',
            accountNumber: supplier.accountNumber || '',
            bankName: supplier.bankName || '',
            notes: supplier.notes || ''
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({
            supplierName: '',
            companyName: '',
            email: '',
            phone: '',
            address: '',
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            notes: ''
        });
        setIsAddModalOpen(true);
    };

    const handleSaveSupplier = async () => {
        try {
            if (!formData.supplierName || !formData.companyName || !formData.email || !formData.phone) {
                showNotification("Please fill in all required fields", "error");
                return;
            }

            if (selectedSupplier) {
                // Update existing supplier
                const supplierRef = doc(db, "suppliers", selectedSupplier.id);
                await updateDoc(supplierRef, formData);
                
                setSuppliers(prev => 
                    prev.map(s => s.id === selectedSupplier.id 
                        ? { ...s, ...formData } 
                        : s
                    )
                );
                showNotification("Supplier updated successfully", "success");
            } else {
                // Add new supplier
                const docRef = await addDoc(collection(db, "suppliers"), formData);
                setSuppliers(prev => [{ id: docRef.id, ...formData }, ...prev]);
                showNotification("Supplier added successfully", "success");
            }
            
            setIsModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedSupplier(null);
        } catch (error) {
            console.error("Error saving supplier:", error);
            showNotification("Failed to save supplier", "error");
        }
    };

    const startItem = filteredSuppliers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredSuppliers.length);

    const totalSuppliers = filteredSuppliers.length;
    const uniqueCompanies = [...new Set(filteredSuppliers.map(s => s.companyName))].length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0E40] mx-auto mb-4"></div>
                    <p className="text-[#3F0E40] font-medium">Loading suppliers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full">
                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300 ${
                        notification.type === 'success' ? 'bg-green-900' : 'bg-red-500'
                    } text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2`}>
                        {notification.type === 'success' ? 
                            <CheckCircle size={18} /> : 
                            <AlertCircle size={18} />
                        }
                        <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                )}

                {/* Page Header */}
                 <Header 
                    title="Suppliers"
                    description="Manage your supplier relationships and information"
                    showSearch={true}
                    showButton={true}
                    searchValue={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    searchPlaceholder="Search by name, company or location..."
                    buttonText="Add Supplier"
                    ButtonIcon={Plus}
                    onButtonClick={openAddModal}
                />


                {/* Table Section */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden suppliers-table-container">
                    <div className="p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-gradient-to-br from-[#3F0E40] to-green-900 p-2 rounded-lg">
                                    <Store size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#3F0E40] text-base sm:text-lg">All Suppliers</h2>
                                    <p className="text-xs text-slate-500">
                                        {filteredSuppliers.length} suppliers found
                                        {filteredSuppliers.length > 0 && ` • Showing ${startItem}-${endItem}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-gradient-to-r from-[#3F0E40]/5 to-transparent text-slate-600 text-xs uppercase tracking-wider border-b-2 border-b-[#3F0E40]/10">
                                <tr>
                                    <th className="p-4 font-bold">Supplier Name</th>
                                    <th className="p-4 font-bold">Company Name</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Phone</th>
                                    <th className="p-4 font-bold text-center">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedSuppliers.length > 0 ? (
                                    paginatedSuppliers.map((supplier, index) => (
                                        <tr 
                                            key={supplier.id} 
                                            className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-[#3F0E40]/5 hover:to-transparent transition-all duration-200"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3F0E40]/10 to-green-900/10 flex items-center justify-center flex-shrink-0">
                                                        <User size={14} className="text-[#3F0E40]" />
                                                    </div>
                                                    <span className="font-medium text-[#3F0E40]">{supplier.supplierName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-green-900 flex-shrink-0" />
                                                    <span className="text-slate-700">{supplier.companyName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                                                    <span className="text-slate-600 truncate max-w-[200px]">{supplier.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                                                    <span className="text-slate-600">{supplier.phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => openEditModal(supplier)}
                                                    className="group relative inline-flex items-center gap-2 text-[#8D5D93] font-bold hover:text-[#3F0E40] transition-all duration-200 mx-auto"
                                                >
                                                    <span className="absolute inset-0 bg-yellow-600/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-10"></span>
                                                    <Eye size={16} className="group-hover:scale-110 transition-transform" /> 
                                                    <span className="text-sm">View/Edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full mb-4">
                                                    <Search size={32} className="text-[#3F0E40]/40" />
                                                </div>
                                                <p className="font-bold text-[#3F0E40] text-lg mb-1">No suppliers found</p>
                                                <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {paginatedSuppliers.length > 0 ? (
                            <div className="divide-y">
                                {paginatedSuppliers.map((supplier) => (
                                    <div key={supplier.id} className="p-4 space-y-3 hover:bg-gradient-to-r hover:from-[#3F0E40]/5 hover:to-transparent transition-all duration-200">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3F0E40]/10 to-green-900/10 flex items-center justify-center flex-shrink-0">
                                                    <User size={16} className="text-[#3F0E40]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-[#3F0E40] truncate">{supplier.supplierName}</h3>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Building2 size={12} className="text-green-900 flex-shrink-0" />
                                                        <span className="text-sm text-slate-600 truncate">{supplier.companyName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 pl-13">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} className="text-slate-400 flex-shrink-0" />
                                                <span className="text-sm text-slate-600 truncate">{supplier.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} className="text-slate-400 flex-shrink-0" />
                                                <span className="text-sm text-slate-600">{supplier.phone}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end pt-2">
                                            <button 
                                                onClick={() => openEditModal(supplier)}
                                                className="group relative inline-flex items-center gap-1.5 text-[#8D5D93] font-bold hover:text-[#3F0E40] transition-all duration-200"
                                            >
                                                <Eye size={14} className="group-hover:scale-110 transition-transform" /> 
                                                <span className="text-xs">View/Edit Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 sm:p-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full mb-4">
                                        <Search size={32} className="text-[#3F0E40]/40" />
                                    </div>
                                    <p className="font-bold text-[#3F0E40] text-lg mb-1">No suppliers found</p>
                                    <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredSuppliers.length > 0 && totalPages > 1 && (
                        <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-xs sm:text-sm text-slate-500">
                                    Showing <span className="font-medium text-[#3F0E40]">{startItem}</span> to{' '}
                                    <span className="font-medium text-[#3F0E40]">{endItem}</span> of{' '}
                                    <span className="font-medium text-[#3F0E40]">{filteredSuppliers.length}</span> suppliers
                                </div>
                                
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            currentPage === 1
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-[#3F0E40] hover:bg-[#3F0E40]/5 hover:text-[#3F0E40]'
                                        }`}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="hidden sm:flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">•••</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        currentPage === page
                                                            ? 'bg-gradient-to-r from-[#3F0E40] to-green-900 text-white shadow-md'
                                                            : 'text-[#3F0E40] hover:bg-[#3F0E40]/5'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <div className="sm:hidden px-3 py-1.5 bg-[#3F0E40]/5 rounded-lg">
                                        <span className="text-sm font-medium text-[#3F0E40]">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            currentPage === totalPages
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-[#3F0E40] hover:bg-[#3F0E40]/5 hover:text-[#3F0E40]'
                                        }`}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Supplier Form Modal (Add/Edit) */}
            {(isModalOpen || isAddModalOpen) && (
                <div className="fixed inset-0 bg-[#3F0E40]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 border-2 border-[#3F0E40]/10 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#8D5D93] p-5 sm:p-6 text-white relative overflow-hidden">
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                                        {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                                    </h3>
                                    <p className="text-xs opacity-90">
                                        {selectedSupplier ? 'Update supplier information' : 'Enter supplier details below'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsAddModalOpen(false);
                                        setSelectedSupplier(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-200 flex-shrink-0"
                                >
                                    <X size={18}/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-5 sm:p-6">
                            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                {/* Basic Information Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-[#3F0E40] uppercase tracking-wider flex items-center gap-2">
                                        <User size={16} className="text-yellow-600" />
                                        Basic Information
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Supplier Name *
                                            </label>
                                            <input 
                                                name="supplierName"
                                                value={formData.supplierName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Company Name *
                                            </label>
                                            <input 
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                placeholder="Company Inc."
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                    placeholder="supplier@company.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Phone *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                    placeholder="+234 123 456 7890"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-4 text-slate-400" size={16} />
                                            <textarea 
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all resize-none"
                                                placeholder="Full address..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details Section */}
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-[#3F0E40] uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard size={16} className="text-yellow-600" />
                                        Bank Details
                                    </h4>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                            Account Holder Name
                                        </label>
                                        <input 
                                            name="accountHolderName"
                                            value={formData.accountHolderName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Account Number
                                            </label>
                                            <input 
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                placeholder="0123456789"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                                                Bank Name
                                            </label>
                                            <input 
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                                placeholder="Bank Name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-[#3F0E40] uppercase tracking-wider flex items-center gap-2">
                                        <StickyNote size={16} className="text-yellow-600" />
                                        Additional Notes
                                    </h4>
                                    
                                    <div>
                                        <textarea 
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all resize-none"
                                            placeholder="Special instructions, preferred contact methods, warnings..."
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setIsAddModalOpen(false);
                                            setSelectedSupplier(null);
                                        }}
                                        className="flex-1 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-[#3F0E40] border-2 border-[#3F0E40]/20 hover:bg-[#3F0E40]/5 transition-all duration-200 text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveSupplier}
                                        className="flex-1 py-3 sm:py-3.5 px-4 bg-[#3F0E40] text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                                    >
                                        {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;