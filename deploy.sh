#! /bin/bash
git pull -f origin prod

# Server
cd server
npm install
npm run build
pm2 reload 0
pm2 save

# Client
cd ../client
npm install
npm run build
sudo cp -r dist/* /var/www/app.whatsleads.in/


# Server
cd ../admin
npm install
npm run build
sudo cp -r dist/* /var/www/admin.whatsleads.in/
