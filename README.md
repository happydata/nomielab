#Nomie Lab  !!EXPERIMENTAL NOT READY FOR PUBLIC CONSUMPTION.

Works with Nomie 1.1 or later.

An HTML5 based application for interacting with data collected using [Nomie](http://nomie.io).

```
git clone https://github.com/brandoncorbin/nomielab.git
cd nomielab
bower install
npm install
gulp serve
```

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

## Datasource
Interacting with the current datasource
NEED CONTENT
