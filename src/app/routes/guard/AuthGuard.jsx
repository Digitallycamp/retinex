import React from 'react';
import { useAuth } from '../../core/store/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

function AuthGuard({ children }) {
	const { user, loading } = useAuth();
	console.log(loading);
	if (loading) {
		return (
			<div className='w-screen h-full flex justify-center items-center'>
				<p>Loading...</p>
			</div>
		);
	}
	console.log(user);
	if (user) {
		return <Navigate to='/dashboard' replace />;
	}
	return <>{children}</>;
}

export default AuthGuard;
