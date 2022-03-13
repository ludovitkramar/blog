import '../article.css';
 
 const resize_root_partition = () => {
 return (
 <>

<h1 id="resize-root-partition-on-a-running-system">Resize root partition on a running system</h1>
<p>This has been done on a default install of Ubuntu Server 20.04 running in a virtual machine.</p>
<ol type="1">
<li><p>Run <code>sudo fdisk /dev/vda</code></p></li>
<li><p>Type <code>p</code> to print the current partitions.</p>
<pre><code>Command (m for help): p
Disk /dev/vda: 30 GiB, 32212254720 bytes, 62914560 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 48D2A697-981C-4382-AFDA-28F899958902

Device     Start      End  Sectors Size Type
/dev/vda1   2048     4095     2048   1M BIOS boot
/dev/vda2   4096 41940991 41936896  20G Linux filesystem</code></pre>
<p>In this case, our root partition is the last one with a size of 20G, and we want to grow it to fill the rest of the drive.</p></li>
<li><p>Type <code>d</code> to delete the 2nd partition.</p></li>
<li><p>Type <code>n</code> to create a new partition (you may need to specify the start, if it is not the same as the pre-expansion partition start), by default the new partition will fill the whole drive, as long as we don&#x2019;t reformat, no data will be lost.</p></li>
<li><p>When asked <code>Do you want to remove the signature? [Y]es/[N]o:</code> type <code>n</code>.</p></li>
<li><p>Type <code>w</code> to write the changes to the disk.</p></li>
<li><p>Run <code>sudo partprobe</code>, so that linux is happy.</p></li>
<li><p>Run <code>sudo resize2fs /dev/vda2</code> to actually resize the file system.</p></li>
<li><p>Now you can confirm the successful operation with <code>df -h | grep /dev/vda2</code>.</p>
<p><code>/dev/vda2        30G   19G  9.5G  67% /</code>, now we have free space again!</p></li>
</ol>

 </>
 )
 };
 
 export default resize_root_partition;

