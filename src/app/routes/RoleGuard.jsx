import React from 'react';
import { useAuth } from '../core/store/AuthContext';
import { Navigate } from 'react-router-dom';

const role = ['admin', 'manager'];
function RoleGuard({ allowedRole, children }) {
	const { user, loading } = useAuth();

	if (!user) {
		return <Navigate to='/get-started' replace />;
	}
	if (loading) {
		return (
			<div className='w-screen h-full flex justify-center items-center'>
				<p>Loading...</p>
			</div>
		);
	}

	if (user && !role.includes(allowedRole)) {
		return <Navigate to='/unauthorized' />;
	}
	return <>{children}</>;
}

export default RoleGuard;
