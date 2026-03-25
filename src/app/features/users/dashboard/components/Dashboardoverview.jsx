import { DollarSign, Package, LayoutGrid, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
	{
		label: 'TOTAL SALES',
		value: '₱749.00',
		sub: '+12.5% from last month',
		subIcon: <TrendingUp size={12} />,
		icon: <DollarSign size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
		glow: 'rgba(34,197,94,0.35)',
	},
	{
		label: 'TOTAL ITEMS',
		value: '12',
		sub: 'Active products in inventory',
		icon: <Package size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)',
		glow: 'rgba(59,130,246,0.35)',
	},
	{
		label: 'CATEGORIES',
		value: '3',
		sub: 'Product categories',
		icon: <LayoutGrid size={48} strokeWidth={1.2} />,
		gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7e22ce 100%)',
		glow: 'rgba(168,85,247,0.35)',
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
			whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
		>
			{/* Background icon watermark */}
			<div
				className='absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.18] pointer-events-none'
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
	return (
		<div className='w-full'>
			<h2
				className='text-lg font-semibold text-gray-800 mb-4'
				style={{ fontFamily: "'DM Sans', sans-serif" }}
			>
				Dashboard Overview
			</h2>

			<div className='flex flex-wrap gap-4'>
				{stats.map((stat, i) => (
					<StatCard key={stat.label} {...stat} index={i} />
				))}
			</div>
		</div>
	);
}
