@echo off
title Tomarket Tool - by https://t.me/@decryptable

cls

echo Checking update...
npm i > NUL
npm update > NUL
node ./index.js -i %*