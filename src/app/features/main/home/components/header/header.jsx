import React from 'react';
import { NavLink } from 'react-router-dom';

function Header() {
	return (
		<nav className=' flex justify-between items-center w-full h-16 border border-b border-b-gray-400 '>
			<NavLink
				className={({ isActive }) => (isActive ? 'text-red-900' : '')}
				to='/'
			>
				Home
			</NavLink>
			<NavLink
				className={({ isActive }) => (isActive ? 'text-amber-950' : '')}
				to='/about-us'
			>
				About us
			</NavLink>
			<NavLink
				className={({ isActive }) => (isActive ? 'text-amber-950' : '')}
				to='/get-started'
			>
				Get started
			</NavLink>
		</nav>
	);
}

export default Header;
