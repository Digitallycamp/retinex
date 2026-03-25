import { Route, Routes } from 'react-router-dom';
import Home from './app/features/main/home';
import Header from './app/features/main/home/components/header/header';
import Footer from './app/features/main/home/components/footer';
import GetStarted from './app/features/auth/login';
import CreateAccount from './app/features/auth/signup';
import ForgotPassword from './app/features/auth/forgot-password';
import ResetPassword from './app/features/auth/reset-password';
import Dashboard from './app/features/users/dashboard';
import MainLayout from './app/features/main/home/components/MainLayout';
import DashboardOverview from './app/features/users/dashboard/components/Dashboardoverview';
import { AuthProvider } from './app/core/store/AuthContext';

function App() {
	return (
		<>
			<AuthProvider>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path='/' element={<Home />} />
						<Route path='/about-us' element={<div>About us</div>} />
						<Route path='/get-started' element={<GetStarted />} />
						<Route path='/create-account' element={<CreateAccount />} />
						<Route path='/forgot-password' element={<ForgotPassword />} />
						<Route path='/reset-password' element={<ResetPassword />} />
					</Route>

					<Route element={<Dashboard />}>
						<Route path='/dashboard' element={<DashboardOverview />} />
						<Route path='/inventory' element={<div>Inventory</div>} />
					</Route>
				</Routes>
			</AuthProvider>
		</>
	);
}

export default App;
