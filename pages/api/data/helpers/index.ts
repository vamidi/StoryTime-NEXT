
interface QueryIndex
{
	indexPath: {
		pieces: string[],
		pieceNum: number,
	},
}

export interface QueryParams {
	limitSet?: boolean,
	startSet?: boolean,
	startNameSet?: boolean,
	startAfterSet?: boolean,
	endSet?: boolean,
	endNameSet?: boolean,
	endBeforeSet?: boolean,
	limit?: number,
	viewFrom?: string,
	indexStartValue?: number,
	indexStartName?: string,
	indexEndValue?: number,
	indexEndName?: string,
	index?: QueryIndex,
}

export function deepFind(obj: any, path: string) {
	let paths = path.split('.')
		, current = obj
		, i;

	for (i = 0; i < paths.length; ++i) {
		if (current[paths[i]] == undefined) {
			return undefined;
		} else {
			current = current[paths[i]];
		}
	}
	return current;
}
