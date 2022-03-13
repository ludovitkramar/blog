import '../article.css';
 
 const coturn_synapse = () => {
 return (
 <>

<h1 id="how-to-set-up-coturn-and-synapse2">How to set up coturn and Synapse<a href="#fn1" class="footnote-ref" id="fnref1" role="doc-noteref"><sup>1</sup></a></h1>
<p>This configuration is provided AS-IS and as an example/reference for those who do not find a working configuration for themselves. It is not always kept up to date and no support is provided.</p>
<p>Assuming: - Your Matrix domain: <code>example.org</code> - Your TURN domain (arbitrary): <code>turn.example.org</code> - Your Public IP: <code>1.2.3.4</code> - Your Private IP for the box hosing the services: <code>10.11.12.13</code> - A shared secret between synapse and coturn: <code>ThisIsASharedSecret-ChangeMe</code> - You want Firefox compatiblity (TURNS only is not supported)</p>
<h2 id="synapse">synapse</h2>
<p><code>homeserver.yaml</code>:</p>
<pre><code>## Turn ##

# The public URIs of the TURN server to give to clients
turn_uris:
  - &quot;turns:turn.example.org?transport=udp&quot;
  - &quot;turns:turn.example.org?transport=tcp&quot;
  - &quot;turn:turn.example.org?transport=udp&quot;
  - &quot;turn:turn.example.org?transport=tcp&quot;

# The shared secret used to compute passwords for the TURN server
turn_shared_secret: &quot;ThisIsASharedSecret-ChangeMe&quot;

# How long generated TURN credentials last
turn_user_lifetime: &quot;1h&quot;
</code></pre>
<h2 id="coturn">coturn</h2>
<p><code>turnserver.conf</code>:</p>
<pre><code>syslog

lt-cred-mech
use-auth-secret
static-auth-secret=ThisIsASharedSecret-ChangeMe
realm=example.org

cert=/etc/letsencrypt/live/turn.example.org/fullchain.pem
pkey=/etc/letsencrypt/live/turn.example.org/privkey.pem

no-udp
external-ip=1.2.3.4
min-port=64000
max-port=65535</code></pre>
<h2 id="firewall">Firewall</h2>
<p>Allow ports: - TCP 3478 - UDP 3478 - TCP 3479 - UDP 3479 - TCP 5349 - UDP 5349 - UDP 64000 to 65535</p>
<p><small>Written on 22-Jan-2022 by Ludovit Kramar</small></p>
<section class="footnotes" role="doc-endnotes">
<hr />
<ol>
<li id="fn1" role="doc-endnote"><p>https://gist.github.com/maxidorius/2b0acc2e707ae9a2d6d0267026a1024f<a href="#fnref1" class="footnote-back" role="doc-backlink">&#x21A9;&#xFE0E;</a></p></li>
</ol>
</section>

 </>
 )
 };
 
 export default coturn_synapse;

