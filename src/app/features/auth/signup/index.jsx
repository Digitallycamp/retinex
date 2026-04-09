import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../core/store/AuthContext';
import { toast } from 'react-toastify';
import { getFriendlyMessage } from '../../../../lib/firebase-errors';
import { auth } from '../../../core/firebase/firebase';
import { useSendEmailVerification } from 'react-firebase-hooks/auth';

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: 'easeOut' },
	},
};

function CreateAccount() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const navigate = useNavigate();
	const { user, handleSignOut, loading, signUpWithEmailAndPassword } =
		useAuth();
	const [sendEmailVerification, sending, error] =
		useSendEmailVerification(auth);

	if (error) {
		toast.info(error.message);
	}
	// https://sass-98cbb.firebaseapp.com/__/auth/action
	const handleSignup = async (data) => {
		console.log(data);
		try {
			await signUpWithEmailAndPassword(data.email, data.password);
			const actionCodeSettings = {
				// This must be a whitelisted domain in your Firebase Console
				url: 'http://localhost:5174/get-started',
				handleCodeInApp: true,
			};
			const emailSent = await sendEmailVerification(actionCodeSettings);

			if (emailSent) {
				toast.info(
					'Account created successfully, A veriifcation email has been sent to you'
				);
				await handleSignOut();
				navigate('/get-started');
			}
		} catch (error) {
			const message = getFriendlyMessage(error.code);
			toast.error(message);
		}
	};

	// if (loading) {
	// 	return <p>LOADING....</p>;
	// }
	return (
		<motion.div
			variants={containerVariants}
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
			className='flex justify-center items-center w-full h-screen bg-white'
		>
			<motion.div className='w-[320px]'>
				<motion.h1 className='text-center text-2xl font-bold mb-6'>
					Create account
				</motion.h1>

				<motion.form
					className='flex flex-col gap-4'
					onSubmit={handleSubmit(handleSignup)}
				>
					<motion.div>
						<motion.input
							whileFocus={{ scale: 1.02 }}
							type='email'
							placeholder='Enter email'
							className='w-full h-10 rounded border border-[#e5e5e5] px-4 outline-none focus:border-blue-500 transition'
							{...register('email')}
						/>
						{/* {errors && <p>{errors.email.message}</p>} */}
					</motion.div>

					<motion.div>
						<motion.input
							whileFocus={{ scale: 1.02 }}
							type='password'
							placeholder='Enter password'
							className='w-full h-10 rounded border border-[#e5e5e5] px-4 outline-none focus:border-blue-500 transition'
							{...register('password')}
						/>
						{/* {errors && <p>{errors.password.message}</p>} */}
					</motion.div>

					<motion.div>
						<motion.button
							// disabled={!loading}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							type='submit'
							className='w-full h-10 rounded bg-[#007A5A] text-white px-4 cursor-pointer'
						>
							{/* {loading ? 'Creating account...' : 'Create Account'} */}
							Create Account
						</motion.button>
					</motion.div>
				</motion.form>

				<motion.div className='flex items-center mt-6 gap-2'>
					<hr className='flex-1 border-zinc-200' />
					<span className='text-sm text-zinc-400'>or</span>
					<hr className='flex-1 border-zinc-200' />
				</motion.div>

				<motion.div className='mt-6'>
					<motion.button
						disabled={!loading}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.97 }}
						className='flex items-center justify-center gap-4 cursor-pointer border border-zinc-200 w-full h-10 rounded text-center hover:bg-zinc-50 transition'
					>
						<img src='/googleicon.png' width={24} height={24} />{' '}
						<span>Continue with Google</span>
					</motion.button>
				</motion.div>

				<motion.p variants={itemVariants} className='text-center mt-8'>
					Already have an account?{' '}
					<Link
						to='/get-started'
						className='text-blue-600 hover:underline cursor-pointer'
					>
						Sign in
					</Link>
				</motion.p>
			</motion.div>
		</motion.div>
	);
}

export default CreateAccount;
