# Rsync commands and scripts

- Standard copy from current directory:

```bash
rsync -P -r --exclude=".*" --archive -t . 'target'
```

- Remote copy with not standard port from local documents

```
rsync -arvz --progress -e 'ssh -p 222' ./Documents/ user@host:/home/user/Sync/Docs/
```

- Incremental remote snapshots script

```bash
#!/bin/bash

# A script to perform remote incremental backups using rsync

set -o errexit
set -o nounset
set -o pipefail

readonly SOURCE_DIR="/home/user/python"
readonly REMOTE_DIR="/var/lib/jail/Backup/test/123/abc"
readonly DATETIME="$(date '+%Y-%m-%d_%H:%M:%S')"
readonly BACKUP_PATH="${REMOTE_DIR}/${DATETIME}"
readonly LATEST_LINK="${REMOTE_DIR}/latest"
HOST=user@host

ssh -p 222 ${HOST} "mkdir -p ${REMOTE_DIR}"

rsync -avzP \
  --log-file=rsync_snapshot.log \
  -e 'ssh -p 222' \
  --delete \
  --link-dest "../latest" \
  --exclude=".*" \
  --copy-links \
  ${SOURCE_DIR} ${HOST}:${REMOTE_DIR}/incomplete_back-${DATETIME} \
  && ssh -p 222 ${HOST} \
  "mv ${REMOTE_DIR}/incomplete_back-$DATETIME $REMOTE_DIR/back-${DATETIME} \
  && rm -f ${REMOTE_DIR}/latest \
  && ln -s back-${DATETIME} ${REMOTE_DIR}/latest"
```

- Another quick remote copy (preserves time and excludes hidden files + custom folders, ideal for copying /home folders)

```
rsync -arvzt --progress --exclude={'.*','Music','anaconda3'} -e 'ssh -p 222' . user@host:/home/user/laptop-home-backup/
```

- Remote backup script that stores modified files in another folder.

```
#!/bin/bash

# A script to perform remote incremental backups using rsync, previous versions of the file will be moved to the OLD_PATH folder and given a suffix with the date and time of the backup time.

set -o errexit
set -o nounset
set -o pipefail

readonly SOURCE_DIR="/path/to/be/backed/up"
readonly REMOTE_DIR="/path/on/remote/server"
readonly DATETIME="$(date '+%Y-%m-%d_%H:%M:%S')"
readonly BACKUP_PATH="${REMOTE_DIR}/current"
readonly OLD_PATH="${REMOTE_DIR}/old"
HOST=user@hostname

ssh -p 222 ${HOST} "mkdir -p ${REMOTE_DIR}"

rsync -avztbP \
  --log-file=rsync_snapshot.log \
  -e 'ssh -p 222' \
  --delete \
  --include="Documents/***" \
  --include="Downloads/***" \
  --include="Desktop/***" \
  --include="Pictures/***" \
  --exclude="*" \
  --copy-links \
  --backup-dir=${OLD_PATH} \
  --suffix="."${DATETIME} \
  --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r \
  ${SOURCE_DIR} ${HOST}:${BACKUP_PATH} \
```


