import '../article.css';
 
 const grub_rescue_boot = () => {
 return (
 <>

<h1 id="boot-from-grub-rescue-console">Boot from grub rescue console</h1>
<p>Type the following:</p>
<ul>
<li><p><code>insmod linux</code></p></li>
<li><p><code>ls</code> Lists all partitions, you shuld find your boot partition.</p></li>
<li><p><code>ls (hd0,msdos1)/boot</code> Finds the file names for your linux and initrd. If boot is a separate partition, don&#x2019;t include <code>/boot</code>.</p>
<p>Replace <code>(hd0,msdos1)</code> with your partition.</p></li>
<li><p><code>set root=(hd0,msdos1)</code> Specify correct root partition.</p></li>
<li><p><code>linux /boot/vmlinuz-linux-zen root=/dev/vda1</code> Specify the location of the kernel.</p></li>
<li><p><code>initrd /boot/initramfs-linux-zen.img</code></p></li>
<li><p><code>boot</code> Now</p></li>
</ul>
<p><small>Written on 29-Dec-2021 by Ludovit Kramar</small></p>

 </>
 )
 };
 
 export default grub_rescue_boot;

