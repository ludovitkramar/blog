#!/bin/bash

mv ./src/settings.js ./src/settings.js.bak
cp ./src/settings-kykvit.js ./src/settings.js
npm run build
rm ./src/settings.js
mv ./src/settings.js.bak ./src/settings.js
rsync -a -e 'ssh -p 22' ~/NFS/Informatica/Mis\ proyectos/En\ progreso/blog/build/ root@kykvit.com:/var/www/blog
rsync -a -e 'ssh -p 22' ~/NFS/Informatica/Mis\ proyectos/En\ progreso/blog-api/ root@kykvit.com:/var/www/blog-api
