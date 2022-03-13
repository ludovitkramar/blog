# systemd-gpt-auto-generator and disabling swap

when `/` is on a gpt formatted drive, and on that same drive there's a partition of type `swap`, `systemd-gpt-auto-generator` will automatically use that swap partition. This is irrelevant of the settings in `fstab`. 

I've learned about this when trying to disable swap space, but wasn't able to do so.

In order to disable swap, (besides removing it from fstab), run `systemctl --type swap` to find out the name of the partition, then mask like this: `systemctl mask dev-nvme0n1p3.swap`.

<small>Written on 10-Feb-2022 by Ludovit Kramar</small>

<small>Thanks to heftig from the Arch Linux matrix chat room</small>