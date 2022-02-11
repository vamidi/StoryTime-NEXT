import { authenticated, Claims } from '../../../../middlewares/auth-check';
import { NextApiRequest, NextApiResponse } from 'next';
import cors from '../../../../middlewares/cors';
import { DBClient } from '../../../../middlewares/prisma-client';

const prismaClient = DBClient.getInstance();

/*
export default authenticated(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload: Claims,
) =>
*/
export default async (req: NextApiRequest, res: NextApiResponse) =>
{
	// Run cors
	await cors(req, res);

	if (req.method !== 'DELETE') return res.status(200).json({ errorMessage: 'Not authorized!' });

	// we need the refresh token
	const response: { ref } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	// Split the paths
	const rawPaths = response.ref.split('/');

	// clean up the array.
	const paths = rawPaths.length ? rawPaths.filter((r) => r !== '') : rawPaths;
	const length = paths.length;

	// if we have 1 or more, continue.
	if(length)
	{
		// fetch the table
		const tbl = paths[0];

		if (length > 1) // second one is the child id
		{
			const uid = paths[1];

			// /tables/ckrxgya7g0000egn40skjy7s8
			if(length === 2)
			{
				await prismaClient.prisma[tbl].delete({
					where: {
						uid,
					}
				})
			}
			else // we have a bigger length
				// "/tables/ckrxgya7g0000egn40skjy7s8/revisions/cksegvga70351y0n4lpn75lin"
			{

				console.log(tbl);

				// Get the table which is the second last in the string
				const relTbl = paths[length - 2];

				// Get the id of the relation
				const relUID = paths[length - 1];

				const data = {};
				data[relTbl] = { disconnect: { uid: relUID } };

				const disconnectQuery = prismaClient.prisma[tbl].update({
					where: {
						uid,
					},
					data,
				})

				const deleteQuery = prismaClient.prisma[relTbl].delete({
					where: {
						uid: relUID,
					},
				})

				const transaction = await prismaClient.prisma.$transaction([disconnectQuery, deleteQuery]);

				return res.status(200).json({ err: false, errorMessage: 'Succes!', payload: transaction });
			}
		}
	}

	return res.status(200).json({ err: false, errorMessage: 'Succes!' });
}