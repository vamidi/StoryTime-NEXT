import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedMiddleware, Claims } from '../../../../../middlewares/auth-check';
import { database } from '../../../../../config/serverApp';
import { isFirebase, parseNodeData } from '../../../../../config/utils';

export default authenticatedMiddleware(async (
	req: NextApiRequest,
	res: NextApiResponse,
	_?: Claims,
) => {

	if(req.method !== 'GET') return res.status(401).json({ errorMessage: 'Not authorized!'});

	const { project } = req.query;
	if (!project) return res.status(401).json({ "error_msg": `No project ${project} parameters found` });

	const response = [];

	if(isFirebase)
	{
		const snapshot = await database.ref('tables').orderByChild('projectID').equalTo(project as string).once('value');

		if(snapshot.exists())
		{
			const tables = snapshot.val();
			for (const [key, table] of Object.entries<any>(tables)) {
				table.id = key;

				if(table.hasOwnProperty('data'))
				{
					// we are dealing with the story table
					// TODO we need to remove unnecessary data.
					const title = table.metadata.title === 'stories' ? 'stories' : 'craftables';
					const query = title === "stories" ? 'storyId' : 'itemId';

					if(table.metadata.title === 'stories' || table.metadata.title === 'items')
					{
						const promises: Promise<void>[] = [];

						table.data.forEach((row: any, rowId: number) => {
							table.data[rowId].data = null;
							promises.push(
								database.ref(title).orderByChild(query).equalTo(rowId).limitToFirst(1).once('value')
									.then((storySnapshot) => {
										if(storySnapshot.exists()) {
											const storyValue = storySnapshot.val();

											for (const [id, story] of Object.entries<any>(storyValue))
											{
												if (story.hasOwnProperty('url') && story.url !== "")
												{
													return parseNodeData(story["url"], table["data"][id]).then((contents) => {
														table.data[rowId].data = contents;
													});
												}
											}
										}
									}
								)
							);
						});

						// unwrap all promises
						await Promise.all(promises);
					}
				}

				response.push(table);
			}

			return res.status(200).json(response);
		}
	}

	res.status(404).json({ message: 'tables not found' });
});
