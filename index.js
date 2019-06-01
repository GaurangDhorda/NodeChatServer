let express = require('express')
let router = express.Router();
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;
let totalUsers = 0;

io.on('connection', (socket) => {
	totalUsers++;
    	console.log('user connected');
	
	io.emit('totalUsers',totalUsers);
	socket.on('new-message',(message) =>{
		io.emit('new-message',message);
	});

	socket.on('disconnect', () => {
		totalUsers--;
		io.emit('totalUsers',totalUsers);
	});
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});