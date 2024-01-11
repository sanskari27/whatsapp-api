import APIInstance from '../config/APIInstance';

export default class UploadsService {
    static async uploadAttachment(data: {
        file: File;
        name: string;
        caption: string;
    }) {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.name);
        formData.append('caption', data.caption);
        try {
            const { data: response } = await APIInstance.post(
                `/uploads/attachment`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.attachment as {
                id: string;
                name: string;
                filename: string;
                caption?: string;
            };
        } catch (err) {
            return null;
        }
    }

    static async listAttachments() {
        try {
            const { data: response } = await APIInstance.get(
                `/uploads/attachment`
            );
            return response.attachments as {
                id: string;
                name: string;
                caption: string;
                filename: string;
            }[];
        } catch (err) {
            return [];
        }
    }

    static async uploadCSV(data: { file: File; name: string }) {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.name);
        try {
            const { data: response } = await APIInstance.post(
                `/uploads/csv`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return {
                name: response.name,
                id: response.filename,
                headers: response.headers,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.response.data.title === 'ALREADY_EXISTS')
                return {
                    name: 'ERROR',
                    id: 'File name already exists',
                    headers: [],
                };
            if (err.response.data.title === 'INVALID_FIELDS')
                return {
                    name: 'ERROR',
                    id: 'Invalid Fields in CSV',
                    headers: [],
                };

            return { name: 'ERROR', id: 'Something went wrong', headers: [] };
        }
    }

    static async listCSV() {
        try {
            const { data: response } = await APIInstance.get(`/uploads/csv`);
            return response.csv_list.map(
                (csv: {
                    name: string;
                    filename: string;
                    headers: string[];
                    id: string;
                }) => ({
                    name: csv.name,
                    id: csv.filename,
                    headers: csv.headers,
                    _id: csv.id,
                })
            );
        } catch (err) {
            return [];
        }
    }
    static async deleteCSV(id: string) {
        try {
            await APIInstance.delete(`/uploads/csv/${id}`);
            return true;
        } catch (err) {
            return false;
        }
    }
}
