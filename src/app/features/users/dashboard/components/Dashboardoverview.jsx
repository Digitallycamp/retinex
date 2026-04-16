import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, LayoutGrid } from 'lucide-react';
import { useProducts } from '../../inventory/ProductContext';

const stats = [
	{
		label: 'TOTAL SALES',
		value: '₦749.00',
		sub: '+12.5% from last month',
		subIcon: <TrendingUp size={12} />,
		icon: <DollarSign size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #3F0E40 0%, #6B21A5 50%, #9D4EDD 100%)',
		glow: 'rgba(107,33,165,0.4)',
	},
	{
		label: 'TOTAL ITEMS',
		value: '12',
		sub: 'Active products in inventory',
		icon: <Package size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #34D399 100%)',
		glow: 'rgba(5,150,105,0.4)',
	},
	{
		label: 'CATEGORIES',
		value: '3',
		sub: 'Product categories',
		icon: <LayoutGrid size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #854D0E 0%, #CA8A04 50%, #FBBF24 100%)',
		glow: 'rgba(202,138,4,0.4)',
	},
];

function StatCard({ label, value, sub, subIcon, icon, gradient, glow, index }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
			className='relative flex-1 min-w-[180px] rounded-2xl overflow-hidden p-5 cursor-default select-none'
			style={{
				background: gradient,
				boxShadow: `0 8px 32px ${glow}`,
			}}
			whileHover={{ scale: 1.02, transition: { duration: 0.2 }, boxShadow: `0 12px 48px ${glow}` }}
		>
			{/* Background icon watermark */}
			<div
				className='absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.15] pointer-events-none'
				style={{ color: 'white' }}
			>
				{icon}
			</div>

			{/* Content */}
			<div className='relative z-10 flex flex-col gap-1'>
				<span
					className='text-[11px] font-bold tracking-widest text-white/80'
					style={{ fontFamily: "'DM Sans', sans-serif" }}
				>
					{label}
				</span>

				<span
					className='text-3xl font-extrabold text-white leading-tight'
					style={{ fontFamily: "'DM Sans', sans-serif" }}
				>
					{value}
				</span>

				<span className='flex items-center gap-1 text-[12px] text-white/75 mt-0.5'>
					{subIcon && <span className='opacity-90'>{subIcon}</span>}
					{sub}
				</span>
			</div>
		</motion.div>
	);
}

