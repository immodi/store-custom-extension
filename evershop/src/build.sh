#!/bin/bash

# Compile TypeScript
npx tsc

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "Compilation successful, copying evershop.js..."
    mv evershop.js ../
    echo "File copied to parent directory."
else
    echo "Compilation failed, not copying the file."
    exit 1
fi
