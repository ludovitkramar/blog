# Setting up an Arch Linux virtual machine with VGA pass-through in Debian Bullseye

## Install needed packages

The command below from the debian wiki installs the basic packages, if using a host with a DE remove `--no-install-recommends` to get additional tools.

```
apt-get install --no-install-recommends qemu-system libvirt-clients libvirt-daemon-system
```

Install `virtinst` to create new virtual machines easily from the command line.

## Installing Arch Linux

First one needs to download the ISO file.

```
wget https://free.nchc.org.tw/arch/iso/2021.12.01/archlinux-2021.12.01-x86_64.iso
```

Then create the storage space, I used ZFS zvol:

```
zfs create -V 100G zmirror/arch-vm
```

Using ZFS on debian is just a matter of installing `zfsutils-linux`, `contrib` repo needs to be enabled.

With `virt-install` I created the virtual machine. Remember that ovmf needs to be installed to boot using uefi: `apt install ovmf`.

```
virt-install --name arch-vm --boot uefi --rng /dev/random --memory 12288 --vcpus 8 --cpu host --cdrom /z2mx/ISO/arch.iso --boot cdrom --os-variant archlinux --disk path=/dev/zd0 --network network=br-net --graphics vnc
```

As I did not want to install a DE in Debian, I ssh into the debian host with port forwarding from my laptop to install Arch Linux through vnc: `ssh user@debian.lan -L 5900:localhost:5900`.

Now it's time to format the disks and `pacstrap` the OS to our partitions. Refer to the wiki for detailed instructions. It may be possible to use the `archinstall` script.

Because I used a bridged network, I just followed the systemd-networkd instructions from the Arch Linux wiki, which is simply to create `/etc/systemd/network/20-wired.network` with this inside:

```
[Match]
Name=enp1s0

[Network]
DHCP=yes
```

Of course the `systemd-networkd` and `systemd-resolved` services need to be started.

I chose `systemd-boot` as the boot manager, while it is easy to install to the ESP partition with `bootctl install`, it requires some manual configuration.

First modify `/boot/loader/loader.conf` (assuming /boot is the ESP):

```
default arch.conf
timeout 0
console-mode max
editor no
```

As it is a virtual machine with only one system, I don't want any timeout, the next step is to create the entries, first one being `/boot/loader/entries/arch.conf`:

```
title    Arch Linux
linux    /vmlinuz-linux-zen
initrd   /initramfs-linux-zen.img
options  root="LABEL=arch_os" rw
```

And second one being `/boot/loader/entries/arch-fallback.conf`:

```
title    Arch Linux (fallback initramfs)
linux    /vmlinuz-linux-zen
initrd   /initramfs-linux-zen-fallback.img
options  root="LABEL=arch_os" rw
```

Be aware that I am using the linux-zen kernel, that needs to be changed if using other kernel(s).

The system will not boot if we don't actually label the root partition `arch_os`, so do that with `e2label`.

## GPU passthrough

### Identify our devices and make vfio-pci take care of them.

This is the interesting part, a script from the arch wiki can tell us the IOMMU groups, and the IDs of our PCI devices.

```
#!/bin/bash
shopt -s nullglob
for g in `find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V`; do
    echo "IOMMU Group ${g##*/}:"
    for d in $g/devices/*; do
        echo -e "\t$(lspci -nns ${d##*/})"
    done;
done;
```

The script works without any problem in Debian, in my case the part relevant to the GPU was like this:

```
IOMMU Group 1:
	00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v3/4th Gen Core Processor PCI Express x16 Controller [8086:0c01] (rev 06)
	01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] [1002:67df] (rev ef)
	01:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]
```

Now that we know the IDs we need to add them in this format to `/etc/initramfs-tools/modules`:

```
vfio_pci ids=1002:67df,1002:aaf0
```

After a reboot if we run `lspci -knn` we should see that the kernel driver in use is vfio-pci:

```
01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] [1002:67df] (rev ef)
	Subsystem: Micro-Star International Co., Ltd. [MSI] Radeon RX 570 Armor 8G OC [1462:341b]
	Kernel driver in use: vfio-pci
	Kernel modules: amdgpu
01:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]
	Subsystem: Micro-Star International Co., Ltd. [MSI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1462:aaf0]
	Kernel driver in use: vfio-pci
	Kernel modules: snd_hda_intel
```

