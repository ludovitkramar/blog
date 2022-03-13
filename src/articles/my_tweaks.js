import '../article.css';
 
 const my_tweaks = () => {
 return (
 <>

<h1 id="my-tweaks">My tweaks</h1>
<h2 id="gnome-superalt-right-click-resize-anywhere">Gnome Super(Alt) + Right Click Resize anywhere:</h2>
<p><code>gsettings set org.gnome.desktop.wm.preferences resize-with-right-button true</code></p>
<h2 id="get-number-of-cpu-cores-in-linux">Get number of CPU cores in Linux:</h2>
<p><code>nproc --all</code>, this can be used as an argument putting in within <code>$()</code>.</p>
<h2 id="zfs-nfs-share">ZFS NFS share:</h2>
<p>Someone says it is recommended to set <code>zfs set xattr=sa dnodesize=auto pool/dataset</code>. Then the share can simply be created with <code>zfs set sharenfs="ro=@192.168.1.0/24" pool/dataset</code></p>
<h2 id="fix-incorrect-path-environment-variable">Fix incorrect PATH environment variable:</h2>
<p>The software is installed, but it says command not found!?</p>
<p>Add <code>export PATH=/sbin/:/usr/bin/:$PATH</code> to .bashrc or .zshrc.</p>
<h2 id="my-zsh-config-0">My zsh config: <a href="#fn1" class="footnote-ref" id="fnref1" role="doc-noteref"><sup>1</sup></a></h2>
<pre><code>#Custom prompt is optional
PS1=&#39;[%F&#123;green&#125;%n%f@%m %d]# &#39;

HISTFILE=~/.histfile
HISTSIZE=10000
SAVEHIST=10000
setopt beep extendedglob
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename &#39;/home/ludovitkramar/.zshrc&#39;

autoload -Uz compinit
compinit
# End of lines added by compinstall

#Start of key bindings
# create a zkbd compatible hash;
# to add other keys to this hash, see: man 5 terminfo
typeset -g -A key

key[Home]=&quot;$&#123;terminfo[khome]&#125;&quot;
key[End]=&quot;$&#123;terminfo[kend]&#125;&quot;
key[Insert]=&quot;$&#123;terminfo[kich1]&#125;&quot;
key[Backspace]=&quot;$&#123;terminfo[kbs]&#125;&quot;
key[Delete]=&quot;$&#123;terminfo[kdch1]&#125;&quot;
key[Up]=&quot;$&#123;terminfo[kcuu1]&#125;&quot;
key[Down]=&quot;$&#123;terminfo[kcud1]&#125;&quot;
key[Left]=&quot;$&#123;terminfo[kcub1]&#125;&quot;
key[Right]=&quot;$&#123;terminfo[kcuf1]&#125;&quot;
key[PageUp]=&quot;$&#123;terminfo[kpp]&#125;&quot;
key[PageDown]=&quot;$&#123;terminfo[knp]&#125;&quot;
key[Shift-Tab]=&quot;$&#123;terminfo[kcbt]&#125;&quot;

# setup key accordingly
[[ -n &quot;$&#123;key[Home]&#125;&quot;      ]] &amp;&amp; bindkey -- &quot;$&#123;key[Home]&#125;&quot;       beginning-of-line
[[ -n &quot;$&#123;key[End]&#125;&quot;       ]] &amp;&amp; bindkey -- &quot;$&#123;key[End]&#125;&quot;        end-of-line
[[ -n &quot;$&#123;key[Insert]&#125;&quot;    ]] &amp;&amp; bindkey -- &quot;$&#123;key[Insert]&#125;&quot;     overwrite-mode
[[ -n &quot;$&#123;key[Backspace]&#125;&quot; ]] &amp;&amp; bindkey -- &quot;$&#123;key[Backspace]&#125;&quot;  backward-delete-char
[[ -n &quot;$&#123;key[Delete]&#125;&quot;    ]] &amp;&amp; bindkey -- &quot;$&#123;key[Delete]&#125;&quot;     delete-char
[[ -n &quot;$&#123;key[Up]&#125;&quot;        ]] &amp;&amp; bindkey -- &quot;$&#123;key[Up]&#125;&quot;         up-line-or-history
[[ -n &quot;$&#123;key[Down]&#125;&quot;      ]] &amp;&amp; bindkey -- &quot;$&#123;key[Down]&#125;&quot;       down-line-or-history
[[ -n &quot;$&#123;key[Left]&#125;&quot;      ]] &amp;&amp; bindkey -- &quot;$&#123;key[Left]&#125;&quot;       backward-char
[[ -n &quot;$&#123;key[Right]&#125;&quot;     ]] &amp;&amp; bindkey -- &quot;$&#123;key[Right]&#125;&quot;      forward-char
[[ -n &quot;$&#123;key[PageUp]&#125;&quot;    ]] &amp;&amp; bindkey -- &quot;$&#123;key[PageUp]&#125;&quot;     beginning-of-buffer-or-history
[[ -n &quot;$&#123;key[PageDown]&#125;&quot;  ]] &amp;&amp; bindkey -- &quot;$&#123;key[PageDown]&#125;&quot;   end-of-buffer-or-history
[[ -n &quot;$&#123;key[Shift-Tab]&#125;&quot; ]] &amp;&amp; bindkey -- &quot;$&#123;key[Shift-Tab]&#125;&quot;  reverse-menu-complete

# Finally, make sure the terminal is in application mode, when zle is
# active. Only then are the values from $terminfo valid.
if (( $&#123;+terminfo[smkx]&#125; &amp;&amp; $&#123;+terminfo[rmkx]&#125; )); then
    autoload -Uz add-zle-hook-widget
    function zle_application_mode_start &#123; echoti smkx &#125;
    function zle_application_mode_stop &#123; echoti rmkx &#125;
    add-zle-hook-widget -Uz zle-line-init zle_application_mode_start
    add-zle-hook-widget -Uz zle-line-finish zle_application_mode_stop
fi

#end of key bindings

zstyle &#39;:completion:*&#39; menu select

autoload -Uz up-line-or-beginning-search down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

[[ -n &quot;$&#123;key[Up]&#125;&quot;   ]] &amp;&amp; bindkey -- &quot;$&#123;key[Up]&#125;&quot;   up-line-or-beginning-search
[[ -n &quot;$&#123;key[Down]&#125;&quot; ]] &amp;&amp; bindkey -- &quot;$&#123;key[Down]&#125;&quot; down-line-or-beginning-search

#Arch:
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

#Debian:
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh</code></pre>
<h2 id="fallout-4-on-linux-steam-1">Fallout 4 on Linux Steam: <a href="#fn2" class="footnote-ref" id="fnref2" role="doc-noteref"><sup>2</sup></a></h2>
<p>Fixed audio by running <code>protontricks 377160 xact</code>.</p>
<p>Modify the following files to disable VSync:</p>
<pre><code>steamapps/common/Fallout 4/Fallout4_Default.ini
steamapps/common/Fallout 4/Fallout4/Fallout4Prefs.ini
compdata/377160/pfx/drive_c/users/steamuser/Documents/MyGame/Fallout4/Fallout4.ini
compdata/377160/pfx/drive_c/users/steamuser/Documents/MyGames/Fallout4/Fallout4Prefs.ini</code></pre>
<p>In all of them, changed the value <code>iPresentInterval</code> from 1 to 0</p>
<p>Limit FPS with mangohud, set launch option to: <code>MANGOHUD_CONFIG="fps_limit=73" mangohud  %command%</code></p>
<h2 id="ibus-tray-icon-color-2">IBus tray icon color: <a href="#fn3" class="footnote-ref" id="fnref3" role="doc-noteref"><sup>3</sup></a></h2>
<p>How to change ibus tray icon color?</p>
<p>Use the command <code>$ gsettings set org.freedesktop.ibus.panel xkb-icon-rgba 'COLOR'</code>.</p>
<p>A hex value like <code>#rrggbb</code> works just fine, rgba can also be used. <code>dconf-editor</code> is another option.</p>
<h2 id="create-swapfile-3">Create swapfile: <a href="#fn4" class="footnote-ref" id="fnref4" role="doc-noteref"><sup>4</sup></a></h2>
<p>How to create a swapfile?</p>
<p><code>dd if=/dev/zero of=/swapfile bs=1M count=512 status=progress</code> for a 512M swap file.</p>
<p>Set the right permissions (a world-readable swap file is a huge local vulnerability):</p>
<p><code>chmod 600 /swapfile</code></p>
<p>After creating the correctly sized file, format it to swap:</p>
<p><code>mkswap /swapfile</code></p>
<p>Activate the swap file:</p>
<p><code>swapon /swapfile</code></p>
<p>Finally, edit the fstab configuration to add an entry for the swap file:</p>
<p><code>/swapfile none swap defaults 0 0</code></p>
<h2 id="make-files-inmutable-undeleteable">Make file(s) inmutable / undeleteable:</h2>
<p>How to make files impossible to delete in linux?</p>
<p><code>chattr</code> is used to achieve this, <code>+i</code> to make it immutable and <code>-i</code> to make it &#x201C;normal&#x201D;.</p>
<p><code>-R</code> to make it recursive.</p>
<h2 id="firefox-native-in-gnome-wayland-seems-to-not-work">Firefox native in gnome wayland (seems to not work)</h2>
<p>In <code>~/.config/environment.d/envvars.conf</code> add <code>export MOZ_ENABLE_WAYLAND=1</code>. Can be verified by running <code>xprop</code> and clicking on the firefox window.</p>
<p>According to the Arch wiki, setting <code>gfx.webrender.compositor.force-enabled</code> to <code>true</code> in <code>about:config</code> will greatly improve performance.</p>
<h2 id="zfs-snapshots">ZFS snapshots</h2>
<p><code>zfs snapshot pool/dataset@snapshotName</code> to create.</p>
<p><code>zfs list -t snapshot</code> to view snapshots.</p>
<h2 id="amd-freesync-on-arch-linux-xorg">AMD Freesync on arch linux (xorg)</h2>
<p>File: <code>/etc/X11/xorg.conf.d/20-amdgpu.conf</code>.</p>
<p>Contents:</p>
<pre><code>Section &quot;Device&quot;
     Identifier &quot;AMD&quot;
     Driver &quot;amdgpu&quot;
     Option &quot;VariableRefresh&quot; &quot;true&quot;
EndSection</code></pre>
<h2 id="monitor-writeback-see-when-data-is-actually-written-to-the-storage-medium.">Monitor writeback, see when data is actually written to the storage medium.</h2>
<p>Run: <code>watch -d grep -e Dirty: -e Writeback: /proc/meminfo</code>.</p>
<h2 id="pacman-mirrorlist-sort-by-speed-command.">Pacman mirrorlist sort by speed command.</h2>
<ul>
<li><p>Install <code>reflector</code>.</p></li>
<li><p>And run: <code>sudo reflector --latest 70 --protocol http --protocol https --sort rate --save /etc/pacman.d/mirrorlist --verbose</code>.</p></li>
<li><p><code>sudo reflector --protocol http --protocol https --sort rate --verbose</code>.</p></li>
</ul>
<h2 id="reboot-to-uefi-firmware-setup-with-linux-systemd-boot-only">Reboot to UEFI firmware setup with linux (systemd-boot only)</h2>
<p><code>systemctl reboot --firmware-setup</code></p>
<h2 id="convert-vm-images">Convert vm images</h2>
<ul>
<li><p><code>qemu-img info ./file</code> to view info,</p></li>
<li><p>and <code>qemu-img convert ./in -O raw ./out.img</code> to convert to raw.</p></li>
</ul>
<h2 id="mount-a-raw-.img-file-with-multiple-partitions-inside-f">Mount a raw .img file with multiple partitions inside <a href="#fn5" class="footnote-ref" id="fnref5" role="doc-noteref"><sup>5</sup></a></h2>
<ul>
<li><p><code>fdisk ./disk.img</code> and note down the sector size, 512 and 4092 is common.</p></li>
<li><p>See where our partition starts. In this case it starts at <code>718848</code>.</p>
<pre><code>Device           Boot  Start       End   Sectors  Size Id Type
win8preview.img1 *      2048    718847    716800  350M  7 HPFS/NTFS/exFAT
win8preview.img2      718848 125827071 125108224 59.7G  7 HPFS/NTFS/exFAT</code></pre></li>
<li><p><code>mount -o loop,offset=$((718848*512)) win8preview.img /mnt2</code>.</p></li>
</ul>
<h2 id="install-windows-11-on-unsupported-hardware-from-the-iso.-ex">Install Windows 11 on unsupported hardware from the ISO. <a href="#fn6" class="footnote-ref" id="fnref6" role="doc-noteref"><sup>6</sup></a></h2>
<p>Not upgrade, clean installation from the ISO. Useful for virtual machines.</p>
<ul>
<li><p>Select the Windows 11 version and see the error message.</p></li>
<li><p>Go back a couple of steps.</p></li>
<li><p>Press <code>Shift-F10</code> to bring up CMD.</p></li>
<li><p>Run <code>regedit</code>.</p></li>
<li><p>In <code>HKEY_LOCAL_MACHINE\SYSTEM\Setup</code> create new key <code>LabConfig</code>.</p></li>
<li><p>Add a DWORD (32-bit) <code>BypassTPMCheck</code> and set value to 1.</p></li>
<li><p>Another named <code>BypassSecureBootCheck</code> and also give it a value of 1.</p></li>
</ul>
<h2 id="download-music-from-youtube-in-linux-with-yt-dlp-easily">Download music from youtube in linux with yt-dlp easily</h2>
<ul>
<li><p>Install <code>yt-dlp</code>.</p></li>
<li><p>In <code>.bashrc</code> or <code>.zshrc</code> add: <code>yt() &#123; yt-dlp "$@" --format "(bestaudio[acodec^=opus]/bestaudio)/best" --verbose --force-ipv4 --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 30 --ignore-errors --no-continue --no-overwrites --download-archive archive.log --add-metadata --extract-audio --output "%(uploader)s - %(upload_date)s - %(title)s [%(id)s].%(ext)s" --extractor-args youtube:player_client=android --throttled-rate 100K  2&gt;&amp;1 | tee output.log; &#125;</code>.</p></li>
<li><p>Simply run <code>yt "http://link"</code>, and it will download the music only in the highest quality.</p></li>
</ul>
<h2 id="remove-folders-from-nautilus-gnome-file-manager-side-bar.">Remove folders from nautilus&#x2019; (gnome file manager) side bar.</h2>
<p>In <code>~/.config/user-dirs.dirs</code> change the directory you want gone to just <code>$HOME</code>.</p>
<p>Example for videos: <code>XDG_VIDEOS_DIR="$HOME"</code>.</p>
<p>Additional settings are present in <code>/etc/xdg/user-dirs.conf</code>, there&#x2019;s also a <code>.default</code> file in the same directory.</p>
<h2 id="list-packages-with-fixed-vulnerabilities-that-should-be-updated-in-debian">List packages with fixed vulnerabilities that should be updated in debian</h2>
<p><code>debsecan --suite bullseye --format packages --only-fixed</code></p>
<h2 id="mount-nfs-with-fstab">Mount NFS with fstab</h2>
<p><code>hostname.local:/path/to/share   /mount/point/of/share   nfs   defaults,timeo=900,retrans=5,_netdev 0 0</code></p>
<h2 id="debian-squeeze-archive-repository-and-ignoredeb">Debian Squeeze archive repository and ignore<a href="#fn7" class="footnote-ref" id="fnref7" role="doc-noteref"><sup>7</sup></a></h2>
<p>In /etc/apt/sources.list: <code>deb http://archive.debian.org/debian-archive/debian/ squeeze main contrib non-free</code></p>
<p>As root run: <code>echo 'Acquire::Check-Valid-Until "false";' &gt;/etc/apt/apt.conf.d/90ignore-release-date</code></p>
<h2 id="change-zvol-size">Change zvol size</h2>
<p>It is as simple as running <code>zfs set volsize=25G name/zvol-name</code>. One can run something like <code>zfs get all | grep vol</code> to find out the name.</p>
<h2 id="gnome-alttab-between-windows-of-the-same-application-prevent-grouping">Gnome Alt+Tab between windows of the same application (prevent grouping)</h2>
<ul>
<li><p>Open <code>dconf-editor</code></p></li>
<li><p>Go to <code>org/gnome/desktop/wm/keybindings</code></p></li>
<li><p>Switch the values of <code>switch-applications</code> and <code>switch-windows</code></p></li>
</ul>
<section class="footnotes" role="doc-endnotes">
<hr />
<ol>
<li id="fn1" role="doc-endnote"><p>Sadly I do not know who was the original author of the key bindings part.<a href="#fnref1" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn2" role="doc-endnote"><p>Thanks to Ivo from the Fallout 4 protondb page: https://www.protondb.com/app/377160<a href="#fnref2" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn3" role="doc-endnote"><p>Source: https://wiki.archlinux.org/title/IBus#Tray_icon_color<a href="#fnref3" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn4" role="doc-endnote"><p>https://wiki.archlinux.org/title/swap#Manually<a href="#fnref4" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn5" role="doc-endnote"><p>https://linuxfreelancer.com/how-to-mount-a-raw-disk-image<a href="#fnref5" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn6" role="doc-endnote"><p>https://www.youtube.com/watch?v=ifUJt1tqP_Q&amp;t=937s<a href="#fnref6" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
<li id="fn7" role="doc-endnote"><p>https://stackoverflow.com/questions/36080756/archive-repository-for-debian-squeeze<a href="#fnref7" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
</ol>
</section>

 </>
 )
 };
 
 export default my_tweaks;

