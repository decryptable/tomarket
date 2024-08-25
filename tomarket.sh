#!/bin/bash

is_git_installed() {
    if ! [ -x "$(command -v git)" ]; then
        echo "Git is not installed. Installing Git..."
        pkg install git -y
    fi
}

is_nodejs_installed() {
    if ! [ -x "$(command -v node)" ]; then
        echo "Node.js is not installed. Installing Node.js LTS..."
        pkg install nodejs-lts -y
    fi
}

is_nodejs_in_version_14_higher() {
    NODE_VERSION=$(node -v | grep -oP '^v\K[0-9]+')
    
    if [ "$NODE_VERSION" -lt 14 ]; then
        echo "Node.js version is lower than 14. Upgrading to Node.js LTS..."
        pkg uninstall nodejs -y
        pkg uninstall nodejs-lts -y
        pkg install nodejs-lts -y
    fi
}

# Main script
app() {
    is_nodejs_installed
    is_nodejs_in_version_14_higher
    is_git_installed
    
    # check if file "tomarket.js" exists
    if [ -d "tomarket-tool" ]; then
        cd tomarket-tool
        echo "Checking avaiable update..."
        git pull
        
        echo "Starting..."
        node $(pwd)/index.js
    else
        git clone https://github.com/decryptable/tomarket tomarket-tool &>/dev/null
        cd tomarket-tool
        
        echo "Installing dependencies..."
        npm install

        echo "Starting..."
        node $(pwd)/index.js
    fi
}

# Execute the main function
app
