import { NextApiRequest, NextApiResponse } from 'next';
import { UserMetaData, User } from '@prisma/client';
import { sign } from 'jsonwebtoken';

import { DBClient } from '../middlewares/prisma-client';
import { checkToken, createCookie, insertToken, updateToken } from '../middlewares/cookie';
import { makeClaims } from '../middlewares/claims';
import { authenticatedMiddleware, Claims } from '../middlewares/auth-check';

const prismaClient = DBClient.getInstance();

export default authenticatedMiddleware(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload?: Claims,
) => {
	if(req.method !== 'POST' || typeof payload === 'undefined') return res.status(401).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const { refresh_token } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	if (!refresh_token) res.status(401).json({ message: 'No refresh token provided'});

	const user: User | null = await prismaClient.prisma.user.findFirst({
		where: {
			id: payload.uid,
		},
	});

	if (user === null) return res.status(401).json({ message: 'User not found!'});

	let { token, isMatch, isValid } = await checkToken(user, refresh_token);

	console.log(isMatch, isValid);
	// if we have a match and the token is not valid anymore. generate a new one.
	if(isMatch)
	{
		const userMetadata: UserMetaData | null = await prismaClient.prisma.userMetaData.findFirst({
			where: {
				userId: payload.uid,
			},
		});

		if (userMetadata === null) return res.status(401).json({ message: 'User data found!'});

		// make JWT token
		const claims = await makeClaims(userMetadata);
		const newToken = sign(claims, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRY });
		const response = {
			access_token: newToken,
			expires_in: process.env.JWT_EXPIRY,
			refresh_token: null,
		}
		// Create new cookie with new tokens
		const { newRefreshToken, newRefreshTokenExpiry, newRefreshTokenHash } = await createCookie();

		if(!isValid)
		{
			// insert the token in the database
			await insertToken(userMetadata.userId, newRefreshTokenHash, newRefreshTokenExpiry);
		}
		else
		{
			// update the token in the database
			await updateToken(token as any, newRefreshTokenExpiry);
		}


		// return the payload.
		response.refresh_token = !isValid ? newRefreshToken : refresh_token;

		return res.status(200).json(response);
	}

	return res.status(401).json({ errorMessage: 'Token cant be found!'});
})
