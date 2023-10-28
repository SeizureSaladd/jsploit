const memoryjs = require('memoryjs');
const roblox = memoryjs.openProcess('Windows10Universal.exe');

const base = roblox.modBaseAddr;
const handle = roblox.handle;

const topBase = memoryjs.findPattern(handle, '8B 47 ? 2B 47 ? C1 F8 04 3B C1', 0, 0);
const identityExtraSpace = memoryjs.findPattern(handle, '8B 47 ? 0F 10 40 ? 0F 11 85 68 FF FF FF', 0, 0);

const offsets = {
    getScheduler: scanFunction('E8 ? ? ? ? 8D 7E 68'),
    getState: scanFunction('E8 ? ? ? ? 8B F0 8D 8D A8 FD FF FF'),
    luauVMLoad: scanFunction('E8 ? ? ? ? 8B D0 64 A1'),
    taskSpawn: scanFunction('55 8B EC 6A FF 68 ? ? ? ? 64 A1 00 00 00 00 50 83 EC ? A1 ? ? ? ? 33 C5 89 45 EC 56 57 50 8D 45 F4 64 A3 00 00 00 00 8B 75 ? C7 45 E8', false),
    //taskDefer: 0x580070,
    print: scanFunction('E8 ? ? ? ? 0F BF 45 F8'),

    top: memoryjs.readMemory(handle, topBase + 2, memoryjs.CHAR),
    base: memoryjs.readMemory(handle, topBase + 5, memoryjs.CHAR),

    extraSpace: memoryjs.readMemory(handle, identityExtraSpace + 2, memoryjs.CHAR),
    identity: memoryjs.readMemory(handle, identityExtraSpace + 6, memoryjs.CHAR),
}

function scanFunction(pattern, isCall = true) {
    let address = memoryjs.findPattern(handle, pattern, 0, 0);

    if (isCall) {
        address += memoryjs.readMemory(handle, address + 1, memoryjs.INT) + 5;
    }

    return address - base;
}

const types = {
    getScheduler: () => {
        return memoryjs.callFunction(handle, [], memoryjs.T_INT, base + offsets.getScheduler);
    },
    luauVMLoad: (state, bytecode, chunkName, env) => {
        return memoryjs.callFunction(handle, [{
            type: memoryjs.T_INT,
            value: state
        },
        {
            type: memoryjs.T_STRING,
            value: bytecode
        },
        {
            type: memoryjs.T_STRING,
            value: chunkName
        },
        {
            type: memoryjs.T_INT,
            value: env
        }], memoryjs.T_INT, base + offsets.luauVMLoad);
    },
    getState: (context, identity, script) => {
        return memoryjs.callFunction(handle, [{type: memoryjs.T_INT, value: context}, {type: memoryjs.T_INT, value: identity}, {type: memoryjs.T_INT, value: script}], memoryjs.T_INT, base + offsets.getState);
    },
    taskSpawn: (state) => {
        return memoryjs.callFunction(handle, [{type: memoryjs.T_INT, value: state}], memoryjs.T_INT, base + offsets.taskSpawn);
    },
    taskDefer: (state) => {
        return memoryjs.callFunction(handle, [{type: memoryjs.T_INT, value: state}], memoryjs.T_INT, base + offsets.taskDefer);
    },
    print: (type, message) => {
        return memoryjs.callFunction(handle, [{type: memoryjs.T_INT, value: type}, {type: memoryjs.T_STRING, value: message}], memoryjs.T_INT, base + offsets.print);
    }
};

function getState(scriptContext) { //change every week
    const address = scriptContext + 276;
    const addressValue = memoryjs.readMemory(handle, address, memoryjs.INT);

    return address - addressValue;
}

function setIdentity(state, identity) {
    const extraSpaceAddress = memoryjs.readMemory(handle, state + offsets.extraSpace, memoryjs.INT);
    const identityAddress = extraSpaceAddress + offsets.identity;

    memoryjs.writeMemory(handle, identityAddress, identity, memoryjs.INT);
}


function popStack(state, amount) {
    const topAddress = state + offsets.top;
    const currentTop = memoryjs.readMemory(handle, topAddress, memoryjs.INT);

    memoryjs.writeMemory(handle, topAddress, currentTop - (16 * amount), memoryjs.INT);
}

module.exports = {
    getState,
    setIdentity,
    popStack,
    memoryjs,
    roblox,
    base,
    handle,
    offsets,
    types
};