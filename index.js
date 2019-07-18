let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let router = express.Router();
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;
let totalUsers = 0;

app.use(bodyParser.json());
app.use (cors());

var path = require('path');

// firebase coding... 
var firebase = require('firebase');
var config = {
	apiKey: 'AIzaSyA8hO5x0WDnFsbdMG2iSJIxNsCywGevOfk',
	authDomain: 'testingapp-8fb86.firebaseapp.com',
	databaseURL: 'https://testingapp-8fb86.firebaseio.com',
	projectId: 'testingapp-8fb86',
	storageBucket: 'testingapp-8fb86.appspot.com',
	messagingSenderId: '345026705484',
	appId: '1:345026705484:web:962e5b869e82de52'
};
firebase.initializeApp(config);

// when url fire by client-side this app.get('/') default requenst fire and hello.html response fire..
app.get('/', (req, res) => {
	//	res.send('Hello World, Response from express server');
	console.log('first time call');
		res.sendFile( path.resolve('hello.html'));
	//	res.status(301).redirect('https://gaurangdhorda.github.io/Angular-Demo/');
});

	function snapshotToArray(snapshot) {
		var returnArr = [];
	
		snapshot.forEach(function(childSnapshot) {
			var item = childSnapshot.val();
			item.key = childSnapshot.key;
	
			returnArr.push(item);
		});
	
		return returnArr;
	}
			
app.get('/materialContactRead', (req, res) => {
	// getting all data from firebase database..
	var userReference = firebase.database().ref("/Material-Contact/");
	//Attach an asynchronous callback to read the data
	userReference.on("value", snapshot => {
		const responseData = snapshotToArray(snapshot);
	//	res.send(responseData);
	res.json(responseData);
		console.log(responseData);
		 userReference.off("value");
	});
});
app.get('/edit', (req, res) =>{
	res.status (200).send({'msg': 'Data received'});
});

app.get('/enroll',(req, res) => {
	// enroll is called from angular app and data are loaded here.. then we save this data to the firebase database...
	//console.log('req.body '+ req.body);
	
	//res.send(req.body);
	 const resVal = req.body;
	 var key = firebase.database().ref().push().key;
	 console.log(key);
	
	// firebase.database().ref('/Material-Contact/' + resVal.key).set(resVal);
	  firebase.database().ref('/Material-Contact/').push(resVal);
	res.json(req.body);
	//res.status (200).send({'msg': 'Data received'});
	console.log(resVal);
	
})

io.on('connection', (socket) => {
	totalUsers++;
    	console.log('user connected');
	socket.on('getTotalUsers',()=>{
		io.emit('getTotalUsers',totalUsers);
	});

	io.emit('totalUsers',totalUsers);
	socket.on('new-message', ( data , username ) =>{
		io.emit('new-message',  data , username );
	});

	socket.on('typing', (typinguser) => {
		if (typinguser === false){ io.emit('typing',false)} 
		else{
		io.emit('typing', typinguser );}
	});

	socket.on('disconnect', () => {
		totalUsers--;
		io.emit('totalUsers',totalUsers);
	});
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});