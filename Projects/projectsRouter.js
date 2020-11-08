const express = require('express');

const router = express.Router();
const db = require('../data/helpers/projectModel');
const actionsRouter = require('../Actions/actionsRouter');

router.use('/:pId/', verifyId);
router.use('/:pId/actions/', actionsRouter);

router.get('/', (req, res) => {
	db.get().then((r) => {
		res.status(200).json(r);
	});
});

router.get('/:pId/', (req, res) => {
	res.status(200).json(req.project);
});

router.post('/:pId/', verifySchema, (req, res) => {
	db.insert(req.body)
		.then((r) => {
			res.status(201).json(r);
		})
		.catch((err) => {
			res.status(500).json({
				message: 'Something went wrong!',
				err,
			});
		});
});

router.put('/:pId/', verifySchema, (req, res) => {
	const { pId } = req.params;
	for (const param in req.project) {
		if (!req.body[param] && param !== 'actions') {
			req.body[param] = req.project[param];
		}
	}
	db.update(pId, req.body)
		.then((r) => {
			res.status(200).json(r);
		})
		.catch((err) => {
			res.status(500).json({
				message: 'Something went wrong!',
				err,
			});
		});
});

router.delete('/:pId/', (req, res, next) => {
	db.remove(req.params.pId)
		.then((r) => {
			res.status(204).end();
		})
		.catch((err) => {
			res.status(500).json({
				message: 'Unable to delete Id',
				err,
			});
		});
});

function verifySchema(req, res, next) {
	if (req.body.name && req.body.description) {
		next();
	} else {
		res
			.status(400)
			.json('Please provide an object with a name and description');
	}
}

function verifyId(req, res, next) {
	const id = parseInt(req.params.pId);
	if (!id) {
		res.status(400).json({ message: 'Please include an id in your request' });
	} else {
		db.get(id)
			.then((result) => {
				if (result == null) {
					res
						.status(404)
						.json({ message: 'Sorry, a project with that id does not exist' });
				} else {
					req.project = result;
					next();
				}
			})
			.catch((err) => {
				res.status(500).json({
					message: 'Something went wrong',
					err,
				});
			});
	}
}

module.exports = router;
