/*
 * Options used in resolvers to issue the refresh token cookie.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { Token, User, UserMetaData } from '@prisma/client';
import { compareSync, genSalt, hash } from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import cookie, { CookieSerializeOptions } from 'cookie';

import { DBClient } from './prisma-client';
import { sign } from 'jsonwebtoken';
import { IClaims, makeClaims } from '@core-middlewares/claims';
import auth from '@core-config/auth';
import { isFirebase } from '@core-config/utils';

const prismaClient = DBClient.getInstance();

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	// Get part after // and before : (in case port number in URL)
	// E.g. <http://localhost:3000> becomes localhost
	domain: (process.env.APP_URL as string).split('//')[1].split(':')[0],
	httpOnly: true,
	path: '/',
	sameSite: 'strict',
	// Allow non-secure cookies only in development environment without HTTPS
	secure: !!process.env.BASE_URL?.includes('https'),
};

export const setCookie = async (res: NextApiResponse, jwt: string) => {
	// Set the payload in the cookie.
	res.setHeader('Set-Cookie', cookie.serialize('auth', jwt, REFRESH_TOKEN_COOKIE_OPTIONS));
}

/**
 * Find tokens from a user. and sees if the token given is expired
 * @param userId
 * @param refreshToken
 * @return Token[]
 */
export const findTokens = async (userId: string, refreshToken: string) =>
{
	let isRefreshTokenValid = false;
	const tokens: Token[] = await prismaClient.prisma.token.findMany({
		where: {
			userId: userId,
		},
	});

	const filteredTokens = tokens.filter(
		(storedToken) => {
			const isMatch = compareSync(refreshToken, storedToken.hash as string);
			const isValid = storedToken.expiration.getTime() > Date.now();
			if (isMatch && isValid) {
				isRefreshTokenValid = true;
			}
			return !isMatch && isValid;
		},
	);

	return isRefreshTokenValid;
}

/**
 * Create cookie
 */
export const createCookie = async (claims: IClaims) => {
	const newRefreshToken = sign(claims, process.env.JWT_REFRESH_TOKEN_SECRET as string,{ expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY });
	// const salt = await genSalt(10);
	// const newRefreshTokenHash = await hash(newRefreshToken, salt);
	const newRefreshTokenExpiry = new Date(Date.now());
	// TODO take this from env file.
	newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getTime() + 7);

	return { newRefreshToken, newRefreshTokenExpiry /*, newRefreshTokenHash */ };
}

export const insertToken = async (userId: string, newRefreshTokenHash: string, newRefreshTokenExpiry: Date) =>
{
	// first create the token in the database then connect it to the user.
	const now = new Date(Date.now());
	const newToken = await prismaClient.prisma.token.create({
		data: {
			updated_at: now,
			type: 'API',
			hash: newRefreshTokenHash,
			valid: true,
			expiration: newRefreshTokenExpiry,
			userId: userId,
		},
	});


	await prismaClient.prisma.user.update({
		where: {
			uid: userId,
		},
		data: {
			tokens: {
				connect: {
					id: newToken.id,
				},
			},
		},
	});
}

export const updateToken = async (token: Token, newRefreshTokenExpiry: Date) => {
	// first create the token in the database then connect it to the user.
	const now = new Date(Date.now());
	await prismaClient.prisma.token.update({
		where: {
			id: token.id,
		},
		data: {
			updated_at: now,
			expiration: newRefreshTokenExpiry,
		},
	});
}


/**
 * Check if the token exist in the DB and if it is still valid.
 * @param user
 * @param refreshToken
 */
export const checkToken = async (user: User, refreshToken: string) =>
{
	let isRefreshTokenValid = false, isMatch = false, isValid = false;

	const tokens: Token[] = await prismaClient.prisma.token.findMany({
		where: {
			userId: user.uid,
		},
	});

	const filteredTokens: Token[] = tokens.filter(
		(storedToken) => {
			isMatch = compareSync(refreshToken, storedToken.hash as string);
			isValid = storedToken.expiration.getTime() > Date.now();
			if (isMatch && isValid) {
				isRefreshTokenValid = true;
			}
			return !isMatch && isValid;
		});


	return { token: filteredTokens.length > 0 ? filteredTokens[filteredTokens.length - 1] : null, isMatch, isValid };
}

/**
 * Check if cookie exists
 * @param user
 */
export const checkCookie = (user: User, next: () => void) => async (
	req: NextApiRequest,
	res: NextApiResponse,
) =>
{
	const setCookies = [];

	const { refreshToken } = req.cookies;
	if (!refreshToken) res.status(401).json({ message: 'No refresh token provided'});

	if (user === null) res.status(401).json({ message: 'Invalid user' });

	let isRefreshTokenValid = await findTokens(user.uid, refreshToken);

	if (!isRefreshTokenValid) throw new Error('Invalid refresh token');

	const userMetadata = await prismaClient.prisma.userMetaData.findFirst({
		where: {
			userId: user.uid,
		},
	});

	if (userMetadata === null || typeof userMetadata === 'undefined' ) res.status(401).json({ message: 'Invalid user' });

	let payload = null;
	if(!isFirebase && typeof auth.generateToken !== 'undefined')
	{
		payload = await auth.generateToken(userMetadata);
	}


	setCookies.push({
		name: 'refreshToken',
		value: payload.refreshToken,
		options: {
			...REFRESH_TOKEN_COOKIE_OPTIONS,
			expires: payload.exp,
		},
	});
	return next();
}
