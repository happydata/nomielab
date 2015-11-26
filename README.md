#Nomie Lab

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
	- **_variables.scss** - overide any Twitter Bootstrap variables here
	- **_app.scss** - put one-off styles for the app here
	- **_components.scss** - keep any reusable components here (like buttons and whatnot)
	- **app.scss** - this file pulls it all together, you should leave this file alone.


## Current Modules

### Nomie Overview
This module simply displays a high level overview of your Nomie data.

![](http://snap.icorbin.com/Screen-Shot-2015-11-26-12-25-41.png)

### Map Me
Map your Nomie experience over time.
![](http://snap.icorbin.com/Screen-Shot-2015-11-26-12-29-48.png)

### Main App Structure  

## Modules

------

# NomieLab Javascript Object Requirements

## NomieLab.datasources
Nomielab.datasource is an object for adding, editing and removing different Nomie data sets - including: CSV exports,  dropbox JSON files and couchdb servers.

### NomieLab.datasources.get(id, callback);
### NomieLab.datasources.delete(id, callback);
### NomieLab.datasources.getAll(callback);
### NomieLab.datasources.add(type, options)

- **type** csv, dropbox-backup, couchdb
- **options** Object containing parameters to pass to the data source creator
 - **options.name** (required) a name for the datasource

This method isn't responsible for reading the CSV or Dropbox backup files, it only expects the data from said files.

**Adding a CSV Datasource**
~~~
NomieLab.datasources.add('csv', {
  data : csvData,
  name : 'My exported Nomie data',
  success : function(response) {
    console.log(response.id); // get datasource unique id
  },
  error : function(error) {

  }
});
~~~
**CouchDB**
~~~
NomieLab.datasources.add('couchdb', {
  name : 'IrisCouch Realtime',
  host : 'nomietest.iriscouch.com:5984',
  auth : {
    username : 'test',
    password : 'test'
  },
  success : function(response) {
    console.log(response.id); // get datasource unique id
  },
  error : function(error) {

  }
});
~~~
**Adding a Dropbox Backup Datasource**
~~~
NomieLab.datasources.add('dropbox-backup', {
  name : 'Dropbox Oct 2014',
  data : dropboxJSONdata,
  success : function(response) {
    console.log(response.id); // get datasource unique id
  },
  error : function(error) {

  }
});
~~~

### Datasource

#### datasource.query()
~~~
var datasource = NomieLab.datasources.get('nomie-csv-1');
var query = new datasource.Query();
~~~
