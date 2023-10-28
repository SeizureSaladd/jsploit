/*******************************************************************************************
 * JSploit v1.0.0
 * Made by Seizure Salad
 * Special thanks to:
 * - UM9 (for dumper)
 * - mickeydev (for dll src that i just copied)
 * - Reversed, Wyvern, Fordlostfocus, and others (for helping me because i'm dumb as shit)
 * - memoryjs and node-gyp
 ********************************/

const execution = require('./Execution.js');
const readline = require('readline');

console.log('\x1b[31m%s\x1b[0m', `

 ▄▄▄██▀▀▀██████  ██▓███   ██▓     ▒█████   ██▓▄▄▄█████▓
   ▒██ ▒██    ▒ ▓██░  ██▒▓██▒    ▒██▒  ██▒▓██▒▓  ██▒ ▓▒
   ░██ ░ ▓██▄   ▓██░ ██▓▒▒██░    ▒██░  ██▒▒██▒▒ ▓██░ ▒░
▓██▄██▓  ▒   ██▒▒██▄█▓▒ ▒▒██░    ▒██   ██░░██░░ ▓██▓ ░ 
 ▓███▒ ▒██████▒▒▒██▒ ░  ░░██████▒░ ████▓▒░░██░  ▒██▒ ░ 
 ▒▓▒▒░ ▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░░ ▒░▓  ░░ ▒░▒░▒░ ░▓    ▒ ░░   
 ▒ ░▒░ ░ ░▒  ░ ░░▒ ░     ░ ░ ▒  ░  ░ ▒ ▒░  ▒ ░    ░    
 ░ ░ ░ ░  ░  ░  ░░         ░ ░   ░ ░ ░ ▒   ▒ ░  ░      
 ░   ░       ░               ░  ░    ░ ░   ░           
 
 JSploit v1.0.0 - Made by Seizure Salad

 Enter script below. Type "exit" to quit.
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getScript() {
  rl.question('> ', (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    execution.executeScript(input);
    getScript();
  });
}

getScript();

rl.on('close', () => {
  console.log('Exiting...');
  process.exit(0);
});



