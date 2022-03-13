import '../article.css';
 
 const nextcloud_snap_setup = () => {
 return (
 <>

<h1 id="setting-up-nextcloud-in-an-ubuntu-server-20.04-vm-with-snap-and-nginx-as-proxy.">Setting up Nextcloud in an Ubuntu Server 20.04 VM with snap and NGINX as proxy.</h1>
<h2 id="installing-ubuntu-server-vm">Installing Ubuntu Server VM</h2>
<p>First download the ISO, then I used <code>virt-install</code> to create the virtual machine:</p>
<pre><code>virt-install \
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
    --graphics vnc</code></pre>
<p>If the host has no gui like mine, it is possible to ssh into the host with port forwarding: <code>ssh user@host -L 5900:localhost:5900</code>, then using <code>localhost:5900</code> as the address on any VNC viewer allows you to control the installer.</p>
<p>The installation process is very simple, remember to set up ssh because using VNC is not as convenient.</p>
<p>After the installation, type <code>virsh edit ubnsrvr-vm</code> and change <code>cdrom</code> to <code>hd</code> in the <code>&lt;boot&gt;</code> section.</p>
<pre><code>&lt;os&gt;
    &lt;type arch=&#39;x86_64&#39; machine=&#39;pc-q35-5.2&#39;&gt;hvm&lt;/type&gt;
    &lt;boot dev=&#39;hd&#39;/&gt;
&lt;/os&gt;</code></pre>
<p>Optionally delete the graphics and VNC sections too, make a copy before doing any modifications.</p>
<p>Now Ubuntu Server is installed and working.</p>
<h2 id="nextcloud-reverse-proxy-with-nginx">Nextcloud reverse proxy with nginx</h2>
<p>Looking around I ended up with this Frankenstein file for nginx (to be put inside <code>/etc/nginx/sites-enabled</code>), with which everything seems to work fine.</p>
<pre class="nginx"><code>server &#123;
    server_name nc.kykvit.com;

    location ~ /\.ht &#123;
    deny all;
    &#125;

    listen [::]:443 ssl http2; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nc.kykvit.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nc.kykvit.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    add_header Strict-Transport-Security &quot;max-age=31536000; includeSubDomains&quot; always;

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

    location / &#123;
        proxy_pass http://192.168.1.231:80;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
    &#125;

    location /.well-known/carddav &#123;
        return 301 $scheme://$host/remote.php/dav;
    &#125;

    location /.well-known/caldav &#123;
        return 301 $scheme://$host/remote.php/dav;
    &#125;

&#125;

server &#123;
    if ($host = nc.kykvit.com) &#123;
        return 301 https://$host$request_uri;
    &#125; # managed by Certbot


        listen 80;
        listen [::]:80;

    server_name nc.kykvit.com;
    return 404; # managed by Certbot
&#125;</code></pre>
<h2 id="nextcloud-android-app-strict-mode-complaint-when-trying-to-log-in">Nextcloud Android app strict mode complaint when trying to log in</h2>
<p>Nextcloud was installed via snap in an ubuntu server 20.04 virtual machine, the network is bridged to my home LAN.</p>
<p>With these tweaks to <code>/var/snap/nextcloud/current/nextcloud/config/config.php</code> everything worked fine. Some of this settings may not be necessary.</p>
<div class="sourceCode" id="cb4"><pre class="sourceCode php"><code class="sourceCode php"><span id="cb4-1"><a href="#cb4-1" aria-hidden="true" tabindex="-1"></a><span class="kw">&lt;?php</span></span>
<span id="cb4-2"><a href="#cb4-2" aria-hidden="true" tabindex="-1"></a><span class="va">$CONFIG</span> <span class="op">=</span> <span class="dt">array</span> (</span>
<span id="cb4-3"><a href="#cb4-3" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;trusted_domains&#39;</span> =&gt; </span>
<span id="cb4-4"><a href="#cb4-4" aria-hidden="true" tabindex="-1"></a>  <span class="dt">array</span> (</span>
<span id="cb4-5"><a href="#cb4-5" aria-hidden="true" tabindex="-1"></a>    <span class="dv">0</span> =&gt; <span class="st">&#39;nc.kykvit.com&#39;</span><span class="ot">,</span></span>
<span id="cb4-6"><a href="#cb4-6" aria-hidden="true" tabindex="-1"></a>  )<span class="ot">,</span></span>
<span id="cb4-7"><a href="#cb4-7" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;trusted_proxies&#39;</span> =&gt; <span class="dt">array</span>(<span class="st">&#39;192.168.1.0/24&#39;</span><span class="ot">,</span> <span class="st">&#39;nc.kykvit.com&#39;</span>)<span class="ot">,</span> </span>
<span id="cb4-8"><a href="#cb4-8" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;overwriteprotocol&#39;</span> =&gt; <span class="st">&#39;https&#39;</span><span class="ot">,</span></span>
<span id="cb4-9"><a href="#cb4-9" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;allow_local_remote_servers&#39;</span> =&gt; <span class="kw">true</span><span class="ot">,</span></span>
<span id="cb4-10"><a href="#cb4-10" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;overwrite.cli.url&#39;</span> =&gt; <span class="st">&#39;http://nc.kykvit.com&#39;</span><span class="ot">,</span></span>
<span id="cb4-11"><a href="#cb4-11" aria-hidden="true" tabindex="-1"></a>  <span class="st">&#39;default_phone_region&#39;</span> =&gt; <span class="st">&#39;TW&#39;</span><span class="ot">,</span></span>
<span id="cb4-12"><a href="#cb4-12" aria-hidden="true" tabindex="-1"></a>)<span class="ot">;</span></span></code></pre></div>

 </>
 )
 };
 
 export default nextcloud_snap_setup;

