<p align="center">
  <img width="600" src="assets/jsploit.png">
  <br>
  JSploit is a node.js Roblox exploit written in JavaScript
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/SeizureSaladd/jsploit" alt="GitHub License">
  <img src="https://img.shields.io/github/downloads/SeizureSaladd/jsploit/total" alt="GitHub All Releases">
  <img src="https://img.shields.io/github/stars/SeizureSaladd/jsploit" alt="GitHub Repo stars">
</p>

<p align="center">
  <a href="#jsploit">jsploit</a> •
  <a href="#features">Features</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
</p>


---

# jsploit
A node.js UWP Roblox exploit written in JavaScript for maximum comedic effect.

Was not intended for actual usage but instead a fun project.

## Features
- Fully external (no DLL injected)
- Executes lua code
- Luau compilation and Luau bytecode compression
- Written in language not meant for this

TODO:
- Add custom functions
- ???

# Prerequisites
- Node.js
- memoryjs and node-gyp packages

# Getting Started
1. Clone the repository to your local machine.
2. Install the required packages. **(NOTE: READ [MEMORYJS](https://github.com/Rob--/memoryjs/tree/master) AND [NODE-GYP](https://github.com/nodejs/node-gyp) INSTALLATION INSTRUCTIONS)**
```bash
npm install
```
3. Open Roblox
4. Run the executor using the following command:
```bash
node .
```

# Contributing
Contributions are welcome. If you make it betterer open a pull request. Just note that you must change the `RuntimeLibrary` in the node-gyp generated `.vcxproj` file to `MultiThreadedDLL` or else Luau will not work.

# License
This project is licensed under [GNU GPLv3](LICENSE) which means you're free to do what you want except distributing closed source versions. (NO SKIDS ALLOWED!!!1111!!)
