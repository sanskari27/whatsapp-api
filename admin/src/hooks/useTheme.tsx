import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

type MODE = 'light' | 'dark';

const initStatus = 'light';

let globalSet: React.Dispatch<React.SetStateAction<'light' | 'dark'>> = () => {
	throw new Error('you must useTheme before setting its state');
};

export const useTheme = singletonHook(initStatus, () => {
	const darkMode =
		localStorage.theme === 'dark' ||
		(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
	const [mode, setMode] = useState<MODE>(darkMode ? 'dark' : 'light');
	globalSet = setMode;

	useEffect(() => {
		localStorage.setItem('theme', mode);
		if (mode === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			document.documentElement.classList.add('dark');
		}
	}, [mode]);

	return mode;
});

export const toggleTheme = () => {
	globalSet((prev) => (prev === 'light' ? 'dark' : 'light'));
};
