import { Token } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { isFirebase } from './utils';
import { IClaims, makeClaims } from '@core-middlewares/claims';
import { createCookie, insertToken, updateToken } from '@core-middlewares/cookie';
import { firebase } from '../config/serverApp';

export interface FirebaseTokenResult {
	token_type: string;
	access_token: string;
	id_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface PrismaTokenResult {
	claims?: IClaims,
	exp?: number,
	idToken: string;
	refreshToken: string;
}

export interface Auth {
	login: (email: string, password: string, dbPassword?: string) => Promise<boolean|FirebaseTokenResult>;
	generateToken?: (userMetadata: any, existingToken?: Token | null, update?: boolean) => Promise<PrismaTokenResult>;
}

class PrismaAuth implements Auth
{
	public async login(email: string, password: string, dbPassword?: string): Promise<boolean> {
		if(!password || !dbPassword)
			return false;

		return compare(password, dbPassword);
	}

	public async generateToken(userMetadata?: any, existingToken?: Token | null, update: boolean = false): Promise<PrismaTokenResult> {
		// delete the password from the response
		// delete userMetadata.password;

		// make JWT token
		const claims: IClaims = await makeClaims(userMetadata);
		const token = sign(claims, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRY });
		const { newRefreshToken, newRefreshTokenExpiry } = await createCookie(claims);
		const exp: number = newRefreshTokenExpiry.getTime() + newRefreshTokenExpiry.getTimezoneOffset();

		if(update)
		{
			if(existingToken === null || typeof existingToken === 'undefined')
				throw new Error('Existing token is undefined. Did you provided a token?');

			// update the token in the database
			updateToken(existingToken as any, newRefreshTokenExpiry).then();
		}
		else
		{
			// We can insert the token in the database asyncable.
			insertToken(userMetadata.userId, newRefreshToken, newRefreshTokenExpiry).then();
		}

		return { claims, exp, idToken: token, refreshToken: newRefreshToken };
	}
}

class FirebaseAuth implements Auth {
	public async login(email: string, password: string): Promise<FirebaseTokenResult> {
		const credentials: firebase.auth.UserCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
		const user = credentials.user;
		const token = await user?.getIdTokenResult();

		const dt = Date.parse(token ? token.expirationTime : '');
		const exp = dt / 1000;

		return {
			'token_type': 'Bearer',
			'access_token': token ? token.token : '',
			'id_token': user ? await user.getIdToken(true) :'',
			'refresh_token': user ? user.refreshToken : '',
			'expires_in': exp,
		}
	}
}

export const auth: Auth = isFirebase ? new FirebaseAuth() : new PrismaAuth();
export default auth;
