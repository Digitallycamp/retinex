import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, Download, Target, Award } from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

const Reports = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Handle resize to fix Recharts dimension errors
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                if (width > 0 && height > 0) {
                    setChartDimensions({ width, height });
                }
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        const timeout = setTimeout(updateDimensions, 100);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timeout);
        };
    }, []);

    // Fetch data from Firebase
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch sales data
                const salesSnapshot = await getDocs(collection(db, 'sales'));
                const sales = salesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setSalesData(sales);

                // Fetch products data
                const productsSnapshot = await getDocs(collection(db, 'products'));
                const products = productsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProductsData(products);
            } catch (error) {
                console.error('Error fetching data:', error);
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

        salesData.forEach((sale) => {
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
            averageOrder: data.revenue / data.orders,
        }));
    }, [salesData, dateRange]);

    // 2. Best Selling Products Report
    const bestSellingProducts = useMemo(() => {
        if (!salesData.length) return [];

        const productSales = {};

        // Aggregate sales from all orders
        salesData.forEach((sale) => {
            if (!sale.details || !Array.isArray(sale.details)) return;

            sale.details.forEach((item) => {
                const productName = item.name;
                const quantity = item.quantity || 0;
                const revenue = (item.price || 0) * quantity;

                if (!productSales[productName]) {
                    productSales[productName] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0,
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
        if (!salesData.length || !productsData.length)
            return { data: [], summary: {} };

        const productFinancials = {};

        // Create a map of product names to their cost prices
        const productCostMap = {};
        productsData.forEach((product) => {
            if (product.name) {
                productCostMap[product.name] = {
                    costPrice: product.costPrice || 0,
                    sellingPrice: product.price || 0,
                    category: product.category || 'Uncategorized',
                };
            }
        });

        // Calculate financials from sales
        salesData.forEach((sale) => {
            if (!sale.details || !Array.isArray(sale.details)) return;

            sale.details.forEach((item) => {
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
                        profitMargin: 0,
                    };
                }

                productFinancials[productName].quantity += quantity;
                productFinancials[productName].totalCapital += totalCapital;
                productFinancials[productName].totalSellingPrice += totalSellingPrice;
                productFinancials[productName].totalProfit += totalProfit;
            });
        });

        // Calculate profit margins
        Object.values(productFinancials).forEach((product) => {
            product.profitMargin =
                product.totalSellingPrice > 0
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
            averageMargin:
                sortedData.length > 0
                    ? sortedData.reduce((sum, p) => sum + p.profitMargin, 0) /
                      sortedData.length
                    : 0,
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
        productsData.forEach((product) => {
            if (product.name) {
                productCostMap[product.name] = product.costPrice || product.price * 0.7;
            }
        });

        salesData.forEach((sale) => {
            totalRevenue += sale.total || 0;
            totalItems += sale.qty || 0;

            if (sale.details && Array.isArray(sale.details)) {
                sale.details.forEach((item) => {
                    const costPrice = productCostMap[item.name] || item.price * 0.7;
                    totalCapital += costPrice * (item.quantity || 0);
                });
            }
        });

        const totalProfit = totalRevenue - totalCapital;
        const profitMargin =
            totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalOrders,
            totalItems,
            totalCapital,
            totalProfit,
            profitMargin,
        };
    }, [salesData, productsData]);

    // Format currency
    const formatCurrency = (value) => {
        return `₦${value.toLocaleString()}`;
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen w-full min-w-0'>
                <div className='text-center px-4'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0E40] mx-auto mb-4'></div>
                    <p className='text-[#3F0E40] font-medium'>Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full max-w-full overflow-x-hidden min-w-0' ref={containerRef}>
            <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full min-w-0 mx-auto'>
                {/* Page Header */}
                <Header 
                    title="Reports & Analytics"
                    description="Track performance, analyze trends, and make data-driven decisions"
                    customChildren={
                      <select
                        className='bg-black/10 backdrop-blur-sm border border-black/20 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-black text-sm outline-none cursor-pointer w-full sm:w-auto flex-shrink-0'
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value='week' className='text-[#3F0E40]'>
                          Weekly View
                        </option>
                        <option value='month' className='text-[#3F0E40]'>
                          Monthly View
                        </option>
                        <option value='quarter' className='text-[#3F0E40]'>
                          Quarterly View
                        </option>
                        <option value='year' className='text-[#3F0E40]'>
                          Yearly View
                        </option>
                      </select>
                    }
                />

                {/* Key Metrics Cards */}
                {overallMetrics && (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 min-w-0'>
                        <div className='bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#8D5D93] shadow-sm min-w-0 overflow-hidden'>
                            <p className='text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
                                Revenue
                            </p>
                            <p className='text-base sm:text-lg lg:text-xl font-black text-green-900 truncate'>
                                {formatCurrency(overallMetrics.totalRevenue)}
                            </p>
                        </div>
                        <div className='bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#8D5D93] shadow-sm min-w-0 overflow-hidden'>
                            <p className='text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
                                Total Capital
                            </p>
                            <p className='text-base sm:text-lg lg:text-xl font-black text-green-900 truncate'>
                                {formatCurrency(overallMetrics.totalCapital)}
                            </p>
                        </div>
                        <div className='bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#8D5D93] shadow-sm min-w-0 overflow-hidden'>
                            <p className='text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
                                Gross Profit
                            </p>
                            <p className='text-base sm:text-lg lg:text-xl font-black text-green-900 truncate'>
                                {formatCurrency(overallMetrics.totalProfit)}
                            </p>
                        </div>
                        <div className='bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#8D5D93] shadow-sm min-w-0 overflow-hidden'>
                            <p className='text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
                                Profit Margin
                            </p>
                            <p className='text-base sm:text-lg lg:text-xl font-black text-[#8D5D93] truncate'>
                                {overallMetrics.profitMargin.toFixed(1)}%
                            </p>
                        </div>
                        <div className='bg-white rounded-xl p-3 sm:p-4 border-l-4 border-l-[#8D5D93] shadow-sm min-w-0 overflow-hidden col-span-2 sm:col-span-3 lg:col-span-1'>
                            <p className='text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate'>
                                Total Orders
                            </p>
                            <p className='text-base sm:text-lg lg:text-xl font-black text-[#8D5D93] truncate'>
                                {overallMetrics.totalOrders}
                            </p>
                        </div>
                    </div>
                )}

                {/* Report 1: Sales Orders Report */}
                <div className='bg-white rounded-xl border shadow-sm overflow-hidden min-w-0'>
                    <div className='p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white'>
                        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                            <div className='bg-[#8D5D93] p-2 rounded-lg flex-shrink-0'>
                                <TrendingUp size={18} className='text-white' />
                            </div>
                            <div className='min-w-0'>
                                <h2 className='font-bold text-[#3F0E40] text-sm sm:text-base lg:text-lg truncate'>
                                    Sales Orders Report
                                </h2>
                                <p className='text-xs text-slate-500 truncate'>
                                    Revenue and order trends over time
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='p-3 sm:p-4 lg:p-5 min-w-0 overflow-x-hidden'>
                        <div className='w-full' style={{ height: 'clamp(250px, 40vh, 400px)', minHeight: '250px' }}>
                            {salesReport.length > 0 ? (
                                <ResponsiveContainer width='100%' height='100%' minWidth={0}>
                                    <AreaChart data={salesReport} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                        <defs>
                                            <linearGradient
                                                id='salesGradient'
                                                x1='0'
                                                y1='0'
                                                x2='0'
                                                y2='1'
                                            >
                                                <stop
                                                    offset='5%'
                                                    stopColor='#3F0E40'
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset='50%'
                                                    stopColor='#14532d'
                                                    stopOpacity={0.15}
                                                />
                                                <stop
                                                    offset='95%'
                                                    stopColor='#ca8a04'
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis
                                            dataKey='name'
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                            angle={-35}
                                            textAnchor='end'
                                            height={50}
                                            interval='preserveStartEnd'
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            tickFormatter={(val) => `₦${(val / 1000)}k`}
                                            axisLine={false}
                                            tickLine={false}
                                            width={60}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #3F0E40',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                boxShadow: '0 10px 40px rgba(63, 14, 64, 0.1)',
                                            }}
                                            formatter={(value, name) => [
                                                name === 'revenue' ? formatCurrency(value) : value,
                                                name === 'revenue' ? 'Revenue' : 'Orders',
                                            ]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" height={36} />
                                        <Area
                                            type='monotone'
                                            dataKey='revenue'
                                            name='Revenue'
                                            stroke='#8D5D93'
                                            strokeWidth={2}
                                            fill='url(#salesGradient)'
                                        />
                                        <Line
                                            type='monotone'
                                            dataKey='orders'
                                            name='Orders'
                                            stroke='#000000'
                                            strokeWidth={2}
                                            dot={{ fill: '#ffffff', r: 4 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className='h-full flex items-center justify-center text-slate-400'>
                                    <p>No sales data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report 2 & 3: Two Column Layout */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0'>
                    {/* Report 2: Best Selling Products */}
                    <div className='bg-white rounded-xl border shadow-sm overflow-hidden min-w-0'>
                        <div className='p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white'>
                            <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                                <div className='bg-[#8D5D93] p-2 rounded-lg flex-shrink-0'>
                                    <Award size={18} className='text-white' />
                                </div>
                                <div className='min-w-0'>
                                    <h2 className='font-bold text-[#3F0E40] text-sm sm:text-base lg:text-lg truncate'>
                                        Best Selling Products
                                    </h2>
                                    <p className='text-xs text-slate-500 truncate'>
                                        Top products by quantity sold
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='p-3 sm:p-4 lg:p-5 min-w-0 overflow-x-hidden'>
                            <div className='w-full' style={{ height: 'clamp(250px, 40vh, 400px)', minHeight: '250px' }}>
                                {bestSellingProducts.length > 0 ? (
                                    <ResponsiveContainer width='100%' height='100%' minWidth={0}>
                                        <BarChart
                                            data={bestSellingProducts}
                                            layout='vertical'
                                            margin={{ left: 60, right: 10, top: 10, bottom: 10 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray='3 3'
                                                stroke='#e2e8f0'
                                                horizontal={false}
                                            />
                                            <XAxis
                                                type='number'
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                type='category'
                                                dataKey='name'
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={60}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #3F0E40',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                }}
                                                formatter={(value, name) => [
                                                    name === 'quantity'
                                                        ? `${value} units`
                                                        : formatCurrency(value),
                                                    name === 'quantity' ? 'Quantity Sold' : 'Revenue',
                                                ]}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" height={36} />
                                            <Bar
                                                dataKey='quantity'
                                                name='Quantity Sold'
                                                fill='#14532d'
                                                radius={[0, 4, 4, 0]}
                                            />
                                            <Bar
                                                dataKey='revenue'
                                                name='Revenue'
                                                fill='#8D5D93'
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-slate-400'>
                                        <p>No product sales data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report 3: Capital vs Selling Price vs Profit */}
                    <div className='bg-white rounded-xl border shadow-sm overflow-hidden min-w-0'>
                        <div className='p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white'>
                            <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                                <div className='bg-[#8D5D93] p-2 rounded-lg flex-shrink-0'>
                                    <Target size={18} className='text-white' />
                                </div>
                                <div className='min-w-0'>
                                    <h2 className='font-bold text-[#3F0E40] text-sm sm:text-base lg:text-lg truncate'>
                                        Capital vs Revenue vs Profit
                                    </h2>
                                    <p className='text-xs text-slate-500 truncate'>
                                        Financial performance by product
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='p-3 sm:p-4 lg:p-5 min-w-0 overflow-x-hidden'>
                            {financialReport.summary && (
                                <div className='grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0'>
                                    <div className='text-center p-2 bg-slate-50 rounded-lg min-w-0 overflow-hidden'>
                                        <p className='text-[10px] text-slate-500 uppercase truncate'>
                                            Total Capital
                                        </p>
                                        <p className='text-xs sm:text-sm font-bold text-[#8D5D93] truncate'>
                                            {formatCurrency(financialReport.summary.totalCapital)}
                                        </p>
                                    </div>
                                    <div className='text-center p-2 bg-slate-50 rounded-lg min-w-0 overflow-hidden'>
                                        <p className='text-[10px] text-slate-500 uppercase truncate'>
                                            Total Revenue
                                        </p>
                                        <p className='text-xs sm:text-sm font-bold text-[#3F0E40] truncate'>
                                            {formatCurrency(financialReport.summary.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className='text-center p-2 bg-slate-50 rounded-lg min-w-0 overflow-hidden'>
                                        <p className='text-[10px] text-slate-500 uppercase truncate'>
                                            Total Profit
                                        </p>
                                        <p className='text-xs sm:text-sm font-bold text-green-900 truncate'>
                                            {formatCurrency(financialReport.summary.totalProfit)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className='w-full' style={{ height: 'clamp(200px, 30vh, 300px)', minHeight: '200px' }}>
                                {financialReport.data.length > 0 ? (
                                    <ResponsiveContainer width='100%' height='100%' minWidth={0}>
                                        <BarChart
                                            data={financialReport.data}
                                            margin={{ bottom: 30, top: 10, right: 10, left: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                axisLine={false} 
                                                tickLine={false}
                                                angle={-35}
                                                textAnchor='end'
                                                interval='preserveStartEnd'
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                tickFormatter={(val) => `₦${(val / 1000)}k`} 
                                                axisLine={false} 
                                                tickLine={false}
                                                width={60}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #3F0E40',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                }}
                                                formatter={(value) => formatCurrency(value)}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" height={36} />
                                            <Bar dataKey="totalCapital" name="Capital" fill="#64748b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="totalSellingPrice" name="Revenue" fill="#3F0E40" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="totalProfit" name="Profit" fill="#14532d" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-slate-400'>
                                        <p>No financial data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

{/* Product Financial Details Table */}
{financialReport.data.length > 0 && (
	<div className='bg-white rounded-xl border shadow-sm overflow-hidden min-w-0'>
		<div className='p-3 sm:p-4 border-b bg-gradient-to-r from-[#3F0E40]/5 via-white to-white'>
			<h3 className='font-bold text-[#3F0E40] text-sm sm:text-base'>
				Product Financial Breakdown
			</h3>
		</div>
		
		{/* Mobile Card View */}
		<div className='block lg:hidden'>
			<div className='divide-y divide-slate-100'>
				{financialReport.data.map((product) => (
					<div key={product.name} className='p-3 sm:p-4 space-y-2 hover:bg-slate-50 transition-colors'>
						<div className='flex items-center justify-between'>
							<h4 className='font-semibold text-[#3F0E40] text-sm'>{product.name}</h4>
							<span
								className={`px-2 py-1 rounded-full text-xs font-bold ${
									product.profitMargin >= 30
										? 'bg-green-100 text-green-900'
										: product.profitMargin >= 15
										? 'bg-[#8D5D93] text-[#ffffff]'
										: 'bg-red-100 text-red-900'
								}`}
							>
								{product.profitMargin.toFixed(1)}%
							</span>
						</div>
						
						<div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs'>
							<div className='flex justify-between'>
								<span className='text-slate-500'>Cost/Unit:</span>
								<span className='font-medium'>{formatCurrency(product.costPrice)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-slate-500'>Price/Unit:</span>
								<span className='font-medium'>{formatCurrency(product.sellingPrice)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-slate-500'>Qty Sold:</span>
								<span className='font-medium'>{product.quantity}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-slate-500'>Profit:</span>
								<span className='font-bold text-green-900'>{formatCurrency(product.totalProfit)}</span>
							</div>
							<div className='flex justify-between col-span-2 pt-1 border-t border-slate-100'>
								<span className='text-slate-500'>Capital:</span>
								<span className='font-medium text-slate-600'>{formatCurrency(product.totalCapital)}</span>
							</div>
							<div className='flex justify-between col-span-2'>
								<span className='text-slate-500'>Revenue:</span>
								<span className='font-medium text-[#3F0E40]'>{formatCurrency(product.totalSellingPrice)}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>

		{/* Desktop Table View */}
		<div className='hidden lg:block overflow-x-auto min-w-0' style={{ WebkitOverflowScrolling: 'touch' }}>
			<table className='w-full text-xs sm:text-sm'>
				<thead className='bg-slate-50 text-slate-600 text-xs uppercase'>
					<tr>
						<th className='p-2 sm:p-3 text-left whitespace-nowrap'>Product</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Cost/Unit</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Price/Unit</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Qty Sold</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Total Capital</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Total Revenue</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Total Profit</th>
						<th className='p-2 sm:p-3 text-right whitespace-nowrap'>Margin</th>
					</tr>
				</thead>
				<tbody>
					{financialReport.data.map((product) => (
						<tr
							key={product.name}
							className='border-b hover:bg-slate-50'
						>
							<td className='p-2 sm:p-3 font-medium text-[#3F0E40] whitespace-nowrap'>
								{product.name}
							</td>
							<td className='p-2 sm:p-3 text-right whitespace-nowrap'>
								{formatCurrency(product.costPrice)}
							</td>
							<td className='p-2 sm:p-3 text-right whitespace-nowrap'>
								{formatCurrency(product.sellingPrice)}
							</td>
							<td className='p-2 sm:p-3 text-right whitespace-nowrap'>{product.quantity}</td>
							<td className='p-2 sm:p-3 text-right text-slate-600 whitespace-nowrap'>
								{formatCurrency(product.totalCapital)}
							</td>
							<td className='p-2 sm:p-3 text-right text-[#3F0E40] font-medium whitespace-nowrap'>
								{formatCurrency(product.totalSellingPrice)}
							</td>
							<td className='p-2 sm:p-3 text-right text-green-900 font-bold whitespace-nowrap'>
								{formatCurrency(product.totalProfit)}
							</td>
							<td className='p-2 sm:p-3 text-right whitespace-nowrap'>
								<span
									className={`px-2 py-1 rounded-full text-xs font-bold ${
										product.profitMargin >= 30
											? 'bg-green-100 text-green-900'
											: product.profitMargin >= 15
											? 'bg-[#8D5D93] text-[#ffffff]'
											: 'bg-red-100 text-red-900'
									}`}
								>
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
