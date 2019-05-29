# NodeChatServer

## Installing local packages...

#### In the server folder we will generate package.json file by running the following command:

     npm init -y

#### After that we will install our dependencies and save them to package.json:

    npm install express socket.io --save

#### In the same folder we will create index.js file for our server app. 

#### In package.json file add in "scripts":{} property..   
    
    "start": "node index.js"
    
#### In the Client side of your directory add following command to add socket.io client side installation..
     
     npm install socket.io-client --save
     
## Deployment this nodejs express socket.io server files to Heroku..
  
[Heroku Setup Insruction from Github](https://www.freecodecamp.org/news/how-to-deploy-a-nodejs-app-to-heroku-from-github-without-installing-heroku-on-your-machine-433bec770efe/)
