This demo uses Backbone JS, Underscore Templating, jQuery and Twitter Bootstrap to varying degrees to interact with the Twitter public API. There is no server-side requirement to run this web app, it will run as-is by opening "index.html" in a web browser. The default Twitter feed is @Cmdr_Hadfield.

Known Issues (abridged)
- Filtering is incomplete
- "Fetch from Server" has unexpected results; new tweets will be appended to the list.
- "Fetch from Server" is not on a timer, for development purposes
- Local storage is not yet used. The Favourites in the left panel are to be Twitter feeds the user has previously viewed.