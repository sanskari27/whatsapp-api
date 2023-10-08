import { useEffect, useState } from 'react';

type MODE = 'light' | 'dark';

export default function useTheme() {
	const darkMode =
		localStorage.theme === 'dark' ||
		(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

	const [mode, setMode] = useState<MODE>(darkMode ? 'dark' : 'light');

	const toggleTheme = () => {
		setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	useEffect(() => {
		localStorage.setItem('theme', mode);
		if (mode === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			document.documentElement.classList.add('dark');
		}
	}, [mode]);

	return { theme: mode, toggleTheme };
}
