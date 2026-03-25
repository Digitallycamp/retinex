import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, Outlet } from 'react-router-dom';
import {
	Home,
	Wand2,
	Trophy,
	PlusCircle,
	Tag,
	Scissors,
	ScanFace,
	BookOpen,
	Users,
	Handshake,
	UserCircle,
	ChevronDown,
	Zap,
	Menu,
	X,
} from 'lucide-react';
import { uiColor } from '../../../core/theme';

// ── Nav structure mirrors the screenshot exactly ──
const navSections = [
	{
		items: [{ label: 'Home', icon: Home, link: 'dashboard' }],
	},
	{
		items: [
			{ label: 'Magic Thumbnails', icon: Wand2, link: 'inventory' },
			{ label: 'Winning Templates', icon: Trophy, link: 'templates' },
		],
	},
	{
		label: 'Projects',
		items: [
			{ label: 'Create new', icon: PlusCircle, link: 'create' },
			{ label: 'Black Friday', icon: Tag, link: 'black-friday' },
			{ label: 'ClipMagic', icon: Scissors, link: 'clipmagic' },
		],
	},
	{
		items: [
			{ label: 'A.I. Face Cloning', icon: ScanFace, link: 'face-cloning' },
		],
	},
	{
		label: 'TRAINING',
		items: [
			{ label: 'Tutorials', icon: BookOpen, link: 'tutorials' },
			{ label: 'Facebook Group', icon: Users, link: 'facebook-group' },
			{ label: 'Affiliate Partners', icon: Handshake, link: 'affiliate' },
		],
	},
];

function SidebarContent({ onClose }) {
	return (
		<div
			className='flex flex-col h-full'
			style={{
				background: `linear-gradient(180deg, ${uiColor.bg} 0%, ${uiColor.bg}  50%, ${uiColor.bg} 100%)`,
			}}
		>
			{/* Logo row */}
			<div className='flex items-center justify-between px-4 pt-4 pb-3'>
				<div className='flex items-center gap-2.5'>
					<div className='relative w-7 h-7'>
						<div className='absolute inset-0 rounded-md bg-yellow-600 opacity-90' />
						<div className='absolute left-0 top-1.5 w-7 h-5 rounded bg-green-900 opacity-90' />
						<svg className='absolute inset-0 w-7 h-7' viewBox='0 0 28 28'>
							<polyline
								points='5,15 11,21 22,8'
								fill='none'
								stroke='white'
								strokeWidth='2.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
					<span
						style={{ fontFamily: 'Georgia, serif' }}
						className='text-2xl font-bold tracking-tight'
					>
						<span className='text-yellow-600'>Recti</span>
						<span className='text-green-900'>nex</span>
					</span>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className='text-purple-300/60 hover:text-white transition-colors p-1 rounded'
					>
						<X size={16} />
					</button>
				)}
			</div>

			{/* Nav */}
			<nav className='flex-1 overflow-y-auto px-2 py-1 space-y-px'>
				{navSections.map((section, si) => (
					<div key={si} className={si > 0 ? 'pt-2' : ''}>
						{section.label && (
							<p className='text-[9px] font-bold tracking-[0.15em] text-purple-400/50 uppercase px-3 pt-1 pb-1.5'>
								{section.label}
							</p>
						)}
						{section.items.map((item) => {
							const Icon = item.icon;
							return (
								<NavLink
									key={item.link}
									to={`/${item.link}`}
									onClick={onClose}
									className={({ isActive }) =>
										`flex items-center gap-2.5 px-3 py-1.75 rounded-lg text-[13px] font-medium transition-all duration-150 ${
											isActive
												? 'bg-white/12 text-white'
												: 'text-purple-200/60 hover:bg-white/6 hover:text-purple-100/90'
										}`
									}
								>
									<Icon size={14} className='shrink-0' />
									<span className='truncate'>{item.label}</span>
								</NavLink>
							);
						})}
					</div>
				))}
			</nav>

			{/* My Account footer */}
			<div className='px-3 py-3 border-t border-white/8'>
				<button className='w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors'>
					<div className='w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0'>
						<UserCircle size={15} className='text-purple-300' />
					</div>
					<span className='text-[13px] text-purple-200 font-medium flex-1 text-left truncate'>
						My Account
					</span>
					<ChevronDown size={12} className='text-purple-400/70 shrink-0' />
				</button>
			</div>
		</div>
	);
}

export default function Dashboard() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div
			className='flex w-full min-h-screen '
			style={{ backgroundColor: `${uiColor.bg}` }}
		>
			{/* ── Desktop sidebar ── */}
			<aside className='hidden md:block w-50 shrink-0 fixed inset-y-0 left-0 z-40'>
				<SidebarContent />
			</aside>

			{/* ── Mobile drawer + backdrop ── */}
			<AnimatePresence>
				{mobileOpen && (
					<>
						<motion.div
							key='backdrop'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden'
							onClick={() => setMobileOpen(false)}
						/>
						<motion.aside
							key='drawer'
							initial={{ x: -200 }}
							animate={{ x: 0 }}
							exit={{ x: -200 }}
							transition={{ type: 'spring', stiffness: 340, damping: 34 }}
							className='fixed inset-y-0 left-0 w-50 z-60 md:hidden'
						>
							<SidebarContent onClose={() => setMobileOpen(false)} />
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* ── Main content ── */}
			<div className='flex flex-col flex-1 md:ml-50 min-h-screen'>
				{/* Mobile topbar */}
				<header
					className='md:hidden flex items-center justify-between px-4 py-3 border-b border-purple-900/30'
					style={{
						background: `linear-gradient(90deg, ${uiColor.bg} , ${uiColor.bg} `,
					}}
				>
					<button
						onClick={() => setMobileOpen(true)}
						className='p-2 rounded-lg bg-white/10 text-white active:bg-white/20'
					>
						<Menu size={17} />
					</button>
					<div className='flex items-center gap-2.5'>
						<div className='relative w-7 h-7'>
							<div className='absolute inset-0 rounded-md bg-yellow-600 opacity-90' />
							<div className='absolute left-0 top-1.5 w-7 h-5 rounded bg-green-900 opacity-90' />
							<svg className='absolute inset-0 w-7 h-7' viewBox='0 0 28 28'>
								<polyline
									points='5,15 11,21 22,8'
									fill='none'
									stroke='white'
									strokeWidth='2.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
						<span
							style={{ fontFamily: 'Georgia, serif' }}
							className='text-2xl font-bold tracking-tight'
						>
							<span className='text-yellow-600'>Recti</span>
							<span className='text-green-900'>nex</span>
						</span>
					</div>
					<div className='w-9' /> {/* balance spacer */}
				</header>

				{/* Page content */}
				<main className='flex-1 p-3 md:p-4 overflow-auto'>
					<section className='bg-white rounded-t-xl shadow-sm min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-2rem)] p-4'>
						<Outlet />
					</section>
				</main>
			</div>
		</div>
	);
}
