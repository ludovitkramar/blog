# Dynamic wallpapers for KDE plasma

How to use wallpapers that change throughout the day in KDE plasma 5?

In Arch Linux the aur package `plasma5-wallpapers-dynamic` can be used to achieve this. The project's github is: https://github.com/zzag/plasma5-wallpapers-dynamic

Once installed the wallpaper type `Dynamic` will be available in plasma's desktop configuration.

## To use a dynamic wallpaper there are two options:

1. Convert a `.heic` file for macOS to use in plasma.
2. Use `kdynamicwallpaperbuilder` to create your own `.heic` wallpaper file.

### To convert a `.heic` file:

1. First download a script to do that with: `curl https://git.io/JJkjd -sL > dynamicwallpaperconverter`.
2. With the script downloaded we can run `python dynamicwallpaperconverter --crossfade ./myfile.heic` to convert `myfile.heic` to a compatible format. This assumes that the script and the file is in the same folder.
3. This will create `wallpaper.heic`, rename the file and add it as a background in plasma's settings.

### To create your own background from a set of images:

1. Collect the images you want to use and put them in a folder.
2. Create a `description.json` file following this format:

   ```
   [
   	{
   	    "CrossFade": true,
   	    "Time": "06:00",
   	    "FileName": "1.png"
   	},
   	{
   	    "CrossFade": true,
   	    "Time": "12:00",
   	    "FileName": "2.png"
   	},
   	{
   	    "CrossFade": true,
   	    "Time": "18:00",
   	    "FileName": "3.png"
   	}
   ] 
   
   ```

   Change the filenames and the time to suit your needs, more or fewer images can be used.

   Additionally, this software can use the position of the sun to chose when to show the images, for that it is necessary to add that information to the `description.json` file.

   Instructions for that can be found here: https://github.com/zzag/plasma5-wallpapers-dynamic/blob/main/src/tools/builder/README.md
3. Now simply run `kdynamicwallpaperbuilder description.json` to create the `wallpaper.heic` file.