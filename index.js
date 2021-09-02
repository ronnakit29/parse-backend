const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');

const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
require('dotenv').config();

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ['Posts', 'Comments'],
  },
};

const app = express();
const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
      appId: process.env.APP_ID || 'myAppId',
      masterKey: process.env.MASTER_KEY || '',
      appName: process.env.APP_NAME || '',
    },
  ],
});
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/admin', dashboard);
const mountPath = process.env.PARSE_MOUNT || '/api';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });

  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
