import { Server } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { Users, dmmf } from '@prisma/client';

// import { authenticated, Claims } from '../../../../middlewares/auth-check';
import { DBClient } from '../../../../middlewares/prisma-client';
import cors from '../../../../middlewares/cors';
import { parseTable, queryTable } from '../../../../data/convertables';
import { deepFind } from '../../../../data/helper.functions';

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

	if(req.method !== 'POST')
		return 	res.status(200).json({ errorMessage: 'Not authorized!'});

	// password: hash,
	const response: any = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
	if(response.ref === null || typeof response.ref === 'undefined')
		return res.status(200).json({ err: true, errorMessage: 'We have no reference, this must be filled in and not null' });

	const io: Server = (<any>req).context.io;
	io.on("connection", socket => {
		socket.emit("hello", 1, "2", { 3: '4', 5: Buffer.from([6]) });

		/*
		let previousId;

		const safeJoin = currentId => {
			socket.leave(previousId);
			socket.join(currentId);
			console.log(`Socket ${socket.id} joined room ${currentId}`);
			previousId = currentId;
		};

		socket.on("getDoc", docId => {
			safeJoin(docId);
			socket.emit("document", documents[docId]);
		});

		socket.on("addDoc", doc => {
			documents[doc.id] = doc;
			safeJoin(doc.id);
			io.emit("documents", Object.keys(documents));
			socket.emit("document", doc);
		});

		socket.on("editDoc", doc => {
			documents[doc.id] = doc;
			socket.to(doc.id).emit("document", doc);
		});


		io.emit("documents", Object.keys(documents));
		*/
		socket.on('disconnect', () => {
			console.log(socket.id, 'disconnected');

			socket.removeAllListeners('hello');
			socket.removeAllListeners('disconnect');
			io.removeAllListeners('connection');
		});

		console.log(`Socket ${socket.id} has connected`);
	});

	// paradigm
	// for example ref => tbl/uid/metadata
	const rawPaths = response.ref.split('/');

	// clean up the array.
	const paths = rawPaths.length ? rawPaths.filter((r) => r !== '') : rawPaths;

	const length = paths.length;
	const models: any[] = dmmf.datamodel.models;

	if(length)
	{
		const tbl = paths[0];

		let search: any = null;
		let inputData$ = null;
		if (paths.length > 1) // second one is the child id
		{
			const uid = paths[1];
			let fields: any[] = [];

			models.forEach((model) => {
				// if we found the table
				if (model.dbName === tbl) {
					fields = model.fields;
					inputData$ = parseTable(tbl, uid, fields);
				}
			});

			if(length === 2)
			{
				if (inputData$)
				{
					search = await inputData$;
				}
			}
			// if we are going even further.
			// we have to recursively grab what the user wants.
			else
			{
				// if we have query in the response then we need to do something different with our data
				// tables/-MCRBgLBXjj00tQ5Xv-p/revisions
				if(response.query)
				{
					const relTbl = paths[2];

					const input = await queryTable(relTbl, uid, fields, response.query);

					return res.status(200).json({ err: false, message: "thank you for using Prisma", payload: input });
				}

				// tables/ckrxgya7g0000egn40skjy7s8/data/0
				const input = await inputData$;

				// we need to start from the second value to get a value string
				const lastStr = paths.slice(2, paths.length).join('.');

				// If we have a value then insert new values
				// find the child
				const find = deepFind(input, lastStr);

				if(find)
					return res.status(200).json({ err: false, message: "thank you for using Prisma", payload: find });
			}
		} else
			search = await prismaClient.prisma[tbl].findMany();

		return res.status(200).json({ message: "thank you for using Prisma", payload: search });
	}

	return res.status(200).json({ message: 'connection created'});
}