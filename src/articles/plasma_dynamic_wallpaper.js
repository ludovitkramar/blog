import '../article.css';
 
 const plasma_dynamic_wallpaper = () => {
 return (
 <>

<h1 id="dynamic-wallpapers-for-kde-plasma">Dynamic wallpapers for KDE plasma</h1>
<p>How to use wallpapers that change throughout the day in KDE plasma 5?</p>
<p>In Arch Linux the aur package <code>plasma5-wallpapers-dynamic</code> can be used to achieve this. The project&#x2019;s github is: https://github.com/zzag/plasma5-wallpapers-dynamic</p>
<p>Once installed the wallpaper type <code>Dynamic</code> will be available in plasma&#x2019;s desktop configuration.</p>
<h2 id="to-use-a-dynamic-wallpaper-there-are-two-options">To use a dynamic wallpaper there are two options:</h2>
<ol type="1">
<li>Convert a <code>.heic</code> file for macOS to use in plasma.</li>
<li>Use <code>kdynamicwallpaperbuilder</code> to create your own <code>.heic</code> wallpaper file.</li>
</ol>
<h3 id="to-convert-a-.heic-file">To convert a <code>.heic</code> file:</h3>
<ol type="1">
<li>First download a script to do that with: <code>curl https://git.io/JJkjd -sL &gt; dynamicwallpaperconverter</code>.</li>
<li>With the script downloaded we can run <code>python dynamicwallpaperconverter --crossfade ./myfile.heic</code> to convert <code>myfile.heic</code> to a compatible format. This assumes that the script and the file is in the same folder.</li>
<li>This will create <code>wallpaper.heic</code>, rename the file and add it as a background in plasma&#x2019;s settings.</li>
</ol>
<h3 id="to-create-your-own-background-from-a-set-of-images">To create your own background from a set of images:</h3>
<ol type="1">
<li><p>Collect the images you want to use and put them in a folder.</p></li>
<li><p>Create a <code>description.json</code> file following this format:</p>
<pre><code>[
 &#123;
     &quot;CrossFade&quot;: true,
     &quot;Time&quot;: &quot;06:00&quot;,
     &quot;FileName&quot;: &quot;1.png&quot;
 &#125;,
 &#123;
     &quot;CrossFade&quot;: true,
     &quot;Time&quot;: &quot;12:00&quot;,
     &quot;FileName&quot;: &quot;2.png&quot;
 &#125;,
 &#123;
     &quot;CrossFade&quot;: true,
     &quot;Time&quot;: &quot;18:00&quot;,
     &quot;FileName&quot;: &quot;3.png&quot;
 &#125;
] 
</code></pre>
<p>Change the filenames and the time to suit your needs, more or fewer images can be used.</p>
<p>Additionally, this software can use the position of the sun to chose when to show the images, for that it is necessary to add that information to the <code>description.json</code> file.</p>
<p>Instructions for that can be found here: https://github.com/zzag/plasma5-wallpapers-dynamic/blob/main/src/tools/builder/README.md</p></li>
<li><p>Now simply run <code>kdynamicwallpaperbuilder description.json</code> to create the <code>wallpaper.heic</code> file.</p></li>
</ol>

 </>
 )
 };
 
 export default plasma_dynamic_wallpaper;

