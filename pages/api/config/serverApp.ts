import * as admin from 'firebase-admin';
import firebase from 'firebase/app';
import "firebase/auth";

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
		}),
		databaseURL: process.env.FIREBASE_DATABASE_URL,
	});
}

if(!firebase.apps.length) {
	firebase.initializeApp({
		apiKey: process.env.FIREBASE_API_KEY,
		authDomain: process.env.FIREBASE_AUTH_DOMAIN,
		databaseURL: process.env.FIREBASE_DATABASE_URL,
		projectId: process.env.FIREBASE_PROJECT_ID,
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.FIREBASE_MEASUREMENT_ID,
		appId: process.env.FIREBASE_APP_ID,
	});
}

const database = admin.database();
const auth = admin.auth();

export { firebase, database, auth }