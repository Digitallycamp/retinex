import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../core/firebase/firebase';
import { collection, getDocs, doc, updateDoc, increment  } from "firebase/firestore";
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Package, TrendingUp, Calendar, Filter, User, Receipt, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useOrders } from '../../../../context/OrderContext'; 


const CreateOrder = () => {
    const { confirmOrder } = useOrders(); // Hook to add to the Sales page
    const [products, setProducts] = useState([]);

    useEffect(() => {
    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProducts(data);
    };

    fetchProducts();
}, []);

    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [orderId] = useState(`TR-${Math.floor(100000000 + Math.random() * 900000000)}`);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const itemsPerPage = 4;

    const categories = [
        "All",
        "Office Supplies",
        "Perishables",
        "Electronics",
        "Furniture",
        "Cleaning",
        "Pantry & Kitchen", 
        "Packaging"
    ];

    // Show first 7 categories as pills, rest in dropdown
    const MAX_VISIBLE_CATEGORIES = 7;
    const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
    const overflowCategories = categories.slice(MAX_VISIBLE_CATEGORIES);

    const addToCart = (product) => {
        // Check if there's enough stock
        const existingItem = cart.find(item => item.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        
        if (currentQty < product.stock) {
            setCart(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                return [...prev, { ...product, quantity: 1 }];
            });
        } else {
            alert(`Cannot add more ${product.name}. Only ${product.stock} units available in stock.`);
        }
    };

    const updateQuantity = async (productId, change) => {
        // 1. Update Local State (UI)
        setCart(prev => {
        return prev.map(item => {
            if (item.id === productId) {
            const newQuantity = item.quantity + change;
            const product = products.find(p => p.id === productId);
            if (newQuantity > product.stock) {
                alert(`Cannot exceed available stock of ${product.stock} units.`);
                return item;
            }
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0);
        });

        // 2. Update Firebase (Database)
        const productRef = doc(db, "products", productId);
        try {
        // Note: If 'change' is -1, it subtracts 1 from the DB
        await updateDoc(productRef, {
            stock: increment(change)
        });
        } catch (error) {
        console.error("Error updating DB:", error);
        }
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const handleConfirmPurchase = () => {
        const now = new Date();
        const newOrder = {
            orderId: orderId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: customerName.trim() || "Guest",
            qty: cart.reduce((sum, item) => sum + item.quantity, 0),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            details: [...cart] // For the invoice modal later
        };

        // Reduce stock quantities
        setProducts(prevProducts => 
            prevProducts.map(product => {
                const cartItem = cart.find(item => item.id === product.id);
                if (cartItem) {
                    return {
                        ...product,
                        stock: product.stock - cartItem.quantity
                    };
                }
                return product;
            })
        );

        // logic to add to SalesOrders:
        confirmOrder(newOrder); 
        console.log("Order Added to Sales:", newOrder);
        setIsModalOpen(false);
        setCart([]);
        setCustomerName("");
        
    };

    const filteredProducts = products.filter(p => 
        (categoryFilter === "All" || p.category === categoryFilter) && 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smooth scroll to top of products section
        document.querySelector('.products-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Give page numbers to display
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

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const startItem = filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-full">
                {/* Page Header */}
                <div className="relative overflow-hidden rounded-xl border sm:rounded-2xl  p-4 sm:p-6 lg:p-8 shadow-xl">
                    
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-1">Create New Order</h1>
                            <p className="text-black/80 text-xs sm:text-sm lg:text-base">Add products and generate transaction receipt</p>
                        </div>
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="bg-black/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-black/20 flex-1 lg:flex-none">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#3F0E40] flex-shrink-0" />
                                    <span className="text-black text-xs sm:text-sm font-medium truncate">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full">
                    {/* Products Section */}
                    <div className="flex-1 min-w-0 space-y-4 w-full">
                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#3F0E40]/40" size={16} />
                                    <input 
                                        className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F0E40] focus:bg-white transition-all"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-[#3F0E40]/60 flex-shrink-0" />
                                    <select 
                                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 outline-none cursor-pointer bg-slate-50 hover:border-[#3F0E40] focus:border-[#3F0E40] transition-colors flex-1 sm:flex-none"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category Pills with Overflow Handling */}
                        <div className="flex gap-2 flex-wrap items-center">
                            {visibleCategories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                                        categoryFilter === cat 
                                            ? 'bg-[#562a57] text-white shadow-md' 
                                            : 'bg-white text-[#3F0E40] border border-[#3F0E40]/20 hover:bg-[#3F0E40]/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                            
                            {/* Overflow Categories Dropdown */}
                            {overflowCategories.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAllCategories(!showAllCategories)}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-[#3F0E40] border border-[#3F0E40]/20 hover:bg-[#3F0E40]/5 transition-all duration-200 flex items-center gap-1"
                                    >
                                        <MoreHorizontal size={16} />
                                        <span className="hidden sm:inline">More</span>
                                    </button>
                                    
                                    {showAllCategories && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowAllCategories(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#3F0E40]/10 z-50 py-2 max-h-64 overflow-y-auto">
                                                {overflowCategories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => {
                                                            setCategoryFilter(cat);
                                                            setShowAllCategories(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                                            categoryFilter === cat
                                                                ? 'bg-[#562a57] text-white'
                                                                : 'text-[#3F0E40] hover:bg-[#3F0E40]/5'
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Products Table/Cards */}
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden products-table-container">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left min-w-full">
                                    <thead className="bg-gradient-to-r from-[#3F0E40]/5 to-transparent text-slate-600 text-xs uppercase tracking-wider border-b-2 border-b-[#3F0E40]/10">
                                        <tr>
                                            <th className="p-4 font-bold">Product Name</th>
                                            <th className="p-4 font-bold">Category</th>
                                            <th className="p-4 font-bold">Price</th>
                                            <th className="p-4 font-bold">Stock</th>
                                            <th className="p-4 font-bold text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {paginatedProducts.length > 0 ? (
                                            paginatedProducts.map((product, index) => {
                                                const cartItem = cart.find(item => item.id === product.id);
                                                const isOutOfStock = product.stock === 0;
                                                
                                                return (
                                                    <tr 
                                                        key={product.id} 
                                                        className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-[#3F0E40]/5 hover:to-transparent transition-all duration-200 ${isOutOfStock ? 'opacity-60' : ''}`}
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3F0E40]/10 to-green-900/10 flex items-center justify-center flex-shrink-0">
                                                                    <Package size={14} className="text-[#3F0E40]" />
                                                                </div>
                                                                <span className="font-medium text-[#3F0E40]">{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="bg-[#3F0E40]/10 text-[#3F0E40] px-2.5 py-1 rounded-lg text-xs font-medium border border-[#3F0E40]/20 whitespace-nowrap">
                                                                {product.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="font-bold text-green-900">₦{product.price.toLocaleString()}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold ${
                                                                    product.stock === 0 ? 'text-red-500' :
                                                                    product.stock > 50 ? 'text-green-900' : 
                                                                    product.stock > 20 ? 'text-yellow-600' : 'text-red-500'
                                                                }`}>
                                                                    {product.stock}
                                                                </span>
                                                                <span className="text-xs text-slate-400">units</span>
                                                                {cartItem && (
                                                                    <span className="text-xs text-slate-400">
                                                                        ({cartItem.quantity} in cart)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button 
                                                                onClick={() => addToCart(product)} 
                                                                disabled={product.stock === 0}
                                                                className={`bg-[#562a57] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 mx-auto ${
                                                                    product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            >
                                                                <Plus size={14}/> Add
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full mb-4">
                                                            <Search size={32} className="text-[#3F0E40]/40" />
                                                        </div>
                                                        <p className="font-bold text-[#3F0E40] text-lg mb-1">No products found</p>
                                                        <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden">
                                {paginatedProducts.length > 0 ? (
                                    <div className="divide-y">
                                        {paginatedProducts.map((product) => {
                                            const cartItem = cart.find(item => item.id === product.id);
                                            const isOutOfStock = product.stock === 0;
                                            
                                            return (
                                                <div key={product.id} className={`p-4 space-y-3 ${isOutOfStock ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3F0E40]/10 to-green-900/10 flex items-center justify-center flex-shrink-0">
                                                                <Package size={16} className="text-[#3F0E40]" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-medium text-[#3F0E40] truncate">{product.name}</h3>
                                                                <span className="bg-[#3F0E40]/10 text-[#3F0E40] px-2 py-0.5 rounded-lg text-xs font-medium border border-[#3F0E40]/20 inline-block mt-1">
                                                                    {product.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <div>
                                                                <span className="text-xs text-slate-500">Price:</span>
                                                                <span className="font-bold text-green-900 ml-2">₦{product.price.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500">Stock:</span>
                                                                <span className={`font-bold ${
                                                                    product.stock === 0 ? 'text-red-500' :
                                                                    product.stock > 50 ? 'text-green-900' : 
                                                                    product.stock > 20 ? 'text-[#3F0E40]' : 'text-red-500'
                                                                }`}>
                                                                    {product.stock} units
                                                                </span>
                                                                {cartItem && (
                                                                    <span className="text-xs text-slate-400">
                                                                        ({cartItem.quantity} in cart)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => addToCart(product)} 
                                                            disabled={product.stock === 0}
                                                            className={`bg-[#562a57] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                                                                product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <Plus size={14}/> Add
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full mb-4">
                                                <Search size={32} className="text-[#3F0E40]/40" />
                                            </div>
                                            <p className="font-bold text-[#3F0E40] text-lg mb-1">No products found</p>
                                            <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {filteredProducts.length > 0 && totalPages > 1 && (
                                <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-xs sm:text-sm text-slate-500">
                                            Showing <span className="font-medium text-[#3F0E40]">{startItem}</span> to{' '}
                                            <span className="font-medium text-[#3F0E40]">{endItem}</span> of{' '}
                                            <span className="font-medium text-[#3F0E40]">{filteredProducts.length}</span> products
                                        </div>
                                        
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            {/* Previous Button */}
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

                                            {/* Page Numbers */}
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
                                                                    ? 'bg-[#562a57] text-white shadow-md'
                                                                    : 'text-[#3F0E40] hover:bg-[#3F0E40]/5'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            {/* Mobile Page Indicator */}
                                            <div className="sm:hidden px-3 py-1.5 bg-[#3F0E40]/5 rounded-lg">
                                                <span className="text-sm font-medium text-[#3F0E40]">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                            </div>

                                            {/* Next Button */}
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Products</p>
                                <p className="text-xl sm:text-2xl font-black text-[#3F0E40]">{filteredProducts.length}</p>
                                {totalPages > 1 && (
                                    <p className="text-xs text-slate-400 mt-1">{totalPages} pages</p>
                                )}
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Categories</p>
                                <p className="text-xl sm:text-2xl font-black text-green-900">{categories.length - 1}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden lg:sticky lg:top-4">
                            {/* Cart Header */}
                            <div className=" p-4 sm:p-5 border-b text-black relative overflow-hidden">
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                            <ShoppingCart size={18} className="text-black" />
                                        </div>
                                        <h2 className="font-bold text-base sm:text-lg">Current Order</h2>
                                    </div>
                                    <p className="text-xs opacity-90 font-mono bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm border border-white/30 truncate max-w-full">
                                        ID: {orderId}
                                    </p>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="p-3 sm:p-4">
                                {cart.length > 0 ? (
                                    <div className="space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map((item) => {
                                            const product = products.find(p => p.id === item.id);
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className="bg-gradient-to-r from-[#3F0E40]/5 to-transparent rounded-xl p-3 sm:p-4 border border-[#3F0E40]/10 relative group hover:shadow-md transition-all duration-200"
                                                >
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)} 
                                                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                    <div className="mb-3 pr-6">
                                                        <p className="text-sm font-bold text-[#3F0E40] truncate">{item.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">₦{item.price.toLocaleString()} / unit</p>
                                                        {product && (
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                Stock: {product.stock} available
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                                            <button 
                                                                onClick={() => updateQuantity(item.id, -1)} 
                                                                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                                            >
                                                                <Minus size={12} className="text-[#3F0E40]"/>
                                                            </button>
                                                            <span className="text-sm font-bold text-[#3F0E40] min-w-[30px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button 
                                                                onClick={() => addToCart(item)} 
                                                                disabled={product && item.quantity >= product.stock}
                                                                className={`p-1.5 hover:bg-slate-200 rounded-lg transition-colors ${
                                                                    product && item.quantity >= product.stock ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            >
                                                                <Plus size={12} className="text-[#3F0E40]"/>
                                                            </button>
                                                        </div>
                                                        <span className="font-bold text-green-900 text-sm">
                                                            ₦{(item.price * item.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 sm:py-12 text-center">
                                        <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full inline-block mb-4">
                                            <ShoppingCart size={28} className="text-[#3F0E40]/30" />
                                        </div>
                                        <p className="font-bold text-[#3F0E40] mb-1">Your cart is empty</p>
                                        <p className="text-xs text-slate-500">Add products to get started</p>
                                    </div>
                                )}

                                {/* Cart Summary */}
                                {cart.length > 0 && (
                                    <div className="mt-4 sm:mt-6 pt-4 border-t-2 border-t-[#3F0E40]/20">
                                        <div className="space-y-2 sm:space-y-3 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-sm text-slate-500">Total Items:</span>
                                                <span className="font-bold text-[#3F0E40]">{cartItemsCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-sm text-slate-500">Subtotal:</span>
                                                <span className="font-bold text-green-900">₦{cartTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className=" rounded-xl border p-3 sm:p-4 -mx-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-black-600 text-xs font-bold uppercase tracking-wider mb-0.5">Total</p>
                                                    <p className="text-black/80 text-xs">{cartItemsCount} items</p>
                                                </div>
                                                <span className="text-xl sm:text-2xl font-black text-black">
                                                    ₦{cartTotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            disabled={cart.length === 0}
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full mt-4 bg-[#3F0E40] text-white  py-3 sm:py-3.5 rounded-xl font-bold hover:bg-[#3F0E40] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#3F0E40]/25 text-sm sm:text-base"
                                        >
                                            Confirm Purchase
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-[#3F0E40]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 border-2 border-[#3F0E40]/10 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-[#8D5D93] p-5 sm:p-6 text-white relative overflow-hidden">
                                
                                <div className="relative z-10">
                                    <h3 className="text-lg sm:text-xl font-bold mb-1">Confirm Order</h3>
                                    <p className="text-xs opacity-90">Review order details before confirmation</p>
                                </div>
                            </div>
                            
                            <div className="p-5 sm:p-6">
                                {/* Customer Input */}
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-[#3F0E40] uppercase tracking-wider mb-2 block">
                                        Customer Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#3F0E40]/40" size={16} />
                                        <input 
                                            className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F0E40] focus:bg-white transition-all text-sm"
                                            placeholder="Enter customer name (Default: Guest)"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 rounded-xl p-3 sm:p-4 border border-[#3F0E40]/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Receipt size={16} className="text-[#3F0E40]" />
                                        <p className="font-bold text-[#3F0E40] text-sm">Order Summary</p>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm py-1">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className="font-bold text-green-900 bg-green-900/10 px-2 py-0.5 rounded text-xs flex-shrink-0">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-[#3F0E40] truncate">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-green-900 flex-shrink-0 ml-2">₦{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t-2 border-t-[#3F0E40]/20 mt-3 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-[#3F0E40]">Total</span>
                                            <span className="text-lg sm:text-xl font-black text-green-900">₦{cartTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Note */}
                                <div className="mt-4 p-3 bg-[#3F0E40]/5 rounded-xl border border-[#3F0E40]/20 flex items-start gap-2">
                                    <AlertCircle size={14} className="text-[#3F0E40] flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#3F0E40]/70">
                                        This order will be added to the Sales Orders page with the current date and time.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-5 sm:mt-6">
                                    <button 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl font-bold text-[#3F0E40] border-2 border-[#3F0E40]/20 hover:bg-[#3F0E40]/5 transition-all duration-200 text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmPurchase} 
                                        className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 bg-[#562a57] text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateOrder;