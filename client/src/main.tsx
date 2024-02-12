import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import store from './store/store.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ChakraProvider toastOptions={{ defaultOptions: { position: 'top', variant: 'left-accent' } }}>
			<Provider store={store}>
				<App />
			</Provider>
		</ChakraProvider>
	</React.StrictMode>
);
