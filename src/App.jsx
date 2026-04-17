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
import Inventory from './app/features/users/inventory';
// import FullSupplierForm from './app/features/users/add_supplier';
// import AddProductForm from './app/features/users/add_inventory/index2';
import { ProductProvider } from './app/features/users/inventory/ProductContext';
import ProductForm from './app/features/users/add_inventory/createproduct';
import Settings from './app/features/users/settings_page';
import AddSupplier from './app/features/users/add_inventory/index2';
// import AddSupplierForm from './app/features/users/add_supplier';


function App() {
	return (
		<>
			<AuthProvider>
				<ProductProvider>
				<Routes>
					<Route element={<MainLayout />}>
						
						<Route path='/about-us' element={<div>About us</div>} />
						<Route
							path='/'
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
						<Route path='/create-product' element={< ProductForm />} />
						<Route path='/inventory' element={<Inventory />} />
						<Route path='/settings' element={<Settings />} />
						{/* <Route path='/add-supplier' element={<FullSupplierForm/>} /> */}
						<Route path='/add-supplie' element={<AddSupplier/>} />
						<Route path='/unauthorized' element={<UnAuthorized />} />
					</Route>
				</Routes>
				</ProductProvider>
			</AuthProvider>
		</>
	);
}

export default App;
