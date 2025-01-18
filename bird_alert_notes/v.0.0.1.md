
# Project Overview & Approach

Don't know the exact direction to go with this project yet, but from everything I've looked at in the eBird API it doesn't allow you to pull this data directly.  So my first idea is to just scrape my [eBird Alert subscriptions](https://ebird.org/alerts).  The obvious downside to this, is if they change the email format for this alert, it will break my project.  In the interest of not paying money for this project, I set up the /extract_email_data/extract.js as a Google App Script (triggered once a day) and stored the resulting geoJSON data in my Google Drive.  The plan I think is to then will have a [[Github Action]] to upload the most recent geoJSON file into Github.  Since the website is hosted on Github Pages and is static, the javascript will load this most recent file.

## Version Notes

* Subscribed to [eBird Needs Alert](https://ebird.org/alerts)
* Setup a [Google App](https://script.google.com/home/) with extract_email_data/extract.js to create geojson files automatically from my emails and store them in Google Drive
* Synced my Google Drive to my computer
* Setup front-end with basic header
* Setup github icon/link
* Setup Leaflet map
* Added Imagery, County Layer, and NLCD Land Cover
* Loaded in geojson test data
* Cleaned up and generated pop-up content (pretiffy functions)
* Currently using test data (not live)
