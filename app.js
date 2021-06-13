const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mysql = require('mysql');
const bodyParser = require('body-parser');

dotenv.config({ path: 'config.env' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MYSQL
const room = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE,
});

// READ
// Get all the details of rooms
app.get('/room', (req, res) => {
	room.getConnection((err, connection) => {
		if (err) throw err;
		console.log(`Connected as ID ${connection.threadId}`);

		connection.query('SELECT * from room', (err, rows) => {
			// To return the connection back to the pool
			connection.release();
			if (err) {
				res.json({
					status: 'failure',
					error: err,
				});
			} else {
				if (rows.length > 0) {
					res.json({ status: 'success', rows });
				} else {
					res.json({ message: 'No Room records Found' });
				}
			}
		});
	});
});

// Get all the details of specified room
app.get('/room/:roomID', (req, res) => {
	room.getConnection((err, connection) => {
		if (err) throw err;
		console.log(`Connected as ID ${connection.threadId}`);

		connection.query(
			'SELECT * from room WHERE roomID =?',
			req.params.roomID,
			(err, rows) => {
				// To return the connection back to the pool
				connection.release();
				if (err) {
					res.json({
						status: 'failure',
						error: err,
					});
				} else {
					if (rows.length > 0) {
						res.json({ status: 'success', rows });
					} else {
						res.json({ status: 'failure', message: 'Invalid Room ID' });
					}
				}
			}
		);
	});
});

// DELETE
app.delete('/room/:roomID', (req, res) => {
	room.getConnection((err, connection) => {
		if (err) throw err;
		console.log('Connection has been established at ID' + connection.threadId);
		connection.query(
			'DELETE * FROM room WHERE roomID = ?',
			[req.params.ID],
			(err, rows) => {
				// To return the connection back to the pool
				connection.release();
				if (err) {
					res.json({
						status: 'failure',
					});
				} else {
					res.json({
						status: 'success',
						message: `Room with room ID ${req.params.roomID} has been deleted`,
					});
				}
			}
		);
	});
});

// CREATE
app.post('/room', (req, res) => {
	room.getConnection((err, connection) => {
		if (err) throw err;
		console.log(
			'Connection Established with Connection ID ' + connection.threadId
		);

		connection.query('INSERT INTO room SET ?', req.body, (err, rows) => {
			// To return the connection back to the pool
			connection.release();
			if (err) {
				res.json({ status: 'failure' });
			} else {
				res.json({
					status: 'successful',
					message: `room with name ${req.body.roomName} has been created`,
				});
			}
		});
	});
});

// UPDATE
app.patch('/room', (req, res) => {
	room.getConnection((err, connection) => {
		if (err) throw err;
		console.log(
			'Connection Established with Connection ID ' + connection.threadId
		);

		connection.query(
			'SELECT * FROM room WHERE roomID=?',
			req.body.roomID,
			(err, rows) => {
				if (err) {
					res.json({
						status: 'failure',
						message: `Something Went Wrong`,
					});
				} else {
					if (rows.length > 0) {
						const { roomID, roomName, capacity } = req.body;

						connection.query(
							'UPDATE room SET roomName = ? , capacity= ? WHERE roomID = ?',
							[roomName, capacity, roomID],
							(err, rows) => {
								// To return the connection back to the pool
								connection.release();
								if (err) {
									res.json({
										status: 'failure',
										message: 'Could not be updated',
									});
								} else {
									res.json({
										status: 'successful',
										message: `room with name ${roomName} has been updated`,
									});
								}
							}
						);
					} else {
						res.json({
							status: 'failure',
							message: `Record of room with Room ID ${req.body.roomID} not found `,
						});
					}
				}
			}
		);
	});
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
	console.log(`Server has been started at 127.0.0.1/${PORT}`);
});
