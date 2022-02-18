import { bucket } from './serverApp';

export const isFirebase: boolean = (process.env.DATABASE_PROVIDER ?? '') === 'firebase';

/**
 * @param url
 * @param rowData
 * @return Promise<void>
 */
export async function parseNodeData(url: string, rowData: any): Promise<any> {
	const lastOccur = url.lastIndexOf('/');
	const substr = url.substr(lastOccur + 1);
	const explode = substr.split('?');
	const reference = decodeURIComponent(explode[0]);

	const buffer = await bucket.file(reference).download();
	const object: string = buffer.toString();
	if (object !== '')
	{
		return JSON.parse(object);
	}

	return Promise.reject('can\'t find file');
}
