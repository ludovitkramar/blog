# How to set up coturn and Synapse[^2] 

[^2]: https://gist.github.com/maxidorius/2b0acc2e707ae9a2d6d0267026a1024f

This configuration is provided AS-IS and as an example/reference for those who do not find a working configuration for themselves. It is not always kept up to date and no support is provided.

Assuming:
- Your Matrix domain: `example.org`
- Your TURN domain (arbitrary): `turn.example.org`
- Your Public IP: `1.2.3.4`
- Your Private IP for the box hosing the services: `10.11.12.13`
- A shared secret between synapse and coturn: `ThisIsASharedSecret-ChangeMe`
- You want Firefox compatiblity (TURNS only is not supported)

## synapse
`homeserver.yaml`:

```
## Turn ##

# The public URIs of the TURN server to give to clients
turn_uris:
  - "turns:turn.example.org?transport=udp"
  - "turns:turn.example.org?transport=tcp"
  - "turn:turn.example.org?transport=udp"
  - "turn:turn.example.org?transport=tcp"

# The shared secret used to compute passwords for the TURN server
turn_shared_secret: "ThisIsASharedSecret-ChangeMe"

# How long generated TURN credentials last
turn_user_lifetime: "1h"

```

## coturn
`turnserver.conf`:

```
syslog

lt-cred-mech
use-auth-secret
static-auth-secret=ThisIsASharedSecret-ChangeMe
realm=example.org

cert=/etc/letsencrypt/live/turn.example.org/fullchain.pem
pkey=/etc/letsencrypt/live/turn.example.org/privkey.pem

no-udp
external-ip=1.2.3.4
min-port=64000
max-port=65535
```

## Firewall
Allow ports:
- TCP 3478
- UDP 3478
- TCP 3479
- UDP 3479
- TCP 5349
- UDP 5349
- UDP 64000 to 65535

<small>Written on 22-Jan-2022 by Ludovit Kramar</small>