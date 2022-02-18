import { compare } from 'bcrypt';
import { isFirebase } from './utils';
import { makeClaims } from '../middlewares/claims';
import { sign } from 'jsonwebtoken';
import { createCookie, insertToken } from '../middlewares/cookie';
import { firebase } from '../config/serverApp';

export interface FirebaseTokenResult {
	token_type: string;
	access_token: string;
	id_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface PrismaTokenResult {
	idToken: string;
	refreshToken: string;
}

export interface Auth {
	login: (email: string, password: string, dbPassword?: string) => Promise<boolean|FirebaseTokenResult>;
	generateToken?: (userMetadata: any) => Promise<PrismaTokenResult>;
}

class PrismaAuth implements Auth
{
	public async login(email: string, password: string, dbPassword?: string): Promise<boolean> {
		if(!password || !dbPassword)
			return false;

		return compare(password, dbPassword);
	}

	public async generateToken(userMetadata?: any): Promise<PrismaTokenResult> {
		// delete the password from the response
		// delete userMetadata.password;

		// make JWT token
		const claims = await makeClaims(userMetadata);
		const token = sign(claims, process.env.JWT_SECRET as string, { expiresIn: parseInt(process.env.JWT_EXPIRY as string) });
		const { newRefreshToken, newRefreshTokenExpiry, newRefreshTokenHash } = await createCookie();
		// We can insert the token in the database asyncally.
		insertToken(userMetadata.userId, newRefreshTokenHash, newRefreshTokenExpiry).then();
		return { idToken: token, refreshToken: newRefreshToken };
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
			'id_token': user ? await user.getIdToken() :'',
			'refresh_token': user ? user.refreshToken : '',
			'expires_in': exp,
		}
	}
}

export const auth: Auth = isFirebase ? new FirebaseAuth() : new PrismaAuth();
export default auth;
