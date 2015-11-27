#Nomie Lab  !!EXPERIMENTAL NOT READY FOR PUBLIC CONSUMPTION.

Nomie Lab is an open source HTML5 app interacting with data collected using [Nomie](http://nomie.io). Personal private data is the heart of Nomie, but with making data private, we often lose the ability to access kick ass tools. Nomie Lab should solve that.

## The Nomie Lab Objective:
To provide a free and decentralized application to analyze, research and explore your Nomie data - without giving it up to some remote server.


```
git clone https://github.com/happydata/nomielab.git
cd nomielab
bower install
npm install
gulp serve
```

## Adding a Datasource

1. Click "Add Nomie Data"
2. Select which data you'd like to use.
  1. Dropbox Export - a nomie dropbox backup file. Dropbox/Apps/Nomie
  2. CouchDB - Sync to a couchdb in real time (SWEET)
  3. CSV - Import a Nomie CSV Export (version 1.1 or higher)
3. Refresh the page (this a bug), if you used CouchDB watch the console for the sync status;

## App Structure

- index.html - the "one" page.
- app/
  - base - starter module
      - /base.js - start controller
  - Layouts
  - modules
      - /lab-map-me - an example module using map data
      - /nomie-overview - example module for datasources and charts
  - app.js - core app and routing

## SASS

Sass files are automatically compiled when you run `gulp serve`.

- /sass
	- **_variables.scss** - override any Twitter Bootstrap variables here
	- **_app.scss** - put one-off styles for the app here
	- **_components.scss** - keep any reusable components here (like buttons and whatnot)
	- **app.scss** - this file pulls it all together, you should leave this file alone.


## Current Modules
Nomie Lab

### Nomie Overview
This module simply displays a high level overview of your Nomie data.

![](http://snap.icorbin.com/Screen-Shot-2015-11-26-12-25-41.png)

### Map Me
Map your Nomie experience over time.
![](http://snap.icorbin.com/Screen-Shot-2015-11-26-12-29-48.png)

### Dear Diary
See your Note entries in a whole new light.
![](http://snap.icorbin.com/Screen-Shot-2015-11-27-14-02-59.png)

## Datasource
Interacting with the current datasource
NEED CONTENT
