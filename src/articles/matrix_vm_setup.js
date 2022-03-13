import '../article.css';
 
 const matrix_vm_setup = () => {
 return (
 <>

<h1 id="install-the-synapse-matrix-server-in-an-arch-linux-virtual-machine.">Install the synapse matrix server in an Arch Linux virtual machine.</h1>
<ol type="1">
<li><p>Create zvol: <code>zfs create -V 15G z2mx/archsrvr-matrix</code></p></li>
<li><p>See <em>Bridged network for virtual machines in debian bullseye</em> for information about this network setup.</p></li>
<li><p>Create the vm:</p></li>
</ol>
<div class="sourceCode" id="cb1"><pre class="sourceCode sh"><code class="sourceCode bash"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a><span class="ex">virt-install</span> <span class="dt">\</span></span>
<span id="cb1-2"><a href="#cb1-2" aria-hidden="true" tabindex="-1"></a> <span class="at">--name</span> archsrvr-matrix <span class="dt">\</span></span>
<span id="cb1-3"><a href="#cb1-3" aria-hidden="true" tabindex="-1"></a> <span class="at">--rng</span> /dev/random <span class="dt">\</span></span>
<span id="cb1-4"><a href="#cb1-4" aria-hidden="true" tabindex="-1"></a> <span class="at">--memory</span> 8192 <span class="dt">\</span></span>
<span id="cb1-5"><a href="#cb1-5" aria-hidden="true" tabindex="-1"></a> <span class="at">--vcpus</span> 2 <span class="dt">\</span></span>
<span id="cb1-6"><a href="#cb1-6" aria-hidden="true" tabindex="-1"></a> <span class="at">--cpu</span> host <span class="dt">\</span></span>
<span id="cb1-7"><a href="#cb1-7" aria-hidden="true" tabindex="-1"></a> <span class="at">--cdrom</span> /z2mx/ISO/arch.iso <span class="dt">\</span></span>
<span id="cb1-8"><a href="#cb1-8" aria-hidden="true" tabindex="-1"></a> <span class="at">--boot</span> cdrom <span class="dt">\</span></span>
<span id="cb1-9"><a href="#cb1-9" aria-hidden="true" tabindex="-1"></a> <span class="at">--os-variant</span> archlinux <span class="dt">\</span></span>
<span id="cb1-10"><a href="#cb1-10" aria-hidden="true" tabindex="-1"></a> <span class="at">--disk</span> path=/dev/zd32 <span class="dt">\</span></span>
<span id="cb1-11"><a href="#cb1-11" aria-hidden="true" tabindex="-1"></a> <span class="at">--network</span> network=br-net <span class="dt">\</span></span>
<span id="cb1-12"><a href="#cb1-12" aria-hidden="true" tabindex="-1"></a> <span class="at">--graphics</span> vnc</span></code></pre></div>
<ol start="3" type="1">
<li><p>SSH into the vm host server with <code>ssh user@server -L 5900:localhost:5900</code>, and use a VNC viewer on <code>localhost:5900</code> to install arch.</p></li>
<li><p>Install and configure Arch Linux.</p>
<ol type="1">
<li><p>Type <code>passwd</code> to set root password and connect to the vm through ssh for convenience.</p></li>
<li><p>Create the following partitions: (dos disklabel)</p></li>
</ol>
<div class="sourceCode" id="cb2"><pre class="sourceCode sh"><code class="sourceCode bash"><span id="cb2-1"><a href="#cb2-1" aria-hidden="true" tabindex="-1"></a><span class="ex">Device</span>     Boot   Start      End  Sectors  Size Id Type</span>
<span id="cb2-2"><a href="#cb2-2" aria-hidden="true" tabindex="-1"></a><span class="ex">/dev/vda1</span>  <span class="pp">*</span>      10240  1001471   991232  484M  c W95 FAT32 <span class="er">(</span><span class="ex">LBA</span><span class="kw">)</span></span>
<span id="cb2-3"><a href="#cb2-3" aria-hidden="true" tabindex="-1"></a><span class="ex">/dev/vda2</span>       1011712 31457279 30445568 14.5G 83 Linux</span></code></pre></div>
<ol start="6" type="1">
<li><p>I don&#x2019;t recommend creating a swapfile or swap partition, as 2G of memory is not enough for synapse, it will use a lot of swap and create high disk usage, without swap it is stable and causes no such issues.</p></li>
<li><p>Format the partitions: <code>mkfs.fat -F 32 /dev/vda1</code> and <code>mkfs.ext4 /dev/vda2</code>.</p></li>
<li><p>Mount them: <code>mount /dev/vda2 /mnt</code>, <code>mkdir /mnt/boot</code> and <code>mount /dev/vda1 /mnt/boot</code>.</p></li>
<li><p>Install the system: <code>pacstrap /mnt base linux-lts nano matrix-synapse</code>.</p></li>
<li><p>Run <code>genfstab -U /mnt &gt;&gt; /mnt/etc/fstab</code> and <code>arch-chroot /mnt</code>.</p></li>
<li><p>Set up the network, create <code>/etc/systemd/network/20-wired.network</code> and add:</p></li>
</ol>
<pre><code>[Match]
Name=enp1s0

[Network]
DHCP=yes</code></pre>
<p>Enable <code>systemd-resolved</code> and <code>systemd-networkd</code>.</p>
<p>Using <code>dhcpcd</code> is another great option.</p>
<ol start="8" type="1">
<li>Install <code>openssh</code> and edit <code>/etc/ssh/sshd_config</code>:</li>
</ol>
<p>Find <code>PermitRootLogin</code>, uncomment and change to yes.</p>
<p>Enable <code>sshd</code>.</p>
<ol start="9" type="1">
<li><p>Set root password with <code>passwd</code>.</p></li>
<li><p>Run <code>ln -sf /usr/share/zoneinfo/Region/City /etc/localtime</code> and <code>hwclock --systohc</code>.</p></li>
<li><p>Uncomment <code>en_US.UTF-8</code> in <code>/etc/locale.gen/</code> and run <code>locale-gen</code>.</p></li>
<li><p>Create <code>/etc/locale</code> and add <code>LANG=en_US.UTF-8</code>.</p></li>
<li><p>Set hostname in <code>/etc/hostname</code>.</p></li>
<li><p>Install <code>grub</code> and <code>dosfstools</code>. Then run: <code>grub-install --target=i386-pc /dev/vda</code> and <code>grub-mkconfig -o /boot/grub/grub.cfg</code>.</p></li>
<li><p>Exit chroot and power off. Destroy the VM if necessary.</p></li>
<li><p>Run <code>virsh edit archsrvr-matrix</code> in the host, find <code>&lt;boot dev='cdrom'/&gt;</code> and change <code>cdrom</code> to <code>hd</code>. It is also good time to reduce the memory to <code>2097152</code>. Now start the vm.</p></li>
<li><p>With this setup the system only uses 56M of memory, we have plenty of resources for the server.</p></li>
<li><p>Install <code>sudo</code> and run:</p></li>
</ol>
<pre><code>$ cd /var/lib/synapse
$ sudo -u synapse python -m synapse.app.homeserver \
  --server-name my.domain.name \
  --config-path /etc/synapse/homeserver.yaml \
  --generate-config \
  --report-stats=yes</code></pre>
<ol start="15" type="1">
<li><p>Set <code>public_baseurl</code> in <code>/etc/synapse/homeserver.yaml</code>.</p></li>
<li><p>Run <code>systemctl enable --now synapse.service</code> and create user with <code>register_new_matrix_user -c /etc/synapse/homeserver.yaml http://127.0.0.1:8008</code>.</p></li>
<li><p>As we are running synapse inside a vm, comment out <code>bind_addresses</code> in <code>/etc/synapse/homeserver.yaml</code>.</p></li>
</ol></li>
<li><p>Set up reverse proxy. (For Debian Bullseye with nginx)</p>
<ol type="1">
<li><p>Create <code>/etc/nginx/sites-enabled/matrix.example.com</code>. And add what&#x2019;s below following these instructions https://github.com/matrix-org/synapse/blob/develop/docs/reverse_proxy.md</p>
<pre class="nginx"><code>server &#123;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    # For the federation port
    listen 8448 ssl http2 default_server;
    listen [::]:8448 ssl http2 default_server;

    server_name matrix.example.com;

    location ~* ^(\/_matrix|\/_synapse\/client) &#123;
        # note: do not add a path (even a single /) after the port in `proxy_pass`,
        # otherwise nginx will canonicalise the URI and cause signature verification
        # errors.
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;

        # Nginx by default only allows file uploads up to 1M in size
        # Increase client_max_body_size to match max_upload_size defined in homeserver.yaml
        client_max_body_size 50M;
    &#125;
&#125;</code></pre></li>
</ol>
<p>Remember to change <code>server_name</code>.</p>
<ol start="2" type="1">
<li>Run <code>certbot</code> to get a certificate for your domain.</li>
</ol></li>
<li><p>Now you should have a working matrix homeserver!</p></li>
</ol>

 </>
 )
 };
 
 export default matrix_vm_setup;

