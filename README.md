### Offline Tierlist Maker

This is a simple webpage that allows creating custom "[Tierlists](https://knowyourmeme.com/memes/tier-lists)".

I was looking for a decent app that would allow me to do that offline without uploading my images to a server or requiring an account, but I couldn't find any, so I made one myself.

You can play with the latest version at [silverweed.github.io/tiers](https://silverweed.github.io/tiers), or you can download the repository and open `index.html` in your browser (in both cases, all the logic is run locally on your browser).

#### Features
- Give a title to your tierlist
- Import any number of pictures from your local disk
- Customize the tier names
- Customize the number of tiers
- Export your tierlist as JSON and reimport it even from another PC (image data is embedded in the save file). Please consider that this tierlist maker currently does NOT rescale or process the images in any way, so the save file's size will strongly depend on how large are your input images. Avoid uploading too many huge images or the whole app may slow down. In the future I may add thumbnailing capabilities, but for now I'd rather keep it simple. 
- Import back your tierlist from JSON, either by manually loading it through the Import button or from a remote file. To import a remote tierlist file, use the query parameter `?url=http://url/of/your_tierlist.json` (to avoid issues with special characters in the URL it's advisable to [URL-encode](https://www.urlencoder.io/) it).

If you'd like to propose any feature, feel free to open a PR. I probably won't have time to follow issues closely or add much stuff myself though.

### Using this Tierlist Maker

You are allowed to use this Tierlist Maker however you wish (including YouTube videos, images, memes, embedding it in your website, etc).

