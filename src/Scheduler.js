const roblox = require('./Roblox.js');

function readString(address) {
    let length = roblox.memoryjs.readMemory(roblox.handle, address + 0x10, roblox.memoryjs.INT); // std::string stores string length at string + 0x10

    if (length > 16) { // if std::string longer than 16 bytes, it's stored on the heap and the string is a pointer to the heap
        let pointer = roblox.memoryjs.readMemory(roblox.handle, address, roblox.memoryjs.INT);
        return roblox.memoryjs.readMemory(roblox.handle, pointer, roblox.memoryjs.STRING);
    }
    else {
        return roblox.memoryjs.readMemory(roblox.handle, address, roblox.memoryjs.STRING);
    }
}

function getJob(scheduler, jobName) {
    let jobsStart = roblox.memoryjs.readMemory(roblox.handle, scheduler + 0x134, roblox.memoryjs.INT);
    let jobsEnd = roblox.memoryjs.readMemory(roblox.handle, scheduler + 0x138, roblox.memoryjs.INT);

    for (let address = jobsStart; address !== jobsEnd; address += 8) {
        const job = roblox.memoryjs.readMemory(roblox.handle, address, roblox.memoryjs.INT);

        let jobNameInProcess = readString(job + 0x10);

        //console.log(jobNameInProcess); //(used for figuring out if i'm fucking delusional or not)

        if (jobNameInProcess === jobName) {
            return job;
        }
        
    }

    return 0;
}

function getDataModel(scheduler) {
    let dataModel = getJob(scheduler, "Net Peer Send");

    if (dataModel === 0) {
        throw new Error("DataModel not found");
    }

    return (dataModel + 0x28) + 0xC;
}

function getScriptContext(scheduler) {
    let job = getJob(scheduler, "WaitingHybridScriptsJob");

    if (job === 0) {
        throw new Error("WaitingHybridScriptsJob not found");
    }

    return roblox.memoryjs.readMemory(roblox.handle, job + 0x138, roblox.memoryjs.INT);

}

module.exports = {
    readString,
    getJob,
    getDataModel,
    getScriptContext
};