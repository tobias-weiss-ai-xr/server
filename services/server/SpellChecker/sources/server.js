

const cluster = require('node:cluster');
const config = require('config').get('SpellChecker');

//process.env.NODE_ENV = config.get('server.mode');

const logger = require('./../../Common/sources/logger');

const c_nCheckHealth = 60000;
const c_sCheckWord = 'color';
const c_sCheckLang = 1033;
let idCheckInterval;
let canStartCheck = true;
let statusCheckHealth = true;
function checkHealth (worker) {
	logger.info('checkHealth');
	if (!statusCheckHealth) {
		logger.error('error check health, restart!');
		worker.kill();
		return;
	}
	worker.send({type: 'spell'});
	statusCheckHealth = false;
}
function endCheckHealth (msg) {
	logger.info('endCheckHealth');
	statusCheckHealth = true;
}

const workersCount = 1;	// ToDo So far, we will use only 1 process. But in the future it is worth considering a few.
if (cluster.isMaster) {
	logger.warn('start cluster with %s workers', workersCount);
	cluster.on('listening', (worker) => {
		if (canStartCheck) {
			canStartCheck = false;
			idCheckInterval = setInterval(()=> {checkHealth(worker);}, c_nCheckHealth);
			worker.on('message', (msg)=> {endCheckHealth(msg);});
		}
	});
	for (let nIndexWorker = 0; nIndexWorker < workersCount; ++nIndexWorker) {
		logger.warn('worker %s started.', cluster.fork().process.pid);
	}

	cluster.on('exit', (worker, code, signal) => {
		logger.warn('worker %s died (code = %s; signal = %s). restart...', worker.process.pid, code, signal);
		clearInterval(idCheckInterval);
		endCheckHealth();
		canStartCheck = true;
		cluster.fork();
	});
} else {
	const express = require('express');
	const http = require('node:http');
	const https = require('node:https');
	const fs = require("node:fs");
	const app = express();
	const spellCheck  = require('./spellCheck');
	let server = null;


	logger.warn('Express server starting...');

	if (config.has('ssl')) {
		const privateKey = fs.readFileSync(config.get('ssl.key')).toString();
		const certificateKey = fs.readFileSync(config.get('ssl.cert')).toString();
		const trustedCertificate = fs.readFileSync(config.get('ssl.ca')).toString();
		//See detailed options format here: http://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
		const options = {key: privateKey, cert: certificateKey, ca: [trustedCertificate]};

		server = https.createServer(options, app);
	} else {
		server = http.createServer(app);
	}

		// If you want to use 'development' and 'production',
		// then with app.settings.env (https://github.com/strongloop/express/issues/936)
		// If error handling is needed, now it's like this https://github.com/expressjs/errorhandler	spellCheck.install(server, function(){
		server.listen(config.get('server.port'), ()=> {
			logger.warn("Express server listening on port %d in %s mode", config.get('server.port'), app.settings.env);
		});

		app.get('/index.html', (req, res) => {
			res.send('Server is functioning normally');
		});
	});

	process.on('message', (msg) => {
		if (!spellCheck)
			return;
		spellCheck.spellSuggest(msg.type, c_sCheckWord, c_sCheckLang, (res) => {
			process.send({type: msg.type, res: res});
		});
	});

	process.on('uncaughtException', (err) => {
		logger.error(`${(new Date).toUTCString()} uncaughtException:`, err.message);
		logger.error(err.stack);
		logger.shutdown(() => {
			process.exit(1);
		});
	});
}
