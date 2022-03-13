# Install the synapse matrix server in an Arch Linux virtual machine.

1. Create zvol: `zfs create -V 15G z2mx/archsrvr-matrix`

1. See *Bridged network for virtual machines in debian bullseye* for information about this network setup.

2. Create the vm: 

 ```sh
 virt-install \
  --name archsrvr-matrix \
  --rng /dev/random \
  --memory 8192 \
  --vcpus 2 \
  --cpu host \
  --cdrom /z2mx/ISO/arch.iso \
  --boot cdrom \
  --os-variant archlinux \
  --disk path=/dev/zd32 \
  --network network=br-net \
  --graphics vnc
 ```

3. SSH into the vm host server with `ssh user@server -L 5900:localhost:5900`, and use a VNC viewer on `localhost:5900` to install arch.

4. Install and configure Arch Linux.

	1. Type `passwd` to set root password and connect to the vm through ssh for convenience.

	2. Create the following partitions: (dos disklabel)

	 ```sh
	 Device     Boot   Start      End  Sectors  Size Id Type
	 /dev/vda1  *      10240  1001471   991232  484M  c W95 FAT32 (LBA)
	 /dev/vda2       1011712 31457279 30445568 14.5G 83 Linux
	 ```

	6. I don't recommend creating a swapfile or swap partition, as 2G of memory is not enough for synapse, it will use a lot of swap and create high disk usage, without swap it is stable and causes no such issues.

	3. Format the partitions: `mkfs.fat -F 32 /dev/vda1` and `mkfs.ext4 /dev/vda2`.

	4. Mount them: `mount /dev/vda2 /mnt`, `mkdir /mnt/boot` and `mount /dev/vda1 /mnt/boot`.

	5. Install the system: `pacstrap /mnt base linux-lts nano matrix-synapse`.

	6. Run `genfstab -U /mnt >> /mnt/etc/fstab` and `arch-chroot /mnt`.

	7. Set up the network, create `/etc/systemd/network/20-wired.network` and add:

	 ```
	 [Match]
	 Name=enp1s0
	 
	 [Network]
	 DHCP=yes
	 ```

	 Enable `systemd-resolved` and `systemd-networkd`. 

	 Using `dhcpcd` is another great option.

	8. Install `openssh` and edit `/etc/ssh/sshd_config`:
	 
	 Find `PermitRootLogin`, uncomment and change to yes.

	 Enable `sshd`.

	9. Set root password with `passwd`.

	10. Run `ln -sf /usr/share/zoneinfo/Region/City /etc/localtime` and `hwclock --systohc`.

	10. Uncomment `en_US.UTF-8` in `/etc/locale.gen/` and run `locale-gen`.

	10. Create `/etc/locale` and add `LANG=en_US.UTF-8`.

	10. Set hostname in `/etc/hostname`.

	10. Install `grub` and `dosfstools`. Then run: `grub-install --target=i386-pc /dev/vda` and `grub-mkconfig -o /boot/grub/grub.cfg`.

	11. Exit chroot and power off. Destroy the VM if necessary.

	12. Run `virsh edit archsrvr-matrix` in the host, find `<boot dev='cdrom'/>` and change `cdrom` to `hd`. 
It is also good time to reduce the memory to `2097152`. Now start the vm.

	13. With this setup the system only uses 56M of memory, we have plenty of resources for the server.

	14. Install `sudo` and run:

	 ```
	 $ cd /var/lib/synapse
	 $ sudo -u synapse python -m synapse.app.homeserver \
	   --server-name my.domain.name \
	   --config-path /etc/synapse/homeserver.yaml \
	   --generate-config \
	   --report-stats=yes
	 ```

	15. Set `public_baseurl` in `/etc/synapse/homeserver.yaml`.

	16. Run `systemctl enable --now synapse.service` and create user with `register_new_matrix_user -c /etc/synapse/homeserver.yaml http://127.0.0.1:8008`.

	3. As we are running synapse inside a vm, comment out `bind_addresses` in `/etc/synapse/homeserver.yaml`.

5. Set up reverse proxy. (For Debian Bullseye with nginx)

	1. Create `/etc/nginx/sites-enabled/matrix.example.com`. And add what's below following these instructions https://github.com/matrix-org/synapse/blob/develop/docs/reverse_proxy.md

		```nginx
		server {
			listen 443 ssl http2;
			listen [::]:443 ssl http2;

			# For the federation port
			listen 8448 ssl http2 default_server;
			listen [::]:8448 ssl http2 default_server;

			server_name matrix.example.com;

			location ~* ^(\/_matrix|\/_synapse\/client) {
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
			}
		}
		```

	 Remember to change `server_name`.

	2. Run `certbot` to get a certificate for your domain.

4. Now you should have a working matrix homeserver! 
	

