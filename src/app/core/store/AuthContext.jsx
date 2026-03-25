import { createContext } from 'react';
import { useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	return <AuthContext.Provider>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('Hook must be used with a provider');
	}

	return context;
};
