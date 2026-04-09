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
import AuthGuard from './app/routes/guard/AuthGuard';
import ProtectedRouted from './app/routes/ProtectedRouted';
import UnAuthorized from './app/features/users/unauthorized';
import VerifyEmailPage from './app/features/auth/verify-email';
import AddInventoryPage from './app/features/users/add_inventory';

function App() {
	return (
		<>
			<AuthProvider>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path='/' element={<Home />} />
						<Route path='/about-us' element={<div>About us</div>} />
						<Route
							path='/get-started'
							element={
								<AuthGuard>
									<GetStarted />
								</AuthGuard>
							}
						/>
						<Route
							path='/create-account'
							element={
								<AuthGuard>
									<CreateAccount />
								</AuthGuard>
							}
						/>

						<Route path='/forgot-password' element={<ForgotPassword />} />
						<Route path='/reset-password' element={<ResetPassword />} />
					</Route>
					<Route
						path='/verify-email'
						element={
							<AuthGuard>
								<VerifyEmailPage />
							</AuthGuard>
						}
					/>
					<Route
						element={
							<ProtectedRouted>
								<Dashboard />
							</ProtectedRouted>
						}
					>
						<Route path='/dashboard' element={<DashboardOverview />} />
						<Route path='/add-inventory' element={<AddInventoryPage />} />
						<Route path='/inventory' element={<div>Inventory</div>} />
						<Route path='/unauthorized' element={<UnAuthorized />} />
					</Route>
				</Routes>
			</AuthProvider>
		</>
	);
}

export default App;
