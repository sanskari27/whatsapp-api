import mongoose from 'mongoose';
import { DATABASE_URL } from './const';

export default function () {
	return new Promise((resolve, reject) => {
		mongoose.set('strictQuery', false);
		mongoose
			.connect(DATABASE_URL)

			.then(() => {
				resolve('Successfully connected to database');
			})
			.catch((error) => {
				reject(error);
			});
	});
}
