import '../article.css';
 
 const rsync_commands = () => {
 return (
 <>

<h1 id="rsync-commands-and-scripts">Rsync commands and scripts</h1>
<ul>
<li>Standard copy from current directory:</li>
</ul>
<div class="sourceCode" id="cb1"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a><span class="fu">rsync</span> <span class="at">-P</span> <span class="at">-r</span> <span class="at">--exclude</span><span class="op">=</span><span class="st">&quot;.*&quot;</span> <span class="at">--archive</span> <span class="at">-t</span> . <span class="st">&#39;target&#39;</span></span></code></pre></div>
<ul>
<li>Remote copy with not standard port from local documents</li>
</ul>
<pre><code>rsync -arvz --progress -e &#39;ssh -p 222&#39; ./Documents/ user@host:/home/user/Sync/Docs/</code></pre>
<ul>
<li>Incremental remote snapshots script</li>
</ul>
<div class="sourceCode" id="cb3"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb3-1"><a href="#cb3-1" aria-hidden="true" tabindex="-1"></a><span class="co">#!/bin/bash</span></span>
<span id="cb3-2"><a href="#cb3-2" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-3"><a href="#cb3-3" aria-hidden="true" tabindex="-1"></a><span class="co"># A script to perform remote incremental backups using rsync</span></span>
<span id="cb3-4"><a href="#cb3-4" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-5"><a href="#cb3-5" aria-hidden="true" tabindex="-1"></a><span class="bu">set</span> <span class="at">-o</span> errexit</span>
<span id="cb3-6"><a href="#cb3-6" aria-hidden="true" tabindex="-1"></a><span class="bu">set</span> <span class="at">-o</span> nounset</span>
<span id="cb3-7"><a href="#cb3-7" aria-hidden="true" tabindex="-1"></a><span class="bu">set</span> <span class="at">-o</span> pipefail</span>
<span id="cb3-8"><a href="#cb3-8" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-9"><a href="#cb3-9" aria-hidden="true" tabindex="-1"></a><span class="bu">readonly</span> <span class="va">SOURCE_DIR</span><span class="op">=</span><span class="st">&quot;/home/user/python&quot;</span></span>
<span id="cb3-10"><a href="#cb3-10" aria-hidden="true" tabindex="-1"></a><span class="bu">readonly</span> <span class="va">REMOTE_DIR</span><span class="op">=</span><span class="st">&quot;/var/lib/jail/Backup/test/123/abc&quot;</span></span>
<span id="cb3-11"><a href="#cb3-11" aria-hidden="true" tabindex="-1"></a><span class="bu">readonly</span> <span class="va">DATETIME</span><span class="op">=</span><span class="st">&quot;</span><span class="va">$(</span><span class="fu">date</span> <span class="st">&#39;+%Y-%m-%d_%H:%M:%S&#39;</span><span class="va">)</span><span class="st">&quot;</span></span>
<span id="cb3-12"><a href="#cb3-12" aria-hidden="true" tabindex="-1"></a><span class="bu">readonly</span> <span class="va">BACKUP_PATH</span><span class="op">=</span><span class="st">&quot;</span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">/</span><span class="va">$&#123;DATETIME&#125;</span><span class="st">&quot;</span></span>
<span id="cb3-13"><a href="#cb3-13" aria-hidden="true" tabindex="-1"></a><span class="bu">readonly</span> <span class="va">LATEST_LINK</span><span class="op">=</span><span class="st">&quot;</span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">/latest&quot;</span></span>
<span id="cb3-14"><a href="#cb3-14" aria-hidden="true" tabindex="-1"></a><span class="va">HOST</span><span class="op">=</span>user@host</span>
<span id="cb3-15"><a href="#cb3-15" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-16"><a href="#cb3-16" aria-hidden="true" tabindex="-1"></a><span class="fu">ssh</span> <span class="at">-p</span> 222 <span class="va">$&#123;HOST&#125;</span> <span class="st">&quot;mkdir -p </span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">&quot;</span></span>
<span id="cb3-17"><a href="#cb3-17" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-18"><a href="#cb3-18" aria-hidden="true" tabindex="-1"></a><span class="fu">rsync</span> <span class="at">-avzP</span> <span class="dt">\</span></span>
<span id="cb3-19"><a href="#cb3-19" aria-hidden="true" tabindex="-1"></a>  <span class="at">--log-file</span><span class="op">=</span>rsync_snapshot.log <span class="dt">\</span></span>
<span id="cb3-20"><a href="#cb3-20" aria-hidden="true" tabindex="-1"></a>  <span class="at">-e</span> <span class="st">&#39;ssh -p 222&#39;</span> <span class="dt">\</span></span>
<span id="cb3-21"><a href="#cb3-21" aria-hidden="true" tabindex="-1"></a>  <span class="at">--delete</span> <span class="dt">\</span></span>
<span id="cb3-22"><a href="#cb3-22" aria-hidden="true" tabindex="-1"></a>  <span class="at">--link-dest</span> <span class="st">&quot;../latest&quot;</span> <span class="dt">\</span></span>
<span id="cb3-23"><a href="#cb3-23" aria-hidden="true" tabindex="-1"></a>  <span class="at">--exclude</span><span class="op">=</span><span class="st">&quot;.*&quot;</span> <span class="dt">\</span></span>
<span id="cb3-24"><a href="#cb3-24" aria-hidden="true" tabindex="-1"></a>  <span class="at">--copy-links</span> <span class="dt">\</span></span>
<span id="cb3-25"><a href="#cb3-25" aria-hidden="true" tabindex="-1"></a>  <span class="va">$&#123;SOURCE_DIR&#125;</span> <span class="va">$&#123;HOST&#125;</span>:<span class="va">$&#123;REMOTE_DIR&#125;</span>/incomplete_back-<span class="va">$&#123;DATETIME&#125;</span> <span class="dt">\</span></span>
<span id="cb3-26"><a href="#cb3-26" aria-hidden="true" tabindex="-1"></a>  <span class="kw">&amp;&amp;</span> <span class="fu">ssh</span> <span class="at">-p</span> 222 <span class="va">$&#123;HOST&#125;</span> <span class="dt">\</span></span>
<span id="cb3-27"><a href="#cb3-27" aria-hidden="true" tabindex="-1"></a>  <span class="st">&quot;mv </span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">/incomplete_back-</span><span class="va">$DATETIME</span><span class="st"> </span><span class="va">$REMOTE_DIR</span><span class="st">/back-</span><span class="va">$&#123;DATETIME&#125;</span><span class="st"> </span><span class="dt">\</span></span>
<span id="cb3-28"><a href="#cb3-28" aria-hidden="true" tabindex="-1"></a><span class="st">  &amp;&amp; rm -f </span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">/latest </span><span class="dt">\</span></span>
<span id="cb3-29"><a href="#cb3-29" aria-hidden="true" tabindex="-1"></a><span class="st">  &amp;&amp; ln -s back-</span><span class="va">$&#123;DATETIME&#125;</span><span class="st"> </span><span class="va">$&#123;REMOTE_DIR&#125;</span><span class="st">/latest&quot;</span></span></code></pre></div>
<ul>
<li>Another quick remote copy (preserves time and excludes hidden files + custom folders, ideal for copying /home folders)</li>
</ul>
<pre><code>rsync -arvzt --progress --exclude=&#123;&#39;.*&#39;,&#39;Music&#39;,&#39;anaconda3&#39;&#125; -e &#39;ssh -p 222&#39; . user@host:/home/user/laptop-home-backup/</code></pre>
<ul>
<li>Remote backup script that stores modified files in another folder.</li>
</ul>
<pre><code>#!/bin/bash

# A script to perform remote incremental backups using rsync, previous versions of the file will be moved to the OLD_PATH folder and given a suffix with the date and time of the backup time.

set -o errexit
set -o nounset
set -o pipefail

readonly SOURCE_DIR=&quot;/path/to/be/backed/up&quot;
readonly REMOTE_DIR=&quot;/path/on/remote/server&quot;
readonly DATETIME=&quot;$(date &#39;+%Y-%m-%d_%H:%M:%S&#39;)&quot;
readonly BACKUP_PATH=&quot;$&#123;REMOTE_DIR&#125;/current&quot;
readonly OLD_PATH=&quot;$&#123;REMOTE_DIR&#125;/old&quot;
HOST=user@hostname

ssh -p 222 $&#123;HOST&#125; &quot;mkdir -p $&#123;REMOTE_DIR&#125;&quot;

rsync -avztbP \
  --log-file=rsync_snapshot.log \
  -e &#39;ssh -p 222&#39; \
  --delete \
  --include=&quot;Documents/***&quot; \
  --include=&quot;Downloads/***&quot; \
  --include=&quot;Desktop/***&quot; \
  --include=&quot;Pictures/***&quot; \
  --exclude=&quot;*&quot; \
  --copy-links \
  --backup-dir=$&#123;OLD_PATH&#125; \
  --suffix=&quot;.&quot;$&#123;DATETIME&#125; \
  --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r \
  $&#123;SOURCE_DIR&#125; $&#123;HOST&#125;:$&#123;BACKUP_PATH&#125; \</code></pre>

 </>
 )
 };
 
 export default rsync_commands;

