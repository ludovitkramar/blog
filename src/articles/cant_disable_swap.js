import '../article.css';
 
 const cant_disable_swap = () => {
 return (
 <>

<h1 id="systemd-gpt-auto-generator-and-disabling-swap">systemd-gpt-auto-generator and disabling swap</h1>
<p>when <code>/</code> is on a gpt formatted drive, and on that same drive there&#x2019;s a partition of type <code>swap</code>, <code>systemd-gpt-auto-generator</code> will automatically use that swap partition. This is irrelevant of the settings in <code>fstab</code>.</p>
<p>I&#x2019;ve learned about this when trying to disable swap space, but wasn&#x2019;t able to do so.</p>
<p>In order to disable swap, (besides removing it from fstab), run <code>systemctl --type swap</code> to find out the name of the partition, then mask like this: <code>systemctl mask dev-nvme0n1p3.swap</code>.</p>
<p><small>Written on 10-Feb-2022 by Ludovit Kramar</small></p>
<p><small>Thanks to heftig from the Arch Linux matrix chat room</small></p>

 </>
 )
 };
 
 export default cant_disable_swap;

