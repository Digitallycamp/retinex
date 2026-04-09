import React, { useState } from 'react';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
	ChevronLeft,
	Package,
	LayoutGrid,
	CircleDollarSign,
	Box,
} from 'lucide-react';
import { db } from '../../../core/firebase/firebase';
import { useAuth } from '../../../core/store/AuthContext';

function AddInventory() {
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [product, setProduct] = useState({
		name: '',
		category: '',
		price: '',
		cost: '',
		initialStock: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProduct((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			await addDoc(collection(db, 'products'), {
				product_name: product.name,
				product_image: 'ajjja',
				category: product.category,
				price: parseFloat(product.price) || 0,
				company: 'Lios ltd',
				user_id: user.uid,
				cost: parseFloat(product.cost) || 0,
				initial_stock: parseInt(product.initialStock) || 0,
				createdAt: serverTimestamp(),
			});

			alert('Product added successfully!');
			setProduct({
				name: '',
				category: '',
				price: '',
				cost: '',
				initialStock: '',
			});
		} catch (error) {
			console.error('Error adding product: ', error);
			alert('Failed to add product.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-slate-50 flex flex-col'>
			{/* Top Bar */}
			<header className='bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10'>
				<div className='flex items-center gap-4'>
					<button className='p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500'>
						<ChevronLeft size={20} />
					</button>
					<h1 className='text-xl font-bold text-slate-800'>
						New Inventory Item
					</h1>
				</div>
			</header>

			<main className='flex-1 max-w-4xl mx-auto w-full p-6 lg:p-10'>
				<form
					onSubmit={handleSubmit}
					className='grid grid-cols-1 lg:grid-cols-3 gap-8'
				>
					{/* Left Column: Form Details */}
					<div className='lg:col-span-2 space-y-6'>
						<section className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4'>
							<div className='flex items-center gap-2 mb-2 text-blue-600 font-semibold uppercase text-xs tracking-wider'>
								<LayoutGrid size={16} />
								General Information
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-slate-700'>
									Product Name *
								</label>
								<input
									required
									name='name'
									type='text'
									value={product.name}
									onChange={handleChange}
									placeholder='e.g. Mechanical Keyboard'
									className='w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
								/>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-slate-700'>
									Category *
								</label>
								<input
									required
									name='category'
									type='text'
									value={product.category}
									onChange={handleChange}
									placeholder='e.g. Peripherals'
									className='w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
								/>
							</div>
						</section>

						<section className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4'>
							<div className='flex items-center gap-2 mb-2 text-green-600 font-semibold uppercase text-xs tracking-wider'>
								<CircleDollarSign size={16} />
								Pricing & Finance
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-1'>
									<label className='text-sm font-medium text-slate-700'>
										Price (₱) *
									</label>
									<input
										required
										name='price'
										type='number'
										step='0.01'
										value={product.price}
										onChange={handleChange}
										placeholder='0.00'
										className='w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
									/>
								</div>
								<div className='space-y-1'>
									<label className='text-sm font-medium text-slate-700'>
										Cost (₱)
									</label>
									<input
										name='cost'
										type='number'
										step='0.01'
										value={product.cost}
										onChange={handleChange}
										placeholder='0.00'
										className='w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
									/>
								</div>
							</div>
						</section>
					</div>

					{/* Right Column: Inventory & Status */}
					<div className='space-y-6'>
						<section className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4'>
							<div className='flex items-center gap-2 mb-2 text-orange-600 font-semibold uppercase text-xs tracking-wider'>
								<Box size={16} />
								Inventory
							</div>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-slate-700'>
									Initial Stock Level
								</label>
								<input
									name='initialStock'
									type='number'
									value={product.initialStock}
									onChange={handleChange}
									placeholder='0'
									className='w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
								/>
							</div>
						</section>

						<div className='flex flex-col gap-3'>
							<button
								type='submit'
								disabled={loading}
								className='w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all disabled:opacity-50'
							>
								{loading ? 'Processing...' : 'Add to Inventory'}
							</button>
							<button
								type='button'
								className='w-full bg-white text-slate-600 font-semibold py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all'
							>
								Cancel
							</button>
						</div>
					</div>
				</form>
			</main>
		</div>
	);
}

export default AddInventory;
