const express = require('express');

const router = express.Router();
const db = require('../data/helpers/actionModel');
router.use('/:aId/', verifyId);

router.get('/', (req, res) => {
	db.get()
		.then((r) => {
			let projectActions = null;
			if (req.project) {
				projectActions = r.filter(
					(action) => action.project_id === req.project.id
				);
			} else {
				projectActions = r;
			}
			res.status(200).json(projectActions);
		})
		.catch((err) => {
			res.status(500).json('Something went wrong!', err);
		});
});

router.get('/:aId/', verifySchema, (req, res) => {
	for (const param in req.action) {
		if (!req.body[param]) {
			req.body[param] = req.action[param];
		}
	}
	db.update(req.params.aId, req.body)
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

router.delete('/:aId/', (req, res) => {
	db.remove(req.params.aId)
		.then((r) => {
			res.status(204).end();
		})
		.catch((err) => {
			res.status(500).json({
				message: 'Something went wrong',
				err,
			});
		});
});

function verifySchema(req, res, next) {
	if (req.project) {
		req.body.project_id = req.project.id;
	} else {
		if (!req.body.project_id) {
			res.status(400).json({
				message: 'This action must be assigned to a project',
				err,
			});
			return;
		}
	}
	if (req.body.description && req.body.notes) {
		next();
	} else {
		res.status(400).json({
			message: 'Please provide a description and notes',
		});
	}
}

function verifyId(req, res, next) {
	const id = parseInt(req.params.aId);
	if (!id) {
		res.status(400).json({
			message: 'Invalid Id',
		});
	} else {
		db.get(id)
			.then((r) => {
				if (!r) {
					res.status(404).json({
						message: 'Id not found',
					});
				} else {
					if (r.project && r.project_id !== req.project.id) {
						res.status(404).json({
							message: 'Id not found',
						});
					} else {
						req.action = r;
						next();
					}
				}
			})
			.catch((err) => {
				res.status(500).json({
					message: 'Something went wrong!',
					err,
				});
			});
	}
}

module.exports = router;
