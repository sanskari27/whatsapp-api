import Logger from 'n23-logger';
import { createClient } from 'redis';
import { CACHE_TIMEOUT, CACHE_TOKEN_GENERATOR, REFRESH_CACHE_TIMEOUT } from './const';

const cache = createClient({
	url: 'redis://127.0.0.1:6379',
});

export function getOrCache<T>(key: string, cb: () => Promise<T>) {
	return new Promise((resolve: (value: T) => void, reject) => {
		cache
			.get(key)
			.then(async (value) => {
				if (value) {
					resolve(JSON.parse(value));
					return;
				}
				const updatedData = await cb();
				cache.setEx(key, CACHE_TIMEOUT, JSON.stringify(updatedData));
				resolve(updatedData);
			})
			.catch((err) => {
				Logger.error('Error getting cached: ' + key, err);
			});
	});
}

export function getRefreshTokens() {
	return new Promise((resolve: (value: { [key: string]: string }) => void, reject) => {
		cache
			.get(CACHE_TOKEN_GENERATOR.REFRESH_TOKENS())
			.then(async (value) => {
				if (value) {
					resolve(
						JSON.parse(value) as {
							[key: string]: string;
						}
					);
					return;
				} else {
					resolve({});
				}
			})
			.catch((err) => {});
	});
}

export function saveRefreshTokens(token: string, id: string) {
	return new Promise((resolve: (value: { [key: string]: string }) => void, reject) => {
		return new Promise(async (resolve, reject) => {
			const refreshTokens = await getRefreshTokens();
			refreshTokens[token] = id;
			cache.setEx(
				CACHE_TOKEN_GENERATOR.REFRESH_TOKENS(),
				REFRESH_CACHE_TIMEOUT,
				JSON.stringify(refreshTokens)
			);
			resolve(null);
		});
	});
}

export function removeRefreshTokens(token: string) {
	return new Promise(async (resolve, reject) => {
		const refreshTokens = await getRefreshTokens();
		delete refreshTokens[token];
		cache.setEx(
			CACHE_TOKEN_GENERATOR.REFRESH_TOKENS(),
			REFRESH_CACHE_TIMEOUT,
			JSON.stringify(refreshTokens)
		);
		resolve(null);
	});
}

export default cache;