Now the GPU is ready to be used in a virtual machine.

### Giving the GPU to the virtual machine.

First lets run `virsh nodedev-list --tree` to see the information about our devices. In my case `pci_0000_01_00_0` and `pci_0000_01_00_1` is what I want the vm to use.

If we run `virsh nodedev-dumpxml pci_0000_01_00_0` we can see all the information about our device, in `<product>` we can confirm that this is the gpu, but it is the `<address>` lines that we need. 

```
<device>
  <name>pci_0000_01_00_0</name>
  <path>/sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0</path>
  <parent>pci_0000_00_01_0</parent>
  <driver>
    <name>vfio-pci</name>
  </driver>
  <capability type='pci'>
    <class>0x030000</class>
    <domain>0</domain>
    <bus>1</bus>
    <slot>0</slot>
    <function>0</function>
    <product id='0x67df'>Ellesmere [Radeon RX 470/480/570/570X/580/580X/590]</product>
    <vendor id='0x1002'>Advanced Micro Devices, Inc. [AMD/ATI]</vendor>
    <iommuGroup number='1'>
      <address domain='0x0000' bus='0x00' slot='0x01' function='0x0'/>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x1'/>
    </iommuGroup>
    <pci-express>
      <link validity='cap' port='0' speed='8' width='16'/>
      <link validity='sta' speed='8' width='16'/>
    </pci-express>
  </capability>
</device>
```

Now let's edit the vm with `virsh edit vm-name`, a GPU is a multifunction device, we can see that from all the outputs of the different tools, so two `<hostdev>` in the `<devices>` section needs to be created.

I originally added the following:

```
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
  </source>
</hostdev>
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x1'/>
  </source>
</hostdev>
```

This software is very smart, so it added the addresses where the pci devices are connected to the vm, while now the vm could boot and use the gpu, I opened the settings again and put the two hostdev on the same bus and slot but with a different function, just like they were on the host. It does not seems to make a difference in my case, but I do want to mention it.

```
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x07' slot='0x00' function='0x0' multifunction='on'/>
    </hostdev>
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x01' slot='0x00' function='0x1'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x07' slot='0x00' function='0x1'/>
    </hostdev>
```

## A couple more things

Another things that doesn't seem to matter is running `virsh nodedev-dettach pci_0000_01_00_0`, supposedly that command prepared the device. But it probably is unnecessary with vfio, and when it is needed I observed no issues when not running this command, surely the software is smart enough to prepare the device when launching the vm.

Now it is just a matter of installing the drivers in the guest and enjoying the vm! In my case I passed through the USB controller of my motherboard and it works flawlessly, that leaves the host usb-less, so make sure ssh before doing that.

Make sure a device has the MSI capability before passing through, that can be checked with `lspci -v`, also, sometimes the bus address may be in decimal, it is usually in hexadecimal, that doesn't matter when the number is below 10 (almost always), but be aware that sometimes 14 = 20.

This is the USB controller that I passthrough, note that is has MSI:

```
00:14.0 USB controller: Intel Corporation 9 Series Chipset Family USB xHCI Controller (prog-if 30 [XHCI])
	Subsystem: ASRock Incorporation 9 Series Chipset Family USB xHCI Controller
	Flags: bus master, medium devsel, latency 0, IRQ 32, IOMMU group 4
	Memory at f7e20000 (64-bit, non-prefetchable) [size=64K]
	Capabilities: [70] Power Management version 2
	Capabilities: [80] MSI: Enable+ Count=1/8 Maskable- 64bit+
	Kernel driver in use: vfio-pci
	Kernel modules: xhci_pci
```

This is the edit to the vm's config:

```
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x00' slot='0x14' function='0x0'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x08' slot='0x00' function='0x0'/>
    </hostdev>
```

While it wasn't defined in `/etc/initramfs-tools/modules`, it uses the vfio-pci driver automatically when the vm is launched, restarting the vm also causes no issues.

## Happy computing!

Enjoy the virtual machine! The steps to have a Windows vm "should" be identical. Thanks for reading.
