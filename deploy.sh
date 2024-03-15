#! /bin/bash
git pull -f origin wpautomation.tech

# Server
cd server
npm install
npm run build
pm2 reload wpautomation
pm2 save

# Client
cd ../client
npm install
npm run build
sudo cp -r dist/* /var/www/app.wpautomation.in/


# Server
cd ../admin
npm install
npm run build
sudo cp -r dist/* /var/www/admin.wpautomation.in/
