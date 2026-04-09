import { applyActionCode } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../../../core/firebase/firebase';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function VerifyEmailPage() {
	const [isVerified, setIVerified] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const oobCode = searchParams.get('oobCode');

	useEffect(() => {
		if (oobCode) {
			applyActionCode(auth, oobCode)
				.then(() => {
					setIVerified(true);

					setTimeout(() => {
						toast.success('Email verified! You can now log in');

						navigate('/get-started');
					}, 4000);
				})
				.catch((error) => {
					console.log(error);

					toast.error('Invalid or expired link');
				});
		}
	}, [oobCode, navigate]);

	return (
		<div className='w-screen h-screen flex items-center justify-center'>
			<div className='max-w-[512px]'>
				<p>Verifying your email, please wait...</p>
				{isVerified && <DotLottieReact src='/Success.lottie' loop autoplay />}
			</div>
		</div>
	);
}

export default VerifyEmailPage;
