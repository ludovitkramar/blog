import '../article.css';
 
 const debian_bullseye_bridged_network = () => {
 return (
 <>

<h1 id="bridged-network-for-virtual-machines-in-debian-bullseye">Bridged network for virtual machines in debian bullseye</h1>
<h2 id="creating-the-bridge">Creating the bridge</h2>
<p>First the <code>/etc/network/interfaces</code> file:</p>
<pre><code># This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
allow-hotplug enp0s25
iface enp0s25 inet manual

auto br0
iface br0 inet dhcp
    bridge_ports enp0s25</code></pre>
<p>This is great for me as I don&#x2019;t need to set up any addresses and the virtual machines automatically get their addresses and dns from the router.</p>
<h2 id="making-the-network-available-to-the-virtual-machines">Making the network available to the virtual machines</h2>
<p>Create an XML file named <code>br-net.xml</code> anywhere with the following contents:</p>
<div class="sourceCode" id="cb2"><pre class="sourceCode xml"><code class="sourceCode xml"><span id="cb2-1"><a href="#cb2-1" aria-hidden="true" tabindex="-1"></a>&lt;<span class="kw">network</span>&gt;</span>
<span id="cb2-2"><a href="#cb2-2" aria-hidden="true" tabindex="-1"></a>  &lt;<span class="kw">name</span>&gt;br-net&lt;/<span class="kw">name</span>&gt;</span>
<span id="cb2-3"><a href="#cb2-3" aria-hidden="true" tabindex="-1"></a>  &lt;<span class="kw">forward</span><span class="ot"> mode=</span><span class="st">&#39;bridge&#39;</span>/&gt;</span>
<span id="cb2-4"><a href="#cb2-4" aria-hidden="true" tabindex="-1"></a>  &lt;<span class="kw">bridge</span><span class="ot"> name=</span><span class="st">&#39;br0&#39;</span>/&gt;</span>
<span id="cb2-5"><a href="#cb2-5" aria-hidden="true" tabindex="-1"></a>&lt;/<span class="kw">network</span>&gt;</span></code></pre></div>
<p>Then import it with the command: <code>virsh net-define br-net.xml</code></p>

 </>
 )
 };
 
 export default debian_bullseye_bridged_network;

