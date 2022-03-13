# Setting up Nextcloud in an Ubuntu Server 20.04 VM with snap and NGINX as proxy.

## Installing Ubuntu Server VM

First download the ISO, then I used `virt-install` to create the virtual machine:

```
virt-install \
	--name ubnsrvr-vm \
	--rng /dev/random \
	--memory 4096 \
	--vcpus 8 \
	--cpu host \
	--cdrom /z2mx/ISO/ubuntu-20.04.3-live-server-amd64.iso \
	--boot cdrom \
	--os-variant ubuntufocal \
	--disk path=/dev/zd16 \
	--network network=br-net \
	--graphics vnc
```

If the host has no gui like mine, it is possible to ssh into the host with port forwarding: `ssh user@host -L 5900:localhost:5900`, then using `localhost:5900` as the address on any VNC viewer allows you to control the installer.

The installation process is very simple, remember to set up ssh because using VNC is not as convenient.

After the installation, type `virsh edit ubnsrvr-vm` and change `cdrom` to `hd` in the `<boot>` section.

```
<os>
    <type arch='x86_64' machine='pc-q35-5.2'>hvm</type>
    <boot dev='hd'/>
</os>
```

Optionally delete the graphics and VNC sections too, make a copy before doing any modifications.

Now Ubuntu Server is installed and working.

## Nextcloud reverse proxy with nginx

Looking around I ended up with this Frankenstein file for nginx (to be put inside `/etc/nginx/sites-enabled`), with which everything seems to work fine.

```nginx
server {
    server_name nc.kykvit.com;

    location ~ /\.ht {
	deny all;
    }

    listen [::]:443 ssl http2; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nc.kykvit.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nc.kykvit.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # set max upload size and increase upload timeout:
    client_max_body_size 512M;
    client_body_timeout 300s;

    # Enable gzip but do not remove ETag headers
    gzip on;
    gzip_vary on;
    gzip_comp_level 4;
    gzip_min_length 256;
    gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
    gzip_types application/atom+xml application/javascript application/json application/ld+json application/manifest+json application/rss+xml application/vnd.geo+json application/vnd.ms-fontobject application/wasm application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/bmp image/svg+xml image/x-icon text/cache-manifest text/css text/plain text/vcard text/vnd.rim.location.xloc text/vtt text/x-component text/x-cross-domain-policy;

    location / {
        proxy_pass http://192.168.1.231:80;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /.well-known/carddav {
        return 301 $scheme://$host/remote.php/dav;
    }

    location /.well-known/caldav {
        return 301 $scheme://$host/remote.php/dav;
    }

}

server {
    if ($host = nc.kykvit.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen 80;
        listen [::]:80;

	server_name nc.kykvit.com;
    return 404; # managed by Certbot
}
```

## Nextcloud Android app strict mode complaint when trying to log in

Nextcloud was installed via snap in an ubuntu server 20.04 virtual machine, the network is bridged to my home LAN.

With these tweaks to `/var/snap/nextcloud/current/nextcloud/config/config.php` everything worked fine. Some of this settings may not be necessary.

```php
<?php
$CONFIG = array (
  'trusted_domains' => 
  array (
    0 => 'nc.kykvit.com',
  ),
  'trusted_proxies' => array('192.168.1.0/24', 'nc.kykvit.com'), 
  'overwriteprotocol' => 'https',
  'allow_local_remote_servers' => true,
  'overwrite.cli.url' => 'http://nc.kykvit.com',
  'default_phone_region' => 'TW',
);
```

