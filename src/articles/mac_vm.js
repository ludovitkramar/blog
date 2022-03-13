import '../article.css';
 
 const mac_vm = () => {
 return (
 <>

<h1 id="macos-big-sur-vm-with-gpu-pass-through-on-debian-host.">macOS Big Sur vm with GPU pass-through on debian host.</h1>
<p>This is done on Debian Bullseye. See other posts for context on GPU pass-through and network setup.</p>
<h2 id="virtual-machine-installation">Virtual machine installation</h2>
<p>I used this project: https://github.com/kholia/OSX-KVM</p>
<p>In a directory where you want to store the vm (and the virtual disk) run:</p>
<ol type="1">
<li><p><code>git clone --depth 1 --recursive https://github.com/kholia/OSX-KVM.git</code></p></li>
<li><p><code>./fetch-macOS-v2.py</code></p></li>
<li><p>Choose <code>4. Big Sur (11.6) - RECOMMENDED</code></p></li>
<li><p><code>apt install --no-install-recommends libguestfs-tools</code></p></li>
<li><p><code>qemu-img convert BaseSystem.dmg -O raw BaseSystem.img</code></p></li>
<li><p><code>qemu-img create -f qcow2 mac_hdd_ng.img 128G</code></p></li>
<li><p>The following command is presented as mandatory, but without it, I do not observe any differences.</p>
<p><code>echo 1 &gt; /sys/module/kvm/parameters/ignore_msrs</code></p></li>
<li><p><code>./OpenCore-Boot.sh</code></p></li>
</ol>
<h2 id="install-macos">Install macOS</h2>
<ul>
<li><p>Connect to VNC with ssh tunnel.</p></li>
<li><p>Choose Disk Utility</p></li>
<li><p>Click Erase, name the partition and chose Mac OS Extended (Journaled).</p></li>
<li><p>Close Disk Utility and Click reinstall Big Sur.</p></li>
<li><p>Follow the installation steps and wait until the first stage finishes.</p></li>
</ul>
<p>On the host run <code>sed "s/CHANGEME/$USER/g" macOS-libvirt-Catalina.xml &gt; macOS.xml</code>.</p>
<pre><code>    &lt;interface type=&#39;network&#39;&gt;
      &lt;mac address=&#39;52:54:00:10:35:7a&#39;/&gt;
      &lt;source network=&#39;br-net&#39;/&gt;
      &lt;model type=&#39;virtio&#39;/&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x00&#39; slot=&#39;0x08&#39; function=&#39;0x0&#39;/&gt;
    &lt;/interface&gt;</code></pre>
<p>Change directory of files, and set up network.</p>
<p><code>&lt;address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/&gt;</code> confirm network card&#x2019;s bus must be on <code>0x00</code>.</p>
<p>Install <code>virt-viewer</code> to connect remotely through spice. (Or change the settings to use VNC).</p>
<p><code>ssh user@host -L 5900:localhost:5900 5901:localhost:5901 5902:localhost:5902</code></p>
<ul>
<li>virsh-edit</li>
</ul>
<p>change top line to <code>&lt;domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'&gt;</code></p>
<pre><code>  &lt;qemu:commandline&gt;
    &lt;qemu:arg value=&#39;-device&#39;/&gt;
    &lt;qemu:arg value=&#39;isa-applesmc,osk=ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc&#39;/&gt;
    &lt;qemu:arg value=&#39;-smbios&#39;/&gt;
    &lt;qemu:arg value=&#39;type=2&#39;/&gt;
    &lt;qemu:arg value=&#39;-device&#39;/&gt;
    &lt;qemu:arg value=&#39;usb-tablet&#39;/&gt;
    &lt;qemu:arg value=&#39;-device&#39;/&gt;
    &lt;qemu:arg value=&#39;usb-kbd&#39;/&gt;
    &lt;qemu:arg value=&#39;-cpu&#39;/&gt;
    &lt;qemu:arg value=&#39;Penryn,kvm=on,vendor=GenuineIntel,+invtsc,vmware-cpuid-freq=on,+ssse3,+sse4.2,+popcnt,+avx,+aes,+xsave,+xsaveopt,check&#39;&gt;
  &lt;/qemu:commandline&gt;</code></pre>
<p>Don&#x2019;t let multiple VMs have the same mac address.</p>
<p>Choose Installer when booting</p>
<p>Finish the setup process and shutdown.</p>
<pre><code>    &lt;graphics type=&#39;spice&#39; autoport=&#39;yes&#39;&gt;
      &lt;listen type=&#39;address&#39;/&gt;
    &lt;/graphics&gt;
    &lt;video&gt;
      &lt;model type=&#39;vga&#39; vram=&#39;65536&#39; heads=&#39;1&#39; primary=&#39;yes&#39;/&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x09&#39; slot=&#39;0x01&#39; function=&#39;0x0&#39;/&gt;
    &lt;/video&gt;</code></pre>
<p>Replace the above graphics stuff with pci pass-through.</p>
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
    &lt;/hostdev&gt;
    &lt;hostdev mode=&#39;subsystem&#39; type=&#39;pci&#39; managed=&#39;yes&#39;&gt;
      &lt;source&gt;
        &lt;address domain=&#39;0x0000&#39; bus=&#39;0x00&#39; slot=&#39;0x14&#39; function=&#39;0x0&#39;/&gt;
      &lt;/source&gt;
      &lt;address type=&#39;pci&#39; domain=&#39;0x0000&#39; bus=&#39;0x08&#39; slot=&#39;0x00&#39; function=&#39;0x0&#39;/&gt;
    &lt;/hostdev&gt;</code></pre>
<p>Give it more memory and cpu</p>
<pre><code>  &lt;memory unit=&#39;KiB&#39;&gt;12582912&lt;/memory&gt;
  &lt;currentMemory unit=&#39;KiB&#39;&gt;12582912&lt;/currentMemory&gt;
  &lt;vcpu placement=&#39;static&#39;&gt;8&lt;/vcpu&gt;</code></pre>
<h2 id="notes">Notes</h2>
<p>Trying to upgrade proves to be rather unstable and restarting can cause issues, after shutting down the mac vm I tried to start a linux vm with the same pci devices pass-through settings, the debian host crashed completely, and other random issues can also be present.</p>
<p>XCode seems to work fine.</p>
<p>I have passed the host usb controller from the motherboard to the vm, this allows the vm to use all the usb ports, by doing so I can plug my dragonfly red usb audio device and have audio without any hassle. The issue with this is that often there is cracking noises, I observe them in linux when under high load, but on macOS these glitches are much more prevalent.</p>

 </>
 )
 };
 
 export default mac_vm;

