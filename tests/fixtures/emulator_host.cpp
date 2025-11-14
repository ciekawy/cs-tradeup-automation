#include <iostream>
#include <dlfcn.h>
#include <unistd.h>
#include <string>

int main() {
    // Path to the emulator's dynamic library
    // This assumes the library is in the same directory as the executable
    std::string lib_path = "./libsteam_api.dylib";

    void* handle = dlopen(lib_path.c_str(), RTLD_LAZY);

    if (!handle) {
        std::cerr << "Cannot open library: " << dlerror() << std::endl;
        return 1;
    }

    std::cout << "Goldberg Emulator library loaded successfully." << std::endl;
    std::cout << "Emulator host is running. Press Ctrl+C to stop." << std::endl;

    // Keep the process alive
    while (true) {
        sleep(1);
    }

    // The following lines will not be reached in this simple example
    dlclose(handle);
    return 0;
}
