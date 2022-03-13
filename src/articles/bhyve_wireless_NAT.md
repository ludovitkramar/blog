# bhyve wireless NAT vm setup[^1]

[^1]: https://aliov.org/index.php/2020/03/22/bhyve-nat-vm-setup/

Chapter 21 of the FreeBSD handbook on bhyve (https://www.freebsd.org/doc/handbook/virtualization-host-bhyve.html) explains how to set up bridged network for your vm. This will work on an ethernet network card, but it won’t work on wlan (wlan cannot have more than one MAC address).

I use bhyve on my FreeBSD 12.1 laptop to fire up Linux VM. So typically I’m connected to a wireless network and would like to have internet working on my Linux VM. In what follows I share my setup to get a simple NAT. First let’s create the required network interfaces.

```
# ifconfig bridge create name natif up
# ifconfig tap0 create up 
# ifconfig natif addm tap0
# ifconfig natif inet 10.0.0.1/24
```

Next we need to forward our NAT network traffic through the wireless interface, we use pf to do that, by adding the following lines to /etc/pf.conf

```
ext_if="wlan0"
virt_net="10.0.0.0/24"
scrub all
nat on $ext_if from $virt_net to any -> ($ext_if)
pass log all
```

Don’t forget to enable pf if it is not enabled, and restart it for the changes to take effect. We also make sure that ip forwarding is enabled on the host.

```
# sysrc pf_enable=yes
# service pf restart
# sysctl net.inet.ip.forwarding=1
```

Then you can fire up your VM using tap0. Once booted, you can configure your guest network interface to be static (inet 10.0.0.2/24). This will allow the guest to access the NAT network, and it will be reachable from the host on 10.0.0.2.

Make sure to always activate the tap device before starting your VM (or after shutting it down). Here is a startup script of my openSUSE 15.1 VM

```
 ifconfig tap0 up
 bhyve -AHP -s 0:0,hostbridge -s 1:0,lpc \
 -s 2:0,virtio-net,tap0 -s 3:0,virtio-blk,./disk.img \
 -s 4:0,ahci-cd,./openSUSE-Leap-15.1-NET-x86_64.iso \
 -c 4 -m 2048M \
 -s 11,fbuf,tcp=0.0.0.0:5901,w=1280,h=1024,wait \
 -s 30,xhci,tablet \
 -s 6,hda,play=/dev/dsp0,rec=/dev/dsp0 \
 -l bootrom,/usr/local/share/uefi-firmware/BHYVE_UEFI.fd \
 opensuse15
```
