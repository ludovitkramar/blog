# macOS Big Sur vm with GPU pass-through on debian host.

This is done on Debian Bullseye. See other posts for context on GPU pass-through and network setup.

## Virtual machine installation

I used this project: https://github.com/kholia/OSX-KVM

In a directory where you want to store the vm (and the virtual disk) run:

1. `git clone --depth 1 --recursive https://github.com/kholia/OSX-KVM.git`

1. `./fetch-macOS-v2.py`

1. Choose `4. Big Sur (11.6) - RECOMMENDED`

1. `apt install --no-install-recommends libguestfs-tools`

1. `qemu-img convert BaseSystem.dmg -O raw BaseSystem.img`

1. `qemu-img create -f qcow2 mac_hdd_ng.img 128G`

1. The following command is presented as mandatory, but without it, I do not observe any differences.

    ```echo 1 > /sys/module/kvm/parameters/ignore_msrs```

1. `./OpenCore-Boot.sh`

## Install macOS

- Connect to VNC with ssh tunnel.

- Choose Disk Utility

- Click Erase, name the partition and chose Mac OS Extended (Journaled).

- Close Disk Utility and Click reinstall Big Sur.

- Follow the installation steps and wait until the first stage finishes.

On the host run `sed "s/CHANGEME/$USER/g" macOS-libvirt-Catalina.xml > macOS.xml`.

```
    <interface type='network'>
      <mac address='52:54:00:10:35:7a'/>
      <source network='br-net'/>
      <model type='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
    </interface>
```
Change directory of files, and set up network. 

`      <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>` confirm network card's bus must be on `0x00`.

Install `virt-viewer` to connect remotely through spice. (Or change the settings to use VNC).

`ssh user@host -L 5900:localhost:5900 5901:localhost:5901 5902:localhost:5902`

- virsh-edit

change top line to `<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>`

```
  <qemu:commandline>
    <qemu:arg value='-device'/>
    <qemu:arg value='isa-applesmc,osk=ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc'/>
    <qemu:arg value='-smbios'/>
    <qemu:arg value='type=2'/>
    <qemu:arg value='-device'/>
    <qemu:arg value='usb-tablet'/>
    <qemu:arg value='-device'/>
    <qemu:arg value='usb-kbd'/>
    <qemu:arg value='-cpu'/>
    <qemu:arg value='Penryn,kvm=on,vendor=GenuineIntel,+invtsc,vmware-cpuid-freq=on,+ssse3,+sse4.2,+popcnt,+avx,+aes,+xsave,+xsaveopt,check'>
  </qemu:commandline>
```

Don't let multiple VMs have the same mac address.

Choose Installer when booting

Finish the setup process and shutdown.

```
    <graphics type='spice' autoport='yes'>
      <listen type='address'/>
    </graphics>
    <video>
      <model type='vga' vram='65536' heads='1' primary='yes'/>
      <address type='pci' domain='0x0000' bus='0x09' slot='0x01' function='0x0'/>
    </video>
```

Replace the above graphics stuff with pci pass-through.

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
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x00' slot='0x14' function='0x0'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x08' slot='0x00' function='0x0'/>
    </hostdev>
```

Give it more memory and cpu

```
  <memory unit='KiB'>12582912</memory>
  <currentMemory unit='KiB'>12582912</currentMemory>
  <vcpu placement='static'>8</vcpu>
```

## Notes

Trying to upgrade proves to be rather unstable and restarting can cause issues, after shutting down the mac vm I tried to start a linux vm with the same pci devices pass-through settings, the debian host crashed completely, and other random issues can also be present.

XCode seems to work fine. 

I have passed the host usb controller from the motherboard to the vm, this allows the vm to use all the usb ports, by doing so I can plug my dragonfly red usb audio device and have audio without any hassle. The issue with this is that often there is cracking noises, I observe them in linux when under high load, but on macOS these glitches are much more prevalent.