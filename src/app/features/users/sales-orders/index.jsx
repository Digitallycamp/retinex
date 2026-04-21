import React, { useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Eye, ShoppingCart, X, TrendingUp, Package, Users, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../../../../context/OrderContext';

const SalesOrders = () => {
    const { sales } = useOrders(); 
    const navigate = useNavigate();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("All");
    const [graphPeriod, setGraphPeriod] = useState("Daily");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 1 & 2: Filter logic for Search and Date
    const filteredSales = useMemo(() => {
        return sales.filter((sale) => {
            // Search Filter
            const searchMatch = 
                sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                sale.customer.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!searchMatch) return false;

            // Date Filter
            if (dateFilter === "All") return true;

            const saleDate = new Date(sale.date);
            const today = new Date();
            // Calculate difference in days
            const diffDays = Math.ceil(Math.abs(today - saleDate) / (1000 * 60 * 60 * 24));

            if (dateFilter === "Last 7 Days") return diffDays <= 7;
            if (dateFilter === "Last 30 Days") return diffDays <= 30;

            return true;
        });
    }, [sales, searchTerm, dateFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    
    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSales.slice(startIndex, endIndex);
    }, [filteredSales, currentPage]);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, dateFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smooth scroll to top of table
        document.querySelector('.orders-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // page numbers to display
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

    // 4: Dynamic Graph Data Calculation
    const graphData = useMemo(() => {
        const groupedData = {};

        sales.forEach(sale => {
            const d = new Date(sale.date);
            let key = "";

            if (graphPeriod === 'Daily') {
                key = d.toLocaleDateString(undefined, { weekday: 'short' }); // e.g., Mon, Tue
            } else if (graphPeriod === 'Weekly') {
                key = `Week ${Math.ceil(d.getDate() / 7)}`; // e.g., Week 1, Week 2
            } else if (graphPeriod === 'Monthly') {
                key = d.toLocaleDateString(undefined, { month: 'short' }); // e.g., Jan, Feb
            }

            if (!groupedData[key]) groupedData[key] = 0;
            groupedData[key] += sale.total;
        });

        // Convert grouped object back to an array for Recharts
        const dataArray = Object.keys(groupedData).map(key => ({
            name: key,
            total: groupedData[key]
        }));

        return dataArray.length > 0 ? dataArray : [];
    }, [sales, graphPeriod]);

    // Calculate stats for summary cards
    const totalRevenue = useMemo(() => {
        return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    }, [filteredSales]);

    const totalOrders = filteredSales.length;

    const totalItems = useMemo(() => {
        return filteredSales.reduce((sum, sale) => sum + Number(sale.qty), 0);
    }, [filteredSales]);

    const startItem = filteredSales.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredSales.length);

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full">
                {/* Enhanced Header with Professional Gradient */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border  p-4 sm:p-6 lg:p-8 shadow-xl">
                    
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-1">Sales Orders</h1>
                            <p className="text-black/80 text-xs sm:text-sm lg:text-base">Manage and track your customer orders</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:flex-none">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black/60" size={16} />
                                <input 
                                    className="w-full lg:w-64 xl:w-72 pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-black/10 backdrop-blur-sm border border-black/20 rounded-xl text-sm outline-none placeholder:text-black/60 text-black focus:bg-white/20 focus:border-[#3F0E40]/50 transition-all"
                                    placeholder="Search Order ID or Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                className="bg-[#3F0E40] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:shadow-[#3F0E40]/25 hover:bg-[#3F0E40] transform hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => navigate("/create-order")}
                            >
                                <ShoppingCart size={16}/> Place Order
                            </button>
                        </div>
                    </div>
                </div>


                {/* Table Section */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden orders-table-container">
                    <div className="p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-gradient-to-br from-[#3F0E40] to-green-900 p-2 rounded-lg">
                                    <Package size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#3F0E40] text-base sm:text-lg">All Orders</h2>
                                    <p className="text-xs text-slate-500">
                                        {filteredSales.length} orders found
                                        {filteredSales.length > 0 && ` • Showing ${startItem}-${endItem}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#3F0E40]/60" />
                                <select 
                                    className="text-sm border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 outline-none cursor-pointer bg-white hover:border-[#3F0E40] focus:border-[#3F0E40] transition-colors"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="All">All Time</option>
                                    <option value="Last 7 Days">Last 7 Days</option>
                                    <option value="Last 30 Days">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-gradient-to-r from-[#3F0E40]/5 to-transparent text-slate-600 text-xs uppercase tracking-wider border-b-2 border-b-[#3F0E40]/10">
                                <tr>
                                    <th className="p-4 font-bold">Order ID</th>
                                    <th className="p-4 font-bold">Date | Time</th>
                                    <th className="p-4 font-bold">Customer Name</th>
                                    <th className="p-4 text-center font-bold">Quantity</th>
                                    <th className="p-4 font-bold">Total Amount</th>
                                    <th className="p-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedSales.length > 0 ? (
                                    paginatedSales.map((sale, index) => (
                                        <tr 
                                            key={sale.orderId} 
                                            className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-[#3F0E40]/5 hover:to-transparent transition-all duration-200"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="p-4">
                                                <span className="font-bold text-[#3F0E40] bg-[#3F0E40]/5 px-2.5 py-1 rounded-lg text-xs border border-[#3F0E40]/10">
                                                    {sale.orderId}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-green-900 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-slate-700 font-medium">{sale.date}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">{sale.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#8D5D93] flex items-center justify-center shadow-sm flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">
                                                            {sale.customer?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-[#3F0E40] truncate max-w-[150px]">{sale.customer}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-bold text-[#3F0E40] bg-[#3F0E40]/5 px-3 py-1 rounded-full text-xs border border-green-900/10 whitespace-nowrap">
                                                    {sale.qty} items
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-black text-green-900 text-base whitespace-nowrap">
                                                    ₦{sale.total.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => setSelectedInvoice(sale)}
                                                    className="group relative inline-flex items-center gap-2 text-[#8D5D93] font-bold hover:text-[#3F0E40] transition-all duration-200"
                                                >
                                                    <span className="absolute inset-0 bg-yellow-600/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-10"></span>
                                                    <Eye size={16} className="group-hover:scale-110 transition-transform" /> 
                                                    <span className="text-sm">View Invoice</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-4 rounded-full mb-4">
                                                    <Search size={32} className="text-[#3F0E40]/40" />
                                                </div>
                                                <p className="font-bold text-[#3F0E40] text-lg mb-1">No orders found</p>
                                                <p className="text-sm text-slate-500">Try adjusting your search or date filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden">
                        {paginatedSales.length > 0 ? (
                            <div className="divide-y">
                                {paginatedSales.map((sale, index) => (
                                    <div 
                                        key={sale.orderId} 
                                        className="p-3 sm:p-4 space-y-3 hover:bg-gradient-to-r hover:from-yellow-600/5 hover:to-transparent transition-all duration-200"
                                    >
                                        {/* Order ID and Total */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-bold text-[#3F0E40] bg-[#3F0E40]/5 px-2.5 py-1 rounded-lg text-xs border border-[#3F0E40]/10 flex-shrink-0">
                                                    {sale.orderId}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Calendar size={12} className="text-green-900 flex-shrink-0" />
                                                    <span className="truncate">{sale.date}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex-shrink-0">{sale.time}</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-green-900 text-base whitespace-nowrap flex-shrink-0">
                                                ₦{sale.total.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Customer and Quantity */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3F0E40] to-green-900 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <span className="text-xs font-bold text-white">
                                                        {sale.customer?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-[#3F0E40] text-sm truncate">{sale.customer}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="font-bold text-green-900 bg-green-900/5 px-2.5 py-1 rounded-full text-xs border border-green-900/10 whitespace-nowrap">
                                                    {sale.qty} items
                                                </span>
                                                <button 
                                                    onClick={() => setSelectedInvoice(sale)}
                                                    className="group relative inline-flex items-center gap-1.5 text-[#3F0E40] font-bold hover:text-yellow-600 transition-all duration-200"
                                                >
                                                    <Eye size={14} className="group-hover:scale-110 transition-transform" /> 
                                                    <span className="text-xs">View</span>
                                                </button>
                                            </div>
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
                                    <p className="font-bold text-[#3F0E40] text-lg mb-1">No orders found</p>
                                    <p className="text-sm text-slate-500">Try adjusting your search or date filter</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredSales.length > 0 && totalPages > 1 && (
                        <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-xs sm:text-sm text-slate-500">
                                    Showing <span className="font-medium text-[#3F0E40]">{startItem}</span> to{' '}
                                    <span className="font-medium text-[#3F0E40]">{endItem}</span> of{' '}
                                    <span className="font-medium text-[#3F0E40]">{filteredSales.length}</span> orders
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
                                                            ? 'bg-[#3F0E40] text-white shadow-md'
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

                {/* Graph Section */}
                <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div>
                            <h3 className="font-bold text-[#3F0E40] text-base sm:text-lg">Sales Analytics</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Revenue overview by {graphPeriod.toLowerCase()} basis</p>
                        </div>
                        <div className="flex gap-1 p-1 bg-[#3F0E40]/5 rounded-xl self-start">
                            {['Daily', 'Weekly', 'Monthly'].map(t => (
                                <button 
                                    key={t} 
                                    onClick={() => setGraphPeriod(t)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                        graphPeriod === t 
                                            ? 'bg-[#3F0E40] text-white shadow-md' 
                                            : 'text-[#3F0E40] hover:bg-[#3F0E40]/10'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-56 sm:h-64 lg:h-72 w-full">
                        {graphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8D5D93" stopOpacity={0.2}/>
                                            <stop offset="50%" stopColor="#8D5D93" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#8D5D93" stopOpacity={0.05}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 11, fill: '#3F0E40', fontWeight: 500}} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 11, fill: '#3F0E40', fontWeight: 500}} 
                                        tickFormatter={(val) => `₦${val}`}
                                        width={50}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #3F0E40',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(63, 14, 64, 0.1)',
                                            padding: '8px 12px',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#3F0E40" 
                                        strokeWidth={2.5}
                                        fill="url(#colorTotal)" 
                                        dot={{ fill: '#ffffff', strokeWidth: 2, r: 3, stroke: '#3F0E40' }}
                                        activeDot={{ r: 5, fill: '#ffffff', stroke: '#3F0E40', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <TrendingUp size={40} className="mb-3 opacity-30 text-[#3F0E40]" />
                                <p className="text-sm font-medium text-[#3F0E40]/60">No sales data available to chart</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Invoice Modal */}
                {selectedInvoice && (
                    <div className="fixed inset-0 bg-[#3F0E40]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 border-2 border-[#3F0E40]/10 max-h-[90vh] overflow-y-auto">
                            <div className="bg-[#8D5D93] p-5 sm:p-6 text-white relative overflow-hidden">
                                
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold mb-1">Order Invoice</h2>
                                        <p className="text-xs opacity-90 font-mono bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm border border-white/30 truncate max-w-[200px] sm:max-w-full">
                                            {selectedInvoice.id}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedInvoice(null)} 
                                        className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-200 flex-shrink-0"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                                <div className="bg-gradient-to-br from-[#3F0E40]/5 to-green-900/5 p-3 sm:p-4 rounded-xl border border-[#3F0E40]/10">
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[#3F0E40]/60 text-[10px] uppercase font-bold tracking-wider mb-1">Customer</p>
                                            <p className="font-bold text-[#3F0E40] text-sm sm:text-base truncate">{selectedInvoice.customer}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#3F0E40]/60 text-[10px] uppercase font-bold tracking-wider mb-1">Date & Time</p>
                                            <p className="font-bold text-green-900 text-xs sm:text-sm">
                                                {selectedInvoice.date} <span className="text-[#3F0E40] mx-1">•</span> {selectedInvoice.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Product Breakdown */}
                                <div className="pt-2">
                                    <p className="text-xs font-bold text-[#3F0E40] uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Package size={14} className="text-yellow-600" />
                                        Items Purchased
                                    </p>
                                    <div className="max-h-52 sm:max-h-60 overflow-y-auto space-y-2 sm:space-y-3 pr-2 custom-scrollbar">
                                        {selectedInvoice.details && selectedInvoice.details.length > 0 ? (
                                            selectedInvoice.details.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm p-2.5 sm:p-3 bg-gradient-to-r from-[#3F0E40]/5 to-transparent rounded-lg hover:from-[#8D5D93]/10 transition-colors border border-[#3F0E40]/5">
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                        <span className="font-bold text-green-900 bg-green-900/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs border border-green-900/20 flex-shrink-0">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-[#3F0E40] font-medium text-sm truncate">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-green-900 text-sm flex-shrink-0 ml-2">
                                                        ₦{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic text-center py-4 bg-[#3F0E40]/5 rounded-lg">
                                                Detailed item list not available for this legacy order.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t-2 border-t-[#3F0E40]/20 pt-4 mt-2">
                                    <div className="bg-[#8D5D93] rounded-xl p-4 sm:p-5 -mx-2 shadow-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                                <p className="text-xs text-white/80">{selectedInvoice.qty} Items Total</p>
                                            </div>
                                            <span className="text-2xl sm:text-3xl font-black text-white">
                                                ₦{selectedInvoice.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedInvoice(null)} 
                                    className="w-full bg-[#3F0E40] text-white py-3 sm:py-3.5 rounded-xl font-bold hover:bg-[#3F0E40] transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 border border-[#3F0E40] text-sm sm:text-base"
                                >
                                    Close Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesOrders;