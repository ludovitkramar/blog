import '../article.css';
 
 const arch_vm_with_gpu = () => {
 return (
 <>

<h1 id="setting-up-an-arch-linux-virtual-machine-with-vga-pass-through-in-debian-bullseye">Setting up an Arch Linux virtual machine with VGA pass-through in Debian Bullseye</h1>
<h2 id="install-needed-packages">Install needed packages</h2>
<p>The command below from the debian wiki installs the basic packages, if using a host with a DE remove <code>--no-install-recommends</code> to get additional tools.</p>
<pre><code>apt-get install --no-install-recommends qemu-system libvirt-clients libvirt-daemon-system</code></pre>
<p>Install <code>virtinst</code> to create new virtual machines easily from the command line.</p>
<h2 id="installing-arch-linux">Installing Arch Linux</h2>
<p>First one needs to download the ISO file.</p>
<pre><code>wget https://free.nchc.org.tw/arch/iso/2021.12.01/archlinux-2021.12.01-x86_64.iso</code></pre>
<p>Then create the storage space, I used ZFS zvol:</p>
<pre><code>zfs create -V 100G zmirror/arch-vm</code></pre>
<p>Using ZFS on debian is just a matter of installing <code>zfsutils-linux</code>, <code>contrib</code> repo needs to be enabled.</p>
<p>With <code>virt-install</code> I created the virtual machine. Remember that ovmf needs to be installed to boot using uefi: <code>apt install ovmf</code>.</p>
<pre><code>virt-install --name arch-vm --boot uefi --rng /dev/random --memory 12288 --vcpus 8 --cpu host --cdrom /z2mx/ISO/arch.iso --boot cdrom --os-variant archlinux --disk path=/dev/zd0 --network network=br-net --graphics vnc</code></pre>
<p>As I did not want to install a DE in Debian, I ssh into the debian host with port forwarding from my laptop to install Arch Linux through vnc: <code>ssh user@debian.lan -L 5900:localhost:5900</code>.</p>
<p>Now it&#x2019;s time to format the disks and <code>pacstrap</code> the OS to our partitions. Refer to the wiki for detailed instructions. It may be possible to use the <code>archinstall</code> script.</p>
<p>Because I used a bridged network, I just followed the systemd-networkd instructions from the Arch Linux wiki, which is simply to create <code>/etc/systemd/network/20-wired.network</code> with this inside:</p>
<pre><code>[Match]
Name=enp1s0

[Network]
DHCP=yes</code></pre>
<p>Of course the <code>systemd-networkd</code> and <code>systemd-resolved</code> services need to be started.</p>
<p>I chose <code>systemd-boot</code> as the boot manager, while it is easy to install to the ESP partition with <code>bootctl install</code>, it requires some manual configuration.</p>
<p>First modify <code>/boot/loader/loader.conf</code> (assuming /boot is the ESP):</p>
<pre><code>default arch.conf
timeout 0
console-mode max
editor no</code></pre>
<p>As it is a virtual machine with only one system, I don&#x2019;t want any timeout, the next step is to create the entries, first one being <code>/boot/loader/entries/arch.conf</code>:</p>
<pre><code>title    Arch Linux
linux    /vmlinuz-linux-zen
initrd   /initramfs-linux-zen.img
options  root=&quot;LABEL=arch_os&quot; rw</code></pre>
<p>And second one being <code>/boot/loader/entries/arch-fallback.conf</code>:</p>
<pre><code>title    Arch Linux (fallback initramfs)
linux    /vmlinuz-linux-zen
initrd   /initramfs-linux-zen-fallback.img
options  root=&quot;LABEL=arch_os&quot; rw</code></pre>
<p>Be aware that I am using the linux-zen kernel, that needs to be changed if using other kernel(s).</p>
<p>The system will not boot if we don&#x2019;t actually label the root partition <code>arch_os</code>, so do that with <code>e2label</code>.</p>
<h2 id="gpu-passthrough">GPU passthrough</h2>
<h3 id="identify-our-devices-and-make-vfio-pci-take-care-of-them.">Identify our devices and make vfio-pci take care of them.</h3>
<p>This is the interesting part, a script from the arch wiki can tell us the IOMMU groups, and the IDs of our PCI devices.</p>
<pre><code>#!/bin/bash
shopt -s nullglob
for g in `find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V`; do
    echo &quot;IOMMU Group $&#123;g##*/&#125;:&quot;
    for d in $g/devices/*; do
        echo -e &quot;\t$(lspci -nns $&#123;d##*/&#125;)&quot;
    done;
done;</code></pre>
<p>The script works without any problem in Debian, in my case the part relevant to the GPU was like this:</p>
<pre><code>IOMMU Group 1:
    00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v3/4th Gen Core Processor PCI Express x16 Controller [8086:0c01] (rev 06)
    01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] [1002:67df] (rev ef)
    01:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]</code></pre>