export default function DashboardOverview() {
	// Get products from context
	const { getFastMovingProducts, products } = useProducts();
	
	// Get the 4 products with lowest stock (fast-moving)
	const fastMovingProducts = getFastMovingProducts();
	
	// Calculate total items count
	const totalItems = products.reduce((sum, product) => sum + product.stock, 0);
	
	// Get unique categories count
	const uniqueCategories = new Set(products.map(p => p.category)).size;

	// Update stats with real data
	const updatedStats = [
		{
			...stats[0],
			value: '₦749.00',
		},
		{
			...stats[1],
			value: totalItems.toString(),
			sub: `${products.length} active products in inventory`,
		},
		{
			...stats[2],
			value: uniqueCategories.toString(),
			sub: `${uniqueCategories} product categories`,
		},
	];

	return (
		<div className='w-full'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h2
					className='text-2xl font-bold mb-2 pl-3'
					style={{ 
						fontFamily: "'DM Sans', sans-serif",
						background: 'linear-gradient(135deg, #3F0E40 0%, #9D4EDD 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text'
					}}
				>
					Dashboard Overview
				</h2>
				<p className='text-gray-500 text-sm mb-6 pl-3'>Welcome back! Here's what's happening with your store today.</p>
			</motion.div>

			<div className='flex flex-wrap gap-5'>
				{updatedStats.map((stat, i) => (
					<StatCard key={stat.label} {...stat} index={i} />
				))}
			</div>
			
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden mt-6"
				style={{ 
					background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fefce8 100%)',
					boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
				}}
			>
				<div className="p-4 md:p-8">
					<div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderImage: 'linear-gradient(135deg, #3F0E40, #CA8A04) 1' }}>
						<div>
							<h2
								className='text-xl font-bold'
								style={{ 
									fontFamily: "'DM Sans', sans-serif",
									background: 'linear-gradient(135deg, #3F0E40 0%, #CA8A04 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text'
								}}
							>
								Fast-moving products
							</h2>
							<p className='text-sm font-medium text-gray-500 mt-1'>
								Top {fastMovingProducts.length} selling items with lowest stock - need restocking soon
							</p>
						</div>
						<div className="px-3 py-1 rounded-full text-xs font-bold shadow-md" style={{ 
							background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
							color: '#854D0E'
						}}>
							⚠️ Low Stock Alert
						</div>
					</div>
					
					{/* Mobile View */}
					<div className="md:hidden grid grid-cols-1 gap-5 p-2">
						{fastMovingProducts.map((product, idx) => {
							return (
								<motion.div
									key={product.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: idx * 0.1 }}
									className="rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
									style={{ 
										background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
										border: '1px solid rgba(203, 213, 225, 0.3)'
									}}
								>
									<div className="flex justify-between items-start mb-3">
										<div>
											<h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
											<p className="text-sm text-gray-500 mt-0.5">{product.category}</p>
										</div>
										<div className="text-red-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#fee2e2' }}>
											Low Stock
										</div>
									</div>
									<div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
										<span className="text-sm font-semibold text-gray-600">Current Stock:</span>
										<span className="text-lg font-bold text-red-600">{product.stock} units</span>
									</div>
									<div className="flex items-center justify-between mt-2">
										<span className="text-sm font-semibold text-gray-600">Price:</span>
										<span className="text-base font-bold" style={{ color: '#CA8A04' }}>₦{product.price || 50}</span>
									</div>
									<div className="mt-3 pt-2">
										<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
											<motion.div 
												className="h-full rounded-full"
												initial={{ width: 0 }}
												animate={{ width: `${Math.min((product.stock / 250) * 100, 100)}%` }}
												transition={{ duration: 1, delay: idx * 0.1 }}
												style={{ background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}
											></motion.div>
										</div>
										<p className="text-xs text-gray-500 mt-1">📦 Need restocking soon</p>
									</div>
								</motion.div>
							);
						})}
						{fastMovingProducts.length === 0 && (
							<div className="text-center py-10 text-gray-500">
								<Package size={48} className="mx-auto mb-3 text-gray-300" />
								<p>No products in inventory</p>
							</div>
						)}
					</div>

					{/* Desktop View */}
					<div className="hidden md:block overflow-x-auto rounded-xl">
						<table className="w-full text-left">
							<thead>
								<tr style={{ background: 'linear-gradient(to right, #147833, #386d7f, #512888)'  }} className="text-white">
									<th className="p-4 font-bold uppercase text-xs tracking-wider rounded-tl-lg">Product Name</th>
									<th className="p-4 font-bold uppercase text-xs tracking-wider">Category</th>
									<th className="p-4 font-bold uppercase text-xs tracking-wider text-center">Current Stock</th>
									<th className="p-4 font-bold uppercase text-xs tracking-wider text-center">Price</th>
									<th className="p-4 font-bold uppercase text-xs tracking-wider text-center rounded-tr-lg">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{fastMovingProducts.map((product, idx) => {
									return (
										<motion.tr 
											key={product.id} 
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: idx * 0.05 }}
											className="transition-all duration-200 hover:shadow-md"
											style={{ 
												background: idx % 2 === 0 ? 'white' : 'linear-gradient(90deg, #faf5ff, #ffffff)',
												cursor: 'pointer'
											}}
										>
											<td className="p-4 font-semibold text-gray-800">{product.name}</td>
											<td className="p-4 text-gray-600">{product.category}</td>
											<td className="p-4 text-center">
												<span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold min-w-[80px] shadow-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
													{product.stock} units
												</span>
											</td>
											<td className="p-4 text-center">
												<span className="text-base font-bold" style={{ color: '#CA8A04' }}>₦{product.price || 50}</span>
											</td>
											<td className="p-4 text-center">
												<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
													⚠️ Critical Stock
												</span>
											</td>
										</motion.tr>
									);
								})}
								{fastMovingProducts.length === 0 && (
									<tr>
										<td colSpan="5" className="p-10 text-center text-gray-500">
											No products found in inventory
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</motion.div>
		</div>
	);
}