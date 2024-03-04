import Logger from 'n23-logger';
import { createClient } from 'redis';
import { CACHE_TIMEOUT, CACHE_TOKEN_GENERATOR, REFRESH_CACHE_TIMEOUT } from './const';

const cache = createClient({
	url: 'redis://127.0.0.1:6379',
});

export async function getOrCache<T>(key: string, cb: () => Promise<T>) {
	try {
		const value = await cache.get(key);
		if (value) {
			return JSON.parse(value) as T;
		}
	} catch (err) {
		Logger.error('ERROR-CACHE: Error fetching Data ' + key, err as Error);
	}
	try {
		const updatedData = await cb();
		cache.setEx(key, CACHE_TIMEOUT, JSON.stringify(updatedData));
		return updatedData as T;
	} catch (err) {
		Logger.error('ERROR-CACHE: Error Generating Data ' + key, err as Error);
	}
	throw new Error('Error generating cache');
}

export function saveToCache(key: string, value: string | string[] | number | object) {
	return new Promise(async (resolve, reject) => {
		cache.setEx(key, CACHE_TIMEOUT, JSON.stringify(value));
		resolve(null);
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
