#include <napi.h>
#include <string>
#include <windows.h>
#include <tlhelp32.h>
#include "Luau/include/Luau/BytecodeBuilder.h"
#include "Luau/include/Luau/Compiler.h"
#include "zstd/include/zstd.h"
#include "zstd/include/xxhash.h"

#define get_byte(number, n) (((number) >> ((n)*8)) & 0xff)

class bytecode_encoder_t : public Luau::BytecodeEncoder {
	inline uint8_t encodeOp(uint8_t op) override {
		return op * 227;
	}
};

//borrowed from memoryjs lol
//too much shit is happening in here idek what is necessary and what isn't i am losing my sanity
struct Args {
	int state;
	std::string* bytecode;
	const char* chunk_name;
	int env;
	int ret;
};

void Map(void* pArgs) {
	using _luauvm_load = int32_t __fastcall (int, std::string*, const char*, int); 

	Args* args = (Args*)pArgs;
	_luauvm_load* luauvm_load = reinterpret_cast<_luauvm_load*>(0x580FE0);
	args->ret = luauvm_load(args->state, args->bytecode, args->chunk_name, args->env);
}

void Marker() {
	return;
}

struct Call {
  int returnValue;
  std::string returnString;
  DWORD exitCode;
};

LPVOID reserveString(HANDLE hProcess, const char* value, SIZE_T size) {
  LPVOID memoryAddress = VirtualAllocEx(hProcess, NULL, size, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
  WriteProcessMemory(hProcess, memoryAddress, value, size, NULL);
  return memoryAddress;
 }

HANDLE get_roblox() {
	PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);

    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);

    if (Process32First(snapshot, &entry) == TRUE)
    {
        while (Process32Next(snapshot, &entry) == TRUE)
        {
            if (stricmp(entry.szExeFile, "Windows10Universal.exe") == 0)
            {  
                return OpenProcess(PROCESS_ALL_ACCESS, FALSE, entry.th32ProcessID);
            }
        }
    }

    CloseHandle(snapshot);
	return NULL;
}

int shift(int num) {
	int value = *reinterpret_cast<int*>(num);
	for(int i = 0; i < 4; i++) {
		return get_byte(value, i);
	}
}

Napi::Value luauvm_load(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	const auto state = info[0].As<Napi::Number>().Int32Value();
	auto bytecode = info[1].As<Napi::String>().Utf8Value();
	const auto chunk_name = info[2].As<Napi::String>().Utf8Value();
	const auto ennv = info[3].As<Napi::Number>().Int32Value();
	const auto handle = (HANDLE)info[4].As<Napi::Number>().Int64Value();
	const auto addr = info[5].As<Napi::Number>().Int32Value();

	HANDLE hProc = get_roblox();

	Args args = { state, &bytecode, chunk_name.c_str(), ennv };

	uintptr_t dwFuncSize = (uintptr_t)Marker - (uintptr_t)Map;
	uintptr_t dwSize = dwFuncSize + sizeof(Args);

	void* pMemory = VirtualAllocEx(hProc, NULL, dwSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
	
	if (!pMemory) {
		return Napi::Value::From(env, GetLastError());
	}

	void* pArgs = (void*)((uintptr_t)pMemory + dwFuncSize);

	if (!WriteProcessMemory(hProc, pMemory, Map, dwFuncSize, nullptr) ||
		!WriteProcessMemory(hProc, pArgs, &args, sizeof(args), nullptr))
	{
		return Napi::Value::From(env, "memory fucky");
	}

	HANDLE hThread = CreateRemoteThread(hProc, 0, 0, (LPTHREAD_START_ROUTINE)pMemory, pArgs, 0, 0);
	if (!hThread)
	{
		return Napi::Value::From(env, "thread fucky");
	}
	WaitForSingleObject(hThread, INFINITE);
	DWORD dwExit = 0;
	GetExitCodeThread(hThread, &dwExit);

	if (!ReadProcessMemory(hProc, pArgs, &args, sizeof(args), nullptr)) {
		return Napi::Value::From(env, "read fucky");
	}

	VirtualFreeEx(hProc, pMemory, dwSize, MEM_RELEASE);
	CloseHandle(hThread);

	return Napi::Value::From(env, args.ret);
}

// "good artists copy, great artists steal" - Pablo Picasso or something idk
Napi::Value compress_bytecode(const Napi::CallbackInfo& info) {
	// Create buffer.
	Napi::Env env = info.Env();
	const std::string& bytecode = info[0].As<Napi::String>().Utf8Value();
	const auto data_size = bytecode.size();
	const auto max_size = ZSTD_compressBound(data_size);
	auto buffer = std::vector<char>(max_size + 8);

	// Copy RSB1 and data size into buffer
	memcpy(&buffer[0], "RSB1", 4u);
	memcpy(&buffer[4], &data_size, 4u);

	// Copy compressed bytecode into buffer.
	const auto compressed_size = ZSTD_compress(&buffer[8], max_size, bytecode.data(), data_size, ZSTD_maxCLevel());
	if (ZSTD_isError(compressed_size))
		throw std::runtime_error("Failed to compress the script bytecode.");
	// Encrypt buffer with hash key.
	const auto size = compressed_size + 8;
	const auto key = XXH32(buffer.data(), size, 42u);
	for (auto i = 0u; i < size; ++i)
		buffer[i] ^= get_byte(key, i % 4) + i * 41u;

	// Create and return output.
	return Napi::Value::From(env, std::string(buffer.data(), size));
}

Napi::Value compile(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();

	const std::string& script = info[0].As<Napi::String>().Utf8Value();
    static auto encoder = bytecode_encoder_t();
    return Napi::String::New(env, Luau::compile("task.spawn(function()\n" + script + "\nend)", {}, {}, &encoder));
}

Napi::Object init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "compressBytecode"), Napi::Function::New(env, compress_bytecode));
  exports.Set(Napi::String::New(env, "compile"), Napi::Function::New(env, compile));
  exports.Set(Napi::String::New(env, "luauVMLoad"), Napi::Function::New(env, luauvm_load));
  return exports;
}

NODE_API_MODULE(jsploit, init);