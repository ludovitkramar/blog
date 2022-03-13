# My tweaks

## Gnome Super(Alt) + Right Click Resize anywhere: 

`gsettings set org.gnome.desktop.wm.preferences resize-with-right-button true`

## Get number of CPU cores in Linux: 

`nproc --all`, this can be used as an argument putting in within `$()`. 

## ZFS NFS share: 

Someone says it is recommended to set `zfs set xattr=sa dnodesize=auto pool/dataset`. Then the share can simply be created with `zfs set sharenfs="ro=@192.168.1.0/24" pool/dataset`

## Fix incorrect PATH environment variable: 

The software is installed, but it says command not found!?

Add `export PATH=/sbin/:/usr/bin/:$PATH` to .bashrc or .zshrc.

## My zsh config: [^0]

[^0]: Sadly I do not know who was the original author of the key bindings part.

```
#Custom prompt is optional
PS1='[%F{green}%n%f@%m %d]# '

HISTFILE=~/.histfile
HISTSIZE=10000
SAVEHIST=10000
setopt beep extendedglob
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/ludovitkramar/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

#Start of key bindings
# create a zkbd compatible hash;
# to add other keys to this hash, see: man 5 terminfo
typeset -g -A key

key[Home]="${terminfo[khome]}"
key[End]="${terminfo[kend]}"
key[Insert]="${terminfo[kich1]}"
key[Backspace]="${terminfo[kbs]}"
key[Delete]="${terminfo[kdch1]}"
key[Up]="${terminfo[kcuu1]}"
key[Down]="${terminfo[kcud1]}"
key[Left]="${terminfo[kcub1]}"
key[Right]="${terminfo[kcuf1]}"
key[PageUp]="${terminfo[kpp]}"
key[PageDown]="${terminfo[knp]}"
key[Shift-Tab]="${terminfo[kcbt]}"

# setup key accordingly
[[ -n "${key[Home]}"      ]] && bindkey -- "${key[Home]}"       beginning-of-line
[[ -n "${key[End]}"       ]] && bindkey -- "${key[End]}"        end-of-line
[[ -n "${key[Insert]}"    ]] && bindkey -- "${key[Insert]}"     overwrite-mode
[[ -n "${key[Backspace]}" ]] && bindkey -- "${key[Backspace]}"  backward-delete-char
[[ -n "${key[Delete]}"    ]] && bindkey -- "${key[Delete]}"     delete-char
[[ -n "${key[Up]}"        ]] && bindkey -- "${key[Up]}"         up-line-or-history
[[ -n "${key[Down]}"      ]] && bindkey -- "${key[Down]}"       down-line-or-history
[[ -n "${key[Left]}"      ]] && bindkey -- "${key[Left]}"       backward-char
[[ -n "${key[Right]}"     ]] && bindkey -- "${key[Right]}"      forward-char
[[ -n "${key[PageUp]}"    ]] && bindkey -- "${key[PageUp]}"     beginning-of-buffer-or-history
[[ -n "${key[PageDown]}"  ]] && bindkey -- "${key[PageDown]}"   end-of-buffer-or-history
[[ -n "${key[Shift-Tab]}" ]] && bindkey -- "${key[Shift-Tab]}"  reverse-menu-complete

# Finally, make sure the terminal is in application mode, when zle is
# active. Only then are the values from $terminfo valid.
if (( ${+terminfo[smkx]} && ${+terminfo[rmkx]} )); then
	autoload -Uz add-zle-hook-widget
	function zle_application_mode_start { echoti smkx }
	function zle_application_mode_stop { echoti rmkx }
	add-zle-hook-widget -Uz zle-line-init zle_application_mode_start
	add-zle-hook-widget -Uz zle-line-finish zle_application_mode_stop
fi

#end of key bindings

zstyle ':completion:*' menu select

autoload -Uz up-line-or-beginning-search down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

[[ -n "${key[Up]}"   ]] && bindkey -- "${key[Up]}"   up-line-or-beginning-search
[[ -n "${key[Down]}" ]] && bindkey -- "${key[Down]}" down-line-or-beginning-search

#Arch:
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

#Debian:
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
```

## Fallout 4 on Linux Steam: [^1]

[^1]: Thanks to Ivo from the Fallout 4 protondb page: https://www.protondb.com/app/377160

Fixed audio by running `protontricks 377160 xact`.

Modify the following files to disable VSync:

```
steamapps/common/Fallout 4/Fallout4_Default.ini
steamapps/common/Fallout 4/Fallout4/Fallout4Prefs.ini
compdata/377160/pfx/drive_c/users/steamuser/Documents/MyGame/Fallout4/Fallout4.ini
compdata/377160/pfx/drive_c/users/steamuser/Documents/MyGames/Fallout4/Fallout4Prefs.ini
```

In all of them, changed the value `iPresentInterval` from 1 to 0

Limit FPS with mangohud, set launch option to: `MANGOHUD_CONFIG="fps_limit=73" mangohud  %command% `

## IBus tray icon color: [^2]

How to change ibus tray icon color?

[^2]: Source: https://wiki.archlinux.org/title/IBus#Tray_icon_color

Use the command `$ gsettings set org.freedesktop.ibus.panel xkb-icon-rgba 'COLOR'`.

A hex value like `#rrggbb` works just fine, rgba can also be used. `dconf-editor` is another option.

## Create swapfile: [^3]

How to create a swapfile?

[^3]: https://wiki.archlinux.org/title/swap#Manually

