# Resize root partition on a running system

This has been done on a default install of Ubuntu Server 20.04 running in a virtual machine.

1. Run `sudo fdisk /dev/vda`

2. Type `p` to print the current partitions.

	```
	Command (m for help): p
	Disk /dev/vda: 30 GiB, 32212254720 bytes, 62914560 sectors
	Units: sectors of 1 * 512 = 512 bytes
	Sector size (logical/physical): 512 bytes / 512 bytes
	I/O size (minimum/optimal): 512 bytes / 512 bytes
	Disklabel type: gpt
	Disk identifier: 48D2A697-981C-4382-AFDA-28F899958902

	Device     Start      End  Sectors Size Type
	/dev/vda1   2048     4095     2048   1M BIOS boot
	/dev/vda2   4096 41940991 41936896  20G Linux filesystem
	```
	
	In this case, our root partition is the last one with a size of 20G, and we want to grow it to fill the rest of the drive.
	
3. Type `d` to delete the 2nd partition.

4. Type `n` to create a new partition (you may need to specify the start, if it is not the same as the pre-expansion partition start), by default the new partition will fill the whole drive, as long as we don't reformat, no data will be lost.

5. When asked `Do you want to remove the signature? [Y]es/[N]o:` type `n`.

6. Type `w` to write the changes to the disk.

7. Run `sudo partprobe`, so that linux is happy.

8. Run `sudo resize2fs /dev/vda2` to actually resize the file system.

9. Now you can confirm the successful operation with `df -h | grep /dev/vda2`.

	`/dev/vda2        30G   19G  9.5G  67% /`, now we have free space again!
