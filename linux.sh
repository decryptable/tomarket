clear
echo "Checking update..."
npm i > /dev/null
npm update > /dev/null

node ./index.js $@