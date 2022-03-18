import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { Prisma, dmmf, Users, Projects } from '@prisma/client';
import cors from '../../../../middlewares/cors';
import { DBClient } from '../../../../middlewares/prisma-client';
import { convertTable, getTableIncludes, isRelation, parseTable } from '../../../../data/convertables';
import { deepFind } from '../../../../data/helper.functions';

import merge from 'lodash.merge';
import set from 'lodash.set';

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

	if (req.method !== 'POST')
		return res.status(200).json({ errorMessage: 'Not authorized!' });

	// password: hash,
	const response: { ref, data } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	if(response.data === null || response.data === 'undefined')
		return res.status(200).json({ err: true, errorMessage: 'Data must be filled in and not null' })

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

	// if we have 1 or more, continue.
	if(length)
	{
		const models: any[] = dmmf.datamodel.models;
		let fields: any[] = [];
		const data = response.data;

		// fetch the table
		const tbl = paths[0];

		// TODO see if the table exists.
		let exists = false;
		let inputData$ = null;
		let search: any = null;

		// users -> insert toplevel user
		if(length === 1)
		{
			models.forEach((model) =>
			{
				// if we found the table
				if (model.dbName === tbl)
				{
					exists = true;
					fields = model.fields;
					inputData$ = convertTable(tbl, fields, data);
				}
			});

			if(exists)
			{
				const input = await inputData$;

				if (input)
				{
					search = await prismaClient.prisma[tbl].create({
						data: input,
					});

					return res.status(200).json({ message: "thank you for using Prisma", payload: search });
				}
			}
		}
		else if(length > 1)
		{
			// tables/ckrxgya7g0000egn40skjy7s8/revisions
			const uid = paths[1];

			// get the table from the database
			models.forEach((model) =>
			{
				// if we found the table
				if (model.dbName === tbl)
				{
					exists = true;

					fields = model.fields;
					// fields.forEach((f) => include[f.name] = true);
					inputData$ = parseTable(tbl, uid, fields);
				}
			});

			const input = await inputData$;

			// we need to start from the second value to get a value string
			const lastStr = paths.slice(2, paths.length).join('.');

			// If we have a value then insert new values
			// find the child
			const find = deepFind(input, lastStr);

			if(find)
			{
				let newValue = find;
				if(Array.isArray(find))
				{
					newValue.push(data);
				}
				else {
					// we need to see if it is a relational data
					newValue = merge(find, isRelation(lastStr) ? { newData: data } : data);
				}

				// console.log({lastStr, newValue});
				// return res.status(200).json({ message: "Insert completed", payload: null });

				const outputData$ = await convertTable(tbl, fields, set(input, lastStr, newValue), uid);
				const include = {}
				include[paths[length-1]] = true;
				search = await prismaClient.prisma[tbl].update({
					where: {
						uid,
					},
					data: outputData$,
					include: include,
				});

				if(search)
				{
					return res.status(200).json({ message: "Insert completed", payload: deepFind(input, lastStr) });
				}
			}
		}

		return res.status(200).json({ message: "Insert completed", payload: null });
	}
}