<p>Now that we know the IDs we need to add them in this format to <code>/etc/initramfs-tools/modules</code>:</p>
<pre><code>vfio_pci ids=1002:67df,1002:aaf0</code></pre>
<p>After a reboot if we run <code>lspci -knn</code> we should see that the kernel driver in use is vfio-pci:</p>
<pre><code>01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] [1002:67df] (rev ef)
    Subsystem: Micro-Star International Co., Ltd. [MSI] Radeon RX 570 Armor 8G OC [1462:341b]
    Kernel driver in use: vfio-pci
    Kernel modules: amdgpu
01:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]
    Subsystem: Micro-Star International Co., Ltd. [MSI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1462:aaf0]
    Kernel driver in use: vfio-pci
    Kernel modules: snd_hda_intel</code></pre>
<p>Now the GPU is ready to be used in a virtual machine.</p>
<h3 id="giving-the-gpu-to-the-virtual-machine.">Giving the GPU to the virtual machine.</h3>
<p>First lets run <code>virsh nodedev-list --tree</code> to see the information about our devices. In my case <code>pci_0000_01_00_0</code> and <code>pci_0000_01_00_1</code> is what I want the vm to use.</p>
<p>If we run <code>virsh nodedev-dumpxml pci_0000_01_00_0</code> we can see all the information about our device, in <code>&lt;product&gt;</code> we can confirm that this is the gpu, but it is the <code>&lt;address&gt;</code> lines that we need.</p>
<pre><code>&lt;device&gt;
  &lt;name&gt;pci_0000_01_00_0&lt;/name&gt;
  &lt;path&gt;/sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0&lt;/path&gt;
  &lt;parent&gt;pci_0000_00_01_0&lt;/parent&gt;
  &lt;driver&gt;
    &lt;name&gt;vfio-pci&lt;/name&gt;
  &lt;/driver&gt;
  &lt;capability type=&#39;pci&#39;&gt;
    &lt;class&gt;0x030000&lt;/class&gt;
    &lt;domain&gt;0&lt;/domain&gt;
    &lt;bus&gt;1&lt;/bus&gt;
    &lt;slot&gt;0&lt;/slot&gt;
    &lt;function&gt;0&lt;/function&gt;
    &lt;product id=&#39;0x67df&#39;&gt;Ellesmere [Radeon RX 470/480/570/570X/580/580X/590]&lt;/product&gt;
    &lt;vendor id=&#39;0x1002&#39;&gt;Advanced Micro Devices, Inc. [AMD/ATI]&lt;/vendor&gt;
    &lt;iommuGroup number=&#39;1&#39;&gt;
      &lt;address domain=&#39;0x0000&#39; bus=&#39;0x00&#39; slot=&#39;0x01&#39; function=&#39;0x0&#39;/&gt;
      &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39;/&gt;
      &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x1&#39;/&gt;
    &lt;/iommuGroup&gt;
    &lt;pci-express&gt;
      &lt;link validity=&#39;cap&#39; port=&#39;0&#39; speed=&#39;8&#39; width=&#39;16&#39;/&gt;
      &lt;link validity=&#39;sta&#39; speed=&#39;8&#39; width=&#39;16&#39;/&gt;
    &lt;/pci-express&gt;
  &lt;/capability&gt;