`dd if=/dev/zero of=/swapfile bs=1M count=512 status=progress` for a 512M swap file.

Set the right permissions (a world-readable swap file is a huge local vulnerability):

`chmod 600 /swapfile`

After creating the correctly sized file, format it to swap:

`mkswap /swapfile`

Activate the swap file:

`swapon /swapfile`

Finally, edit the fstab configuration to add an entry for the swap file:

`/swapfile none swap defaults 0 0`

## Make file(s) inmutable / undeleteable:

How to make files impossible to delete in linux?

`chattr` is used to achieve this, `+i` to make it immutable and `-i` to make it "normal".

`-R` to make it recursive.

## Firefox native in gnome wayland (seems to not work)

In `~/.config/environment.d/envvars.conf` add `export MOZ_ENABLE_WAYLAND=1`. Can be verified by running `xprop` and clicking on the firefox window.

According to the Arch wiki, setting `gfx.webrender.compositor.force-enabled` to `true` in `about:config` will greatly improve performance.

## ZFS snapshots

`zfs snapshot pool/dataset@snapshotName` to create.

`zfs list -t snapshot` to view snapshots.

## AMD Freesync on arch linux (xorg)

File: `/etc/X11/xorg.conf.d/20-amdgpu.conf`.

Contents:

```
Section "Device"
     Identifier "AMD"
     Driver "amdgpu"
     Option "VariableRefresh" "true"
EndSection
```

## Monitor writeback, see when data is actually written to the storage medium.

Run: `watch -d grep -e Dirty: -e Writeback: /proc/meminfo`.

## Pacman mirrorlist sort by speed command.

- Install `reflector`. 

- And run: `sudo reflector --latest 70 --protocol http --protocol https --sort rate --save /etc/pacman.d/mirrorlist --verbose`.

- `sudo reflector --protocol http --protocol https --sort rate --verbose `.

## Reboot to UEFI firmware setup with linux (systemd-boot only)

`systemctl reboot --firmware-setup`

## Convert vm images

- `qemu-img info ./file` to view info,

- and `qemu-img convert ./in -O raw ./out.img` to convert to raw.

## Mount a raw .img file with multiple partitions inside [^f]

[^f]: https://linuxfreelancer.com/how-to-mount-a-raw-disk-image

- `fdisk ./disk.img` and note down the sector size, 512 and 4092 is common.

- See where our partition starts. In this case it starts at `718848`.

	```
	Device           Boot  Start       End   Sectors  Size Id Type
	win8preview.img1 *      2048    718847    716800  350M  7 HPFS/NTFS/exFAT
	win8preview.img2      718848 125827071 125108224 59.7G  7 HPFS/NTFS/exFAT
	```

- `mount -o loop,offset=$((718848*512)) win8preview.img /mnt2`.

## Install Windows 11 on unsupported hardware from the ISO. [^ex]

[^ex]: https://www.youtube.com/watch?v=ifUJt1tqP_Q&t=937s

Not upgrade, clean installation from the ISO. Useful for virtual machines.

- Select the Windows 11 version and see the error message.

- Go back a couple of steps.

- Press `Shift-F10` to bring up CMD.

- Run `regedit`.

- In `HKEY_LOCAL_MACHINE\SYSTEM\Setup` create new key `LabConfig`.

- Add a DWORD (32-bit) `BypassTPMCheck` and set value to 1.

- Another named `BypassSecureBootCheck` and also give it a value of 1.

## Download music from youtube in linux with yt-dlp easily

- Install `yt-dlp`.

- In `.bashrc` or `.zshrc` add: `yt() { yt-dlp "$@" --format "(bestaudio[acodec^=opus]/bestaudio)/best" --verbose --force-ipv4 --sleep-requests 1 --sleep-interval 5 --max-sleep-interval 30 --ignore-errors --no-continue --no-overwrites --download-archive archive.log --add-metadata --extract-audio --output "%(uploader)s - %(upload_date)s - %(title)s [%(id)s].%(ext)s" --extractor-args youtube:player_client=android --throttled-rate 100K  2>&1 | tee output.log; }`.

- Simply run `yt "http://link"`, and it will download the music only in the highest quality.

## Remove folders from nautilus' (gnome file manager) side bar.

In `~/.config/user-dirs.dirs` change the directory you want gone to just `$HOME`.

Example for videos: `XDG_VIDEOS_DIR="$HOME"`.

Additional settings are present in `/etc/xdg/user-dirs.conf`, there's also a `.default` file in the same directory.

## List packages with fixed vulnerabilities that should be updated in debian

`debsecan --suite bullseye --format packages --only-fixed`

## Mount NFS with fstab

`hostname.local:/path/to/share   /mount/point/of/share   nfs   defaults,timeo=900,retrans=5,_netdev 0 0`

## Debian Squeeze archive repository and ignore[^deb]

[^deb]: https://stackoverflow.com/questions/36080756/archive-repository-for-debian-squeeze

In /etc/apt/sources.list: `deb http://archive.debian.org/debian-archive/debian/ squeeze main contrib non-free`

As root run: `echo 'Acquire::Check-Valid-Until "false";' >/etc/apt/apt.conf.d/90ignore-release-date`

## Change zvol size

It is as simple as running `zfs set volsize=25G name/zvol-name`. One can run something like `zfs get all | grep vol` to find out the name.

## Gnome Alt+Tab between windows of the same application (prevent grouping)

- Open `dconf-editor`

- Go to `org/gnome/desktop/wm/keybindings`

- Switch the values of `switch-applications` and `switch-windows`

