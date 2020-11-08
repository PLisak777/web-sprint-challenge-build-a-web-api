const express = require('express');

const server = express();
server.use(express.json);
server.use(logger);

server.get('/', (req, res) => {
	res.send(`<h1>Hello Whurl</h1>`);
});

function logger(req, res, next) {
	console.log(
		`method: ${req.method}, request url: ${
			req.originalUrl
		}, time of request: ${new Date().toISOString()}`
	);
	next();
}

module.exports = server;
