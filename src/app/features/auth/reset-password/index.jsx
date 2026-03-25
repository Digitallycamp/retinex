import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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

function ResetPassword() {
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
					Reset Password
				</motion.h1>

				<motion.form className='flex flex-col gap-4'>
					<motion.div>
						<motion.input
							whileFocus={{ scale: 1.02 }}
							type='password'
							placeholder='Enter new password'
							className='w-full h-10 rounded border border-[#e5e5e5] px-4 outline-none focus:border-blue-500 transition'
						/>
					</motion.div>
					<motion.div>
						<motion.input
							whileFocus={{ scale: 1.02 }}
							type='password'
							placeholder='Confirm new password'
							className='w-full h-10 rounded border border-[#e5e5e5] px-4 outline-none focus:border-blue-500 transition'
						/>
					</motion.div>

					<motion.div>
						<motion.button
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							type='submit'
							className='w-full h-10 rounded bg-[#007A5A] text-white px-4 cursor-pointer'
						>
							Reset password
						</motion.button>
					</motion.div>
				</motion.form>
			</motion.div>
		</motion.div>
	);
}

export default ResetPassword;