&lt;/device&gt;</code></pre>
<p>Now let&#x2019;s edit the vm with <code>virsh edit vm-name</code>, a GPU is a multifunction device, we can see that from all the outputs of the different tools, so two <code>&lt;hostdev&gt;</code> in the <code>&lt;devices&gt;</code> section needs to be created.</p>
<p>I originally added the following:</p>
<pre><code>&lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
  &lt;source&gt;
      &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39;/&gt;
  &lt;/source&gt;
&lt;/hostdev&gt;
&lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
  &lt;source&gt;
      &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x1&#39;/&gt;
  &lt;/source&gt;
&lt;/hostdev&gt;</code></pre>
<p>This software is very smart, so it added the addresses where the pci devices are connected to the vm, while now the vm could boot and use the gpu, I opened the settings again and put the two hostdev on the same bus and slot but with a different function, just like they were on the host. It does not seems to make a difference in my case, but I do want to mention it.</p>
<pre><code>    &lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
      &lt;source&gt;
        &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39;/&gt;
      &lt;/source&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x07&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39; multifunction=&#39;on&#39;/&gt;
    &lt;/hostdev&gt;
    &lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
      &lt;source&gt;
        &lt;address domain=&#39;0x0000&#39; bus=&#39;0x01&#39; slot=&#39;0x00&#39; function=&#39;0x1&#39;/&gt;
      &lt;/source&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x07&#39; slot=&#39;0x00&#39; function=&#39;0x1&#39;/&gt;
    &lt;/hostdev&gt;</code></pre>
<h2 id="a-couple-more-things">A couple more things</h2>
<p>Another things that doesn&#x2019;t seem to matter is running <code>virsh nodedev-dettach pci_0000_01_00_0</code>, supposedly that command prepared the device. But it probably is unnecessary with vfio, and when it is needed I observed no issues when not running this command, surely the software is smart enough to prepare the device when launching the vm.</p>
<p>Now it is just a matter of installing the drivers in the guest and enjoying the vm! In my case I passed through the USB controller of my motherboard and it works flawlessly, that leaves the host usb-less, so make sure ssh before doing that.</p>
<p>Make sure a device has the MSI capability before passing through, that can be checked with <code>lspci -v</code>, also, sometimes the bus address may be in decimal, it is usually in hexadecimal, that doesn&#x2019;t matter when the number is below 10 (almost always), but be aware that sometimes 14 = 20.</p>
<p>This is the USB controller that I passthrough, note that is has MSI:</p>
<pre><code>00:14.0 USB controller: Intel Corporation 9 Series Chipset Family USB xHCI Controller (prog-if 30 [XHCI])
    Subsystem: ASRock Incorporation 9 Series Chipset Family USB xHCI Controller
    Flags: bus master, medium devsel, latency 0, IRQ 32, IOMMU group 4
    Memory at f7e20000 (64-bit, non-prefetchable) [size=64K]
    Capabilities: [70] Power Management version 2
    Capabilities: [80] MSI: Enable+ Count=1/8 Maskable- 64bit+
    Kernel driver in use: vfio-pci
    Kernel modules: xhci_pci</code></pre>
<p>This is the edit to the vm&#x2019;s config:</p>
<pre><code>    &lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
      &lt;source&gt;
        &lt;address domain=&#39;0x0000&#39; bus=&#39;0x00&#39; slot=&#39;0x14&#39; function=&#39;0x0&#39;/&gt;
      &lt;/source&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x08&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39;/&gt;
    &lt;/hostdev&gt;</code></pre>
<p>While it wasn&#x2019;t defined in <code>/etc/initramfs-tools/modules</code>, it uses the vfio-pci driver automatically when the vm is launched, restarting the vm also causes no issues.</p>
<h2 id="happy-computing">Happy computing!</h2>
<p>Enjoy the virtual machine! The steps to have a Windows vm &#x201C;should&#x201D; be identical. Thanks for reading.</p>

 </>
 )
 };
 
 export default arch_vm_with_gpu;

