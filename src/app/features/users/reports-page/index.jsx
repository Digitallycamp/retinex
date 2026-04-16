import React, { useState, useEffect, useMemo } from 'react';
import { 
    TrendingUp, TrendingDown, Package, ShoppingCart, 
    DollarSign, Calendar, Download, Filter, ChevronDown,
    BarChart3, PieChart, ArrowUp, ArrowDown, AlertCircle,
    Clock, CreditCard, Store, Target, Award
} from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, getDocs } from "firebase/firestore";
import { 
    AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, 
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, LineChart, Line 
} from 'recharts';

const Reports = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    
    // Colors for charts - matching brand colors
    const COLORS = ['#3F0E40', '#14532d', '#ca8a04', '#64748b', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899'];

    // Fetch data from Firebase
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch sales data
                const salesSnapshot = await getDocs(collection(db, "sales"));
                const sales = salesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSalesData(sales);
                
                // Fetch products data
                const productsSnapshot = await getDocs(collection(db, "products"));
                const products = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProductsData(products);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // 1. Sales Orders Report (Revenue over time)
    const salesReport = useMemo(() => {
        if (!salesData.length) return [];
        
        const grouped = {};
        
        salesData.forEach(sale => {
            if (!sale.date) return;
            
            const date = new Date(sale.date);
            let key;
            
            if (dateRange === 'week') {
                // Group by day of week
                key = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (dateRange === 'month') {
                // Group by week
                const weekNum = Math.ceil(date.getDate() / 7);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                key = `${month} W${weekNum}`;
            } else if (dateRange === 'quarter') {
                // Group by month
                key = date.toLocaleDateString('en-US', { month: 'short' });
            } else {
                // Group by month for year view
                key = date.toLocaleDateString('en-US', { month: 'short' });
            }
            
            if (!grouped[key]) {
                grouped[key] = { revenue: 0, orders: 0 };
            }
            grouped[key].revenue += sale.total || 0;
            grouped[key].orders += 1;
        });
        
        return Object.entries(grouped).map(([name, data]) => ({
            name,
            revenue: data.revenue,
            orders: data.orders,
            averageOrder: data.revenue / data.orders
        }));
    }, [salesData, dateRange]);

    // 2. Best Selling Products Report
    const bestSellingProducts = useMemo(() => {
        if (!salesData.length) return [];
        
        const productSales = {};
        
        // Aggregate sales from all orders
        salesData.forEach(sale => {
            if (!sale.details || !Array.isArray(sale.details)) return;
            
            sale.details.forEach(item => {
                const productName = item.name;
                const quantity = item.quantity || 0;
                const revenue = (item.price || 0) * quantity;
                
                if (!productSales[productName]) {
                    productSales[productName] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                
                productSales[productName].quantity += quantity;
                productSales[productName].revenue += revenue;
            });
        });
        
        // Convert to array and sort by quantity sold
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8); // Top 8 products
        
        return sortedProducts;
    }, [salesData]);

    // 3. Capital vs Selling Price vs Profit Report
    const financialReport = useMemo(() => {
        if (!salesData.length || !productsData.length) return { data: [], summary: {} };
        
        const productFinancials = {};
        
        // Create a map of product names to their cost prices
        const productCostMap = {};
        productsData.forEach(product => {
            if (product.name) {
                productCostMap[product.name] = {
                    costPrice: product.costPrice || 0,
                    sellingPrice: product.price || 0,
                    category: product.category || 'Uncategorized'
                };
            }
        });
        
        // Calculate financials from sales
        salesData.forEach(sale => {
            if (!sale.details || !Array.isArray(sale.details)) return;
            
            sale.details.forEach(item => {
                const productName = item.name;
                const quantity = item.quantity || 0;
                const sellingPrice = item.price || 0;
                
                // Get cost price from products collection
                const productInfo = productCostMap[productName];
                const costPrice = productInfo?.costPrice || sellingPrice * 0.7; // Fallback if not found
                
                const totalCapital = costPrice * quantity;
                const totalSellingPrice = sellingPrice * quantity;
                const totalProfit = totalSellingPrice - totalCapital;
                
                if (!productFinancials[productName]) {
                    productFinancials[productName] = {
                        name: productName,
                        category: productInfo?.category || 'Uncategorized',
                        quantity: 0,
                        costPrice: costPrice,
                        sellingPrice: sellingPrice,
                        totalCapital: 0,
                        totalSellingPrice: 0,
                        totalProfit: 0,
                        profitMargin: 0
                    };
                }
                
                productFinancials[productName].quantity += quantity;
                productFinancials[productName].totalCapital += totalCapital;
                productFinancials[productName].totalSellingPrice += totalSellingPrice;
                productFinancials[productName].totalProfit += totalProfit;
            });
        });
        
        // Calculate profit margins
        Object.values(productFinancials).forEach(product => {
            product.profitMargin = product.totalSellingPrice > 0 
                ? (product.totalProfit / product.totalSellingPrice) * 100 
                : 0;
        });
        
        // Sort by total profit
        const sortedData = Object.values(productFinancials)
            .sort((a, b) => b.totalProfit - a.totalProfit)
            .slice(0, 6); // Top 6 products by profit
        
        // Calculate summary totals
        const summary = {
            totalCapital: sortedData.reduce((sum, p) => sum + p.totalCapital, 0),
            totalRevenue: sortedData.reduce((sum, p) => sum + p.totalSellingPrice, 0),
            totalProfit: sortedData.reduce((sum, p) => sum + p.totalProfit, 0),
            averageMargin: sortedData.length > 0 
                ? sortedData.reduce((sum, p) => sum + p.profitMargin, 0) / sortedData.length 
                : 0
        };
        
        return { data: sortedData, summary };
    }, [salesData, productsData]);

    // Overall summary metrics
    const overallMetrics = useMemo(() => {
        if (!salesData.length) return null;
        
        let totalRevenue = 0;
        let totalOrders = salesData.length;
        let totalItems = 0;
        let totalCapital = 0;
        
        // Create product cost map
        const productCostMap = {};
        productsData.forEach(product => {
            if (product.name) {
                productCostMap[product.name] = product.costPrice || product.price * 0.7;
            }
        });
        
        salesData.forEach(sale => {
            totalRevenue += sale.total || 0;
            totalItems += sale.qty || 0;
            
            if (sale.details && Array.isArray(sale.details)) {
                sale.details.forEach(item => {
                    const costPrice = productCostMap[item.name] || (item.price * 0.7);
                    totalCapital += costPrice * (item.quantity || 0);
                });
            }
        });
        
        const totalProfit = totalRevenue - totalCapital;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        
        return {
            totalRevenue,
            totalOrders,
            totalItems,
            totalCapital,
            totalProfit,
            profitMargin
        };
    }, [salesData, productsData]);

    // Format currency
    const formatCurrency = (value) => {
        return `₦${value.toLocaleString()}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0E40] mx-auto mb-4"></div>
                    <p className="text-[#3F0E40] font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full">
                {/* Page Header */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#3F0E40] via-[#3F0E40]/95 to-green-900 p-4 sm:p-6 lg:p-8 shadow-xl">
                    <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]"></div>
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-green-900/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">Reports & Analytics</h1>
                            <p className="text-white/80 text-xs sm:text-sm lg:text-base">Track performance, analyze trends, and make data-driven decisions</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                            <select 
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-white text-sm outline-none cursor-pointer"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="week" className="text-[#3F0E40]">Weekly View</option>
                                <option value="month" className="text-[#3F0E40]">Monthly View</option>
                                <option value="quarter" className="text-[#3F0E40]">Quarterly View</option>
                                <option value="year" className="text-[#3F0E40]">Yearly View</option>
                            </select>
                            <button className="bg-yellow-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:shadow-yellow-600/25 hover:bg-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200">
                                <Download size={16}/> Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                {overallMetrics && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#3F0E40] shadow-sm">
                            <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Revenue</p>
                            <p className="text-lg sm:text-xl font-black text-green-900 truncate">
                                {formatCurrency(overallMetrics.totalRevenue)}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-green-900 shadow-sm">
                            <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Capital</p>
                            <p className="text-lg sm:text-xl font-black text-[#3F0E40] truncate">
                                {formatCurrency(overallMetrics.totalCapital)}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-yellow-600 shadow-sm">
                            <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Gross Profit</p>
                            <p className="text-lg sm:text-xl font-black text-green-900 truncate">
                                {formatCurrency(overallMetrics.totalProfit)}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-blue-500 shadow-sm">
                            <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Profit Margin</p>
                            <p className="text-lg sm:text-xl font-black text-[#3F0E40]">
                                {overallMetrics.profitMargin.toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-purple-500 shadow-sm">
                            <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Orders</p>
                            <p className="text-lg sm:text-xl font-black text-green-900">{overallMetrics.totalOrders}</p>
                        </div>
                    </div>
                )}

                {/* Report 1: Sales Orders Report */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-[#3F0E40] to-green-900 p-2 rounded-lg">
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-[#3F0E40] text-base sm:text-lg">Sales Orders Report</h2>
                                <p className="text-xs text-slate-500">Revenue and order trends over time</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 sm:p-5">
                        <div className="h-64 sm:h-80">
                            {salesReport.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesReport}>
                                        <defs>
                                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3F0E40" stopOpacity={0.3}/>
                                                <stop offset="50%" stopColor="#14532d" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.05}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            tickFormatter={(val) => `₦${val.toLocaleString()}`}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'white', 
                                                border: '1px solid #3F0E40',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                boxShadow: '0 10px 40px rgba(63, 14, 64, 0.1)'
                                            }}
                                            formatter={(value, name) => [
                                                name === 'revenue' ? formatCurrency(value) : value,
                                                name === 'revenue' ? 'Revenue' : 'Orders'
                                            ]}
                                        />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            name="Revenue"
                                            stroke="#3F0E40" 
                                            strokeWidth={2}
                                            fill="url(#salesGradient)" 
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="orders" 
                                            name="Orders"
                                            stroke="#ca8a04" 
                                            strokeWidth={2}
                                            dot={{ fill: '#ca8a04', r: 4 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <p>No sales data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report 2 & 3: Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Report 2: Best Selling Products */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-green-900 to-[#3F0E40] p-2 rounded-lg">
                                    <Award size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#3F0E40] text-base sm:text-lg">Best Selling Products</h2>
                                    <p className="text-xs text-slate-500">Top products by quantity sold</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="h-64 sm:h-80">
                                {bestSellingProducts.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={bestSellingProducts} 
                                            layout="vertical"
                                            margin={{ left: 100 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                            <XAxis 
                                                type="number" 
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                type="category" 
                                                dataKey="name" 
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={100}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'white', 
                                                    border: '1px solid #3F0E40',
                                                    borderRadius: '12px',
                                                    padding: '12px'
                                                }}
                                                formatter={(value, name) => [
                                                    name === 'quantity' ? `${value} units` : formatCurrency(value),
                                                    name === 'quantity' ? 'Quantity Sold' : 'Revenue'
                                                ]}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="quantity" 
                                                name="Quantity Sold"
                                                fill="#14532d" 
                                                radius={[0, 4, 4, 0]}
                                            />
                                            <Bar 
                                                dataKey="revenue" 
                                                name="Revenue"
                                                fill="#ca8a04" 
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <p>No product sales data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report 3: Capital vs Selling Price vs Profit */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-yellow-600 to-green-900 p-2 rounded-lg">
                                    <Target size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#3F0E40] text-base sm:text-lg">Capital vs Revenue vs Profit</h2>
                                    <p className="text-xs text-slate-500">Financial performance by product</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            {financialReport.summary && (
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Total Capital</p>
                                        <p className="text-sm font-bold text-[#3F0E40]">
                                            {formatCurrency(financialReport.summary.totalCapital)}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Total Revenue</p>
                                        <p className="text-sm font-bold text-green-900">
                                            {formatCurrency(financialReport.summary.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <p className="text-[10px] text-slate-500 uppercase">Total Profit</p>
                                        <p className="text-sm font-bold text-yellow-600">
                                            {formatCurrency(financialReport.summary.totalProfit)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="h-52 sm:h-64">
                                {financialReport.data.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={financialReport.data}
                                            margin={{ bottom: 50 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                tickFormatter={(val) => `₦${val.toLocaleString()}`}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'white', 
                                                    border: '1px solid #3F0E40',
                                                    borderRadius: '12px',
                                                    padding: '12px'
                                                }}
                                                formatter={(value) => formatCurrency(value)}
                                            />
                                            <Legend 
                                                wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                                            />
                                            <Bar 
                                                dataKey="totalCapital" 
                                                name="Capital (Cost)" 
                                                fill="#64748b" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar 
                                                dataKey="totalSellingPrice" 
                                                name="Revenue" 
                                                fill="#14532d" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar 
                                                dataKey="totalProfit" 
                                                name="Profit" 
                                                fill="#ca8a04" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <p>No financial data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Financial Details Table */}
                {financialReport.data.length > 0 && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white">
                            <h3 className="font-bold text-[#3F0E40]">Product Financial Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                    <tr>
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-right">Cost/Unit</th>
                                        <th className="p-3 text-right">Price/Unit</th>
                                        <th className="p-3 text-right">Qty Sold</th>
                                        <th className="p-3 text-right">Total Capital</th>
                                        <th className="p-3 text-right">Total Revenue</th>
                                        <th className="p-3 text-right">Total Profit</th>
                                        <th className="p-3 text-right">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialReport.data.map((product) => (
                                        <tr key={product.name} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-medium text-[#3F0E40]">{product.name}</td>
                                            <td className="p-3 text-right">{formatCurrency(product.costPrice)}</td>
                                            <td className="p-3 text-right">{formatCurrency(product.sellingPrice)}</td>
                                            <td className="p-3 text-right">{product.quantity}</td>
                                            <td className="p-3 text-right text-slate-600">{formatCurrency(product.totalCapital)}</td>
                                            <td className="p-3 text-right text-green-900 font-medium">{formatCurrency(product.totalSellingPrice)}</td>
                                            <td className="p-3 text-right text-yellow-600 font-bold">{formatCurrency(product.totalProfit)}</td>
                                            <td className="p-3 text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    product.profitMargin >= 30 ? 'bg-green-100 text-green-900' :
                                                    product.profitMargin >= 15 ? 'bg-yellow-100 text-yellow-900' :
                                                    'bg-red-100 text-red-900'
                                                }`}>
                                                    {product.profitMargin.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;