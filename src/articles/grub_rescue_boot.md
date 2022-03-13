# Boot from grub rescue console

Type the following:

- `insmod linux`

- `ls` Lists all partitions, you shuld find your boot partition.

- `ls (hd0,msdos1)/boot` Finds the file names for your linux and initrd. If boot is a separate partition, don't include `/boot`. 

    Replace `(hd0,msdos1)` with your partition.

- `set root=(hd0,msdos1)` Specify correct root partition.

- `linux /boot/vmlinuz-linux-zen root=/dev/vda1` Specify the location of the kernel.

- `initrd /boot/initramfs-linux-zen.img`

- `boot` Now

<small>Written on 29-Dec-2021 by Ludovit Kramar</small>