# StoryTime Next
Next server for the StoryTime application.

## Introduction

This sever enables the connection between Unity3D &amp; Unreal engine 4.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/vamidicreations)

## Join Our Discord!
For help, support, discussion, and chill times, come and join the StoryTime community [Discord](https://discord.gg/SgJ8X5s)!

### [Documentations](https://valencio-masaki16.gitbook.io/storytime/)

## Requirements

* Make sure you have Node version >= 12.0 and (NPM >= 5 or Yarn ) [url](https://nodejs.org/en/download/)
* MacOS, Windows (including WSL), and Linux are supported
* A Firebase database(free or blaze tier) or an SQL database (PostgreSQL, SQLite or MSSQL).

# Installation

## NPM Install

```sh
# clone our repo
git clone https://github.com/vamidi/StoryTime.git

# change directory to our repo
cd storytime/next

# install the modules.
npm install
```
> The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.
* Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase
> **Make sure you add your Firebase service file to your ignore file.**

In order to use the server you need download your `service.json` file from Firebase.
* Go to Firebase console and in the top left corner click on settings ⚙️ and click afterwards on `Service accounts`. Scroll down and click on `Generate new private key`.
* open the file which looks like the `firebaseAdminConfig` object below.
* Copy over project_id, private_key, client_email, to the corresponding variables in the `.env` file

```json
{
	"type": "...",
	"project_id": "[YOUR_PROJECT_ID]",
	"private_key_id": "...",
	"private_key": "[YOUR_PRIVATE_KEY]",
	"client_email": "[YOUR_CLIENT_EMAIL]",
	"client_id": "...",
	"auth_uri": "...",
	"token_uri": "...",
	"auth_provider_x509_cert_url": "...",
	"client_x509_cert_url": "..."
}
```

## Development

* Fill in your credentials in the `.env` file

The following table describes the configurable environment variables.
> **Variables with an asterisk are optional**

| Variable                | Default Value                         | Description                                                    |
|-------------------------|---------------------------------------|----------------------------------------------------------------|
| APP_NAME                | "Next"                                | The name of your app                                           |
| APP_ENV                 | local                		               | The environment the app is in.                                 |
| APP_KEY*                | `empty`                               |                                                                |
| APP_DEBUG*              | true                                  | If we should enable debug mode.                                |
| APP_URL                 | http://localhost                      | the url of the app.                                            |
| APP_TIMEZONE*           | UTC                                   | Timezone.                                                      |
| DATABASE_PROVIDER 	     | firebase		                            | Which provider you want to grab the data from.                 
| DATABASE_URL* 	         | firebase		                            | If you are using prisma, make sure you add the location of your database. 
| JWT_SECRET 	            | random_secret_for_JWT		               | Random secret string for your JWT signing.                     
| FIREBASE_API_KEY        | YOUR_API_KEY                		        | The API key firebase uses to connect to the database.          |
| FIREBASE_AUTH_DOMAIN    | YOUR_AUTH_DOMAIN                      | Firebase auth domain.                                          |
| FIREBASE_DATABASE_URL   | YOUR_DATABASE_URL                     | Firebase database url to grab data from the database.          |
| FIREBASE_PROJECT_ID     | YOUR_PROJECT_ID                       | Firebase project id.                                           |
| FIREBASE_STORAGE_BUCKET | YOUR_STORAGE_BUCKET                   | Firebase storage bucket url.                                   |
| FIREBASE_MESSAGING_ID   | YOUR_MESSAGING_ID                     | Firebase messaging id.                                         |
| FIREBASE_APP_ID         | YOUR_APP_ID                           | Firebase app id.                                               |
| FIREBASE_MEASUREMENT_ID | YOUR_MEASUREMENT_ID                   | Firebase measurement id.                                       
| FIREBASE_CLIENT_EMAIL 	 | LOCATION_TO_YOUR_SERVICE_FILE.JSON	   | Firebase client mail.                                          
| FIREBASE_PRIVATE_KEY 	  | YOUR_FIREBASE_DATABASE_URL	           | Firebase private key.                                          |

```shell
# run the server.
npm run start;
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## External links
- [Next quickstart](https://nextjs.org/docs/getting-started)
- [Primsa quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
