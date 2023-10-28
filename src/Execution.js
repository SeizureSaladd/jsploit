const roblox = require('./Roblox.js');
const scheduler = require('./Scheduler.js');
const jsploit = require('./build/Release/jsploit');

function compressBytecode(bytecode) {
    return jsploit.compressBytecode(bytecode);
}

function executeBytecode(bytecode) {
    const schedulerr = roblox.types.getScheduler().returnValue;
    const scriptContext = scheduler.getScriptContext(schedulerr);
    const luaState = roblox.getState(scriptContext);
    roblox.setIdentity(luaState, 8); // HOW TO MAKE JAVASCRIPT LEVEL 9 EXPLOIT IN ROBLOX!!! BYFRON BYPASS LEVEL 9 EXPLOIT BETTER THAN SYNAPSE SEX AND SCRIPTAWARE!!! SYNAPSE SEX CRACK FREE | BETER THAN KRNL | UNPATCHED WORKIGN 2023!!

    const compressedBytecode = compressBytecode(bytecode);

    const h = roblox.types.luauVMLoad(luaState, compressedBytecode, "jsploi", 0, roblox.handle, roblox.offsets.luauVMLoad); //roblox.types.luauVMLoad(luaState, compressedBytecode, "jsploit", 0);

    console.log(h);

    roblox.types.taskSpawn(luaState);
    roblox.popStack(luaState, 1);
}

function executeScript(script) {
    if (script.length === 0) {
        return;
    }

    const bytecode = jsploit.compile(script);

    console.log(bytecode);

    if (bytecode === "") {
        roblox.types.print(2, ':sob:');
    }
    else {
        executeBytecode(bytecode);
    }
}

module.exports = {
    compressBytecode,
    executeBytecode,
    executeScript
}