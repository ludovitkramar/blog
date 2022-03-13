# Bridged network for virtual machines in debian bullseye

## Creating the bridge

First the `/etc/network/interfaces` file:

```
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
allow-hotplug enp0s25
iface enp0s25 inet manual

auto br0
iface br0 inet dhcp
	bridge_ports enp0s25
```

This is great for me as I don't need to set up any addresses and the virtual machines automatically get their addresses and dns from the router.

## Making the network available to the virtual machines

Create an XML file named `br-net.xml` anywhere with the following contents:

```xml
<network>
  <name>br-net</name>
  <forward mode='bridge'/>
  <bridge name='br0'/>
</network>
```

Then import it with the command: `virsh net-define br-net.xml`
