#!/bin/bash

# Client
cd client
npm install
npm run build
sudo cp -r dist/* /var/www/app.whatsleads.in/

# Server
cd ../server
npm install
npm run build
pm2 restart 0
