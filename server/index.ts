const { Server } = require('socket.io');
import next from 'next';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = app.getRequestHandler();

const { createServer } = require('http');
const { parse } = require('url');

const context = {
	io: null
}

const requestListener = (req: any, res: any) => {
	// Be sure to pass `true` as the second argument to `url.parse`.
	// This tells it to parse the query portion of the URL.
	const parsedUrl = parse(req.url, true)
	req.context = context;
	handler(req, res, parsedUrl)
}

app.prepare().then(() => {
	const server = createServer(requestListener);

	context.io = new Server(server, {
		cors: {
			origin: "http://localhost:4200",
			methods: ["GET", "POST"]
		}
	});

	context.io.on('connection', socket => {
		// your stuff
		console.log(socket.id, 'Connected first use, starting socket.io');
	});

	server.listen(3000, err => {
		if (err) throw err;
		console.log('started server on 0.0.0.0:3000, url: http://localhost:3000');
	});
});