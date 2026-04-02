import { createContext, useEffect, useState } from 'react';
import { useContext } from 'react';
import { auth } from '../firebase/firebase';
import {
	useAuthState,
	useCreateUserWithEmailAndPassword,
	useSignInWithEmailAndPassword,
	useSignOut,
} from 'react-firebase-hooks/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, globalLoading, userError] = useAuthState(auth);

	const [signOut, signOutLoading, signOutError] = useSignOut(auth);
	const [
		createUserWithEmailAndPassword,
		registerUser,
		registerLoading,
		registerError,
	] = useCreateUserWithEmailAndPassword(auth);
	const [signInWithEmailAndPassword, authLoading, authError] =
		useSignInWithEmailAndPassword(auth);

	const handleSignOut = async () => {
		const result = await signOut();
		if (!result) {
			throw signOutError;
		}
		return result;
	};

	const signUpWithEmailAndPassword = async (email, password) => {
		const result = await createUserWithEmailAndPassword(email, password);
		if (!result) {
			// This ensures the 'catch' block in your CreateAccount component triggers
			throw registerError;
		}
		return result;
	};
	const signInUserWithEmailAndPassword = async (email, password) => {
		const result = await signInWithEmailAndPassword(email, password);
		if (!result) {
			throw authError;
		}
		return result;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading:
					globalLoading || authLoading || registerLoading | signOutLoading,
				error: registerError,
				authError,

				signUpWithEmailAndPassword,
				signInUserWithEmailAndPassword,
				handleSignOut,
			}}
		>
			{!globalLoading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('Hook must be used with a provider');
	}

	return context;
};
