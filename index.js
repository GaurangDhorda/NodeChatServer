let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let router = express.Router();
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

let webpush = require('web-push');

let multer = require('multer'); // npm i --save multer
//multer is used for handling fileUpload related operation in express server.
// same as body-parser and cors is used for handling http routing in express server...
// multe
const storage = multer.diskStorage({
	// cb : is CallBack function, where to perform multer storage tasks
	destination: (req, file, cb) =>{
		//whenever new file is recieved from client side, this cb()function is fired..
		//setting path, where incoming files to be stored..
		cb(null, 'upload'); // upload is folder name and its root folder..
	},
	filename: (req,file, cb) =>{
		// how filename should be named in upload folder is defined here..
		// adding date with filename is our new filename to be stored in upload folder.. 
		cb(null, Date.now() + file.originalname);
	}
});

// for setting up filteration to save only jpeg files only, and rejects rest of files to being stored..
const fileFilter = (req, file, cb) =>{
	// reject file condition.
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
		cb(null,true);
	} else{
		cb(null, false);
	}
}

const upload = multer({
							storage: storage,
							fileFilter: fileFilter,
							limits: {
								fileSize: 1024 * 1024 * 5
							}
					 });
const port = process.env.PORT || 3000;
let totalUsers = 0;

app.use(bodyParser.json());  // .use() loads middleware to use with existing express server.
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
let firebaseAdmin = require('firebase-admin');
var serviceAccount = require( './serviceAccountKey.json');
firebaseAdmin.initializeApp({
credential: firebaseAdmin.credential.cert(serviceAccount),
databaseURL: 'https://testingapp-8fb86.firebaseio.com'
});
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

app.post('/deleteEmployee', (req, res) => {
	console.log(req.body.key);
	var userReference = firebase.database().ref().child('/Material-Contact/' + req.body.key);
	userReference.remove();

	res.status(200).send(req.body);
});

app.post('/editt', (req, res) => {
	console.log(req.body.key);
	var userReference = firebase.database().ref().child('/Material-Contact/' + req.body.key);
	console.log(userReference);
	userReference.update(req.body);
	res.status (200).send(req.body);
});

app.post('/enroll',(req, res) => {
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

app.post('/fileUpload', upload.single('image')  ,(req , res) =>{

	// console.log(req.file);
	// firebase.storage().ref().child('/employeeImage/').put(req.file);
// const storage = firebaseAdmin.storage();
 // const storageRef = s  ; // storage.ref('employeeImage/' + req.file.filename);
 // const storageRef = firebaseAd
 // storageRef.file(rew.file);
 // firebaseAdmin.storage().bucket()
	res.status(200).send({'msg':'File Uploaded'}); 
});

app.post('/subscribe', (req, res) => {
	let sub = req.body;

//	res.set('content-type', 'application-json');
	webpush.setVapidDetails(
		'mailto:grdtechlab@gmail.com',
		'BGeXc0b2Tfiro0K5KnSdjKMOzLhTBWW9kZ14iA2i6UTUOk0KroXM8945nj_D9jq9qj74c6Ul7sXLCc1QdKDiuL8',
		'Ot0Yx9ccogCk9OzirRTRjHdgLU2UKOLCQb5UNN3Imzk'
	);

	let payload = JSON.stringify({
		notification: {
			title: "hello from server",
			body: "thanks for subscribing"
		}
	});
    console.log('SubData '+ sub.endpoint);
	Promise.all([webpush.sendNotification(sub, payload)])
	.then(() => res.status(200).send({'message': 'notification sent'}))
	.catch( err => {
		console.log(err);
		res.sendStatus(500);
	})
	
});

io.on('connection', (socket) => {
	totalUsers++;
    	console.log('user connected');
	socket.on('getTotalUsers',()=>{
		io.emit('getTotalUsers',totalUsers);
	});

	io.emit('totalUsers',totalUsers);
	socket.on('new-message', ( data , username ) =>{
		io.emit('new-message', {'messageData': data, 'userName': username});
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