import '../article.css';
 
 const adwaita_theme_for_qt = () => {
 return (
 <>

<h1 id="make-qt-software-integrate-visually-with-gnome-adwaita">Make QT software integrate visually with gnome adwaita</h1>
<ol type="1">
<li><p>First step is to install <code>kvantum</code>.</p></li>
<li><p>Then open the application &#x201C;Kvantum Manager&#x201D; and under &#x201C;Change/Delete Theme&#x201D; select <code>KvGnome</code>, <code>KvGnomeDark</code> or <code>kvYaru</code> if on ubuntu.</p></li>
<li><p>The environment variable <code>QT_STYLE_OVERRIDE=kvantum</code> needs to be set in order for it to work, but we can check the theme out by running an application from the console, an example with Audacious: <code>QT_STYLE_OVERRIDE=kvantum audacious</code>.</p></li>
<li><p>Now that we see it working, we can go ahead and add <code>QT_STYLE_OVERRIDE=kvantum</code> to <code>/etc/environment</code>. This can be done by opening the file with any text editor or by appending a line to the file like this: <code>echo 'QT_STYLE_OVERRIDE=kvantum' &gt;&gt; /etc/environment</code>.</p></li>
<li><p>Qt applications should now start with the kvantum theme.</p></li>
</ol>
<p><img src="./qt-default.png" title="Barrier, a Qt application with the default theming." alt="Default Qt theme" /> <img src="./qt-kvantum.png" title="The same application with the kvantum KvGnomeDark theme." alt="Kvantum KvGnomeDark theme" /></p>
<p>Some applications have their own theme or settings, musescore for example doesn&#x2019;t follow the system theme, in krita we can go to <code>Settings</code> &gt; <code>Styles</code> and sellect <code>kvantum</code>.</p>
<p><small>Written on 11-Feb-2022 by Ludovit Kramar</small></p>

 </>
 )
 };
 
 export default adwaita_theme_for_qt;

