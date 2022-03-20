import { Request, Response } from 'express';
import { hash as Encrypt } from 'bcrypt';

import { DBClient } from '@core-middlewares/prisma-client';

const prismaClient = DBClient.getInstance();

export default async (req: Request, res: Response) =>
{
	if(req.method !== 'POST')
		return 	res.status(401).json({ errorMessage: 'Not authorized!'});

	const hasBody = typeof req.body === 'string' && req.body !== '';
	const body: { email: string, password: string, firstName: string, lastName: string } = hasBody ? JSON.parse(req.body) : req.body;
	const hash = await Encrypt(body.password, 10);

	// if user already exist return error
	const existingUser = await prismaClient.prisma.userMetaData.findFirst({
		where: {
			email: body.email,
		}
	});

	if(existingUser !== null) {
		return res.status(401).json({ error: true, error_msg: 'User already exists'});
	}

	const response = await prismaClient.prisma.user.create({
		data: {
			metadata: {
				create:
				{
					updated_at: new Date(Date.now()),
					displayName: `${body.firstName ?? ''} ${body.lastName ?? ''}`,
					email: body.email,
					password: hash,
					firstName: body.firstName ?? '',
					lastName: body.lastName ?? '',
					photoURL: '',
				},
			},
		},
	});

	// make JWT token
	res.status(200).json(response);
}
