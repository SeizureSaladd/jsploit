{
    "targets": [
        {
            "target_name": "jsploit",
            "include_dirs" : [
                "<!@(node -p \"require('node-addon-api').include\")",
                "Luau/include",
                "zstd/include"
            ],
            "libraries": [
                "../Luau/Luau.Compiler.lib",
                "../Luau/Luau.Ast.lib",
                "../zstd/lib/zstd_static.lib",
                "../zstd/lib/xxhash.lib",
            ],
            "sources": [
                "jsploit.cc",
            ],
            "defines": [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
        }
    ]
}