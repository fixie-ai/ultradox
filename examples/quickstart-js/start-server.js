const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit'
});

process.on('exit', () => {
  server.kill();
});