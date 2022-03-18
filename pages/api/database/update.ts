import { NextApiRequest, NextApiResponse } from 'next';

import set from 'lodash.set';

// @ts-ignore
import { dmmf, Users, Projects } from '@prisma/client';
import cors from '../../../../middlewares/cors';
import { DBClient } from '../../../../middlewares/prisma-client';
import { convertTable, parseTable } from '../../../../data/convertables';
import { deepFind } from '../../../../data/helper.functions';

const prismaClient = DBClient.getInstance();

// "tables/ckrxgz7in0086egn48xbodkcv/revisions"

/*
export default authenticated(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload: Claims,
) =>
*/

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Run cors
	await cors(req, res);

	if (req.method !== 'POST')
		return res.status(200).json({ errorMessage: 'Not authorized!' });

	// password: hash,
	const response: { ref, data } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	if(response.data === null || typeof response.data === 'undefined')
		return res.status(200).json({ err: true, errorMessage: 'Data must be filled in and not null' });

	// paradigm
	// for example ref => tbl/child
	// if not that means it is the child.
	// if child is a relation then we need to update that relation.
	// if we have another child -> tbl/child/child then we need to fetch the relation
	// and update that child in the relation.


	// Split the paths
	const rawPaths = response.ref.split('/');

	// clean up the array.
	const paths = rawPaths.length ? rawPaths.filter((r) => r !== '') : rawPaths;
	const length = paths.length;

	const models: any[] = dmmf.datamodel.models;

	// if we have 1 or more, continue.
	if(length)
	{
		const data = response.data;

		// TODO fetch the field of the table

		// fetch the table
		const tbl = paths[0];

		// TODO see if the table exists.
		let exists = false;

		// users/ckrum2j4v0000t4n4kabehxsc

		let inputData$: Promise<any> = null;
		if (length > 1) // second one is the child id
		{
			const uid = paths[1];

			let fields: any[] = [];
			models.forEach((model) =>
			{
				// if we found the table
				if (model.dbName === tbl)
				{
					exists = true;

					fields = model.fields;
					inputData$ = parseTable(tbl, uid, fields);
				}
			});

			if(length === 2)
			{
				if (inputData$ && exists)
				{
					// If we have a value then insert new values
					let newValue = {
						...await inputData$,
						...data,
					}

					const outputData$ = await convertTable(tbl, fields, newValue, uid);

					await prismaClient.prisma[tbl].update({
						where: {
							uid,
						},
						data: outputData$,
					});

					// console.log(search);
					return res.status(200).json({ err: false, message: "Query successfully updated" });
				}
			}
			else
			{
				// Use limiter if we need to find data which is bigger than 100 rows.
				// tables/ckrxgya7g0000egn40skjy7s8/data/0
				// search for the table
				if (inputData$ && exists)
				{
					const input = await inputData$;

					console.log(input);

					// we need to start from the second value to get a value string
					const lastStr = paths.slice(2, paths.length).join('.');

					// If we have a value then insert new values
					// find the child
					const find = deepFind(input, lastStr);

					if(find)
					{
						// If we have a value then insert new values
						let newValue = {
							...find,
							...data,
						}

						// _.set(object, 'a[0].b.c', 4);

						const outputData$ = await convertTable(tbl, fields, set(input, lastStr, newValue), uid);
						await prismaClient.prisma[tbl].update({
							where: {
								uid,
							},
							data: outputData$,
						});
					}
				}
			}

			// if we are going even further.
			// we have to recursively grab what the user wants.
		}// else
		// search = await prismaClient.prisma[tbl].create({ data, });
		return res.status(200).json({ message: "Insert completed", payload: null });
	}
}
