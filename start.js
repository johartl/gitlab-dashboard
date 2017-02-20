#!/usr/bin/env node
const fs = require('fs');

if (!fs.existsSync('./config.js')) {
    console.error(`Missing file configuration file!`);
    console.error(`Please copy or move the file 'config.dist.js' to 'config.js' and adjust the options accordingly.`);
    process.exit(1);
}

const Master = require('./server/master');
const config = require('./config');

const master = new Master(config);
master.start();
