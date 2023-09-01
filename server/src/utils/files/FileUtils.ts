import fs from 'fs';

const moveFile = (from: string, to: string) => {
	try {
		fs.renameSync(from, to);
		return true;
	} catch (err) {
		return false;
	}
};
const deleteFile = (path: string) => {
	try {
		fs.unlinkSync(path);
	} catch (err) {
		/* empty */
	}
};
const exists = (path: string) => {
	return fs.existsSync(path);
};

const base64removeHeader = (base64: string) => {
	return base64
		.replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
		.replace(/^data:application\/pdf;base64,/, '');
};

const base64ToPDF = async (base64: string, path: string) => {
	const base64Data = base64removeHeader(base64);
	fs.writeFileSync(path, base64Data, 'base64');
};

const base64ToJPG = async (base64: string, path: string) => {
	const base64Data = base64removeHeader(base64);
	fs.writeFileSync(path, base64Data, 'base64');
};

export default { moveFile, deleteFile, exists, base64ToJPG, base64ToPDF };
