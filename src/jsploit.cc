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
