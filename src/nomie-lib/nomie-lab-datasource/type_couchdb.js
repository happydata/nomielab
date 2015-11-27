/**
 * @constant NomieLabDatasourceCouchDB
 * @name NomieLabDatasourceCouchDB
 * @memberof NomieLab
 * @param  {object} options Options for this datasource
 * @return {object}         pub
 */
var NomieLabDatasourceCouchDB = function(options) {
  var pub = {};
  var pvt = {};
  pvt.options = options || {};
  pub.self = this;
  pub.internal = pvt;
  pub.valid = false;

  pvt.remoteEventsCouch = null;

  /**
   * @function init
   * @memberof NomieLabDatasourceCouchDB
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, pub)
   */
  pub.init = function(options,callback) {
    console.log("Initalizing Nomie Lab CouchDB Datasource Proider", options);
    pvt.localEventsCouch = new PouchDB(pvt.configToDBName(options, '_events'), { adapter : 'websql' });
    pvt.localTrackersCouch = new PouchDB(pvt.configToDBName(options,'_trackers'), { adapter : 'websql' });
    pvt.remoteEventsCouch = new PouchDB(pvt.configToURL(options, '_events'), {
      auth : {
        username: options.username,
        password: options.password
      }
    }).then(function(db) {
      pvt.remoteEventsCouch = db;
      pvt.remoteEventsCouch.replicate.to(pvt.localEventsCouch,{
        live : true,
        retry : true,
      }).on('change', function(info) {
        console.log("Syncing Events Database", info);
      });

      pvt.remoteEventsCouch.info(function(err, data) {
        if(err===null) {
          console.log("type_couchdb.js :: init :: couch callback success");
          callback(null, true);
          pub.valid = true;
        } else {
          console.log("type_couchdb.js :: init :: couch callback failure");
          callback(err, false);
        }
      })
    }).catch(function(err) {
      alert("An error validating the server");
      callback(err, false);
    });


    /// Trackers DB
    pvt.remoteTrackersCouch = new PouchDB(pvt.configToURL(options,'_trackers'), {
      auth : {
        username: options.username,
        password: options.password
      }
    }).then(function(db) {
      pvt.remoteTrackersCouch = db;
      pvt.remoteTrackersCouch.replicate.to(pvt.localTrackersCouch,{
        live : true,
        retry : true,
      }).on('change', function(info) {
        console.log("Syncing Tracker Database", info);
      });

    }).catch(function(err) {
      alert("An error validating the server");
      //callback(err, false);
    });



    callback(null, pub);
    return pub;
  }
  /**
   * @function validate
   * @memberof NomieLabDatasourceCouchDB
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, pub)
   */
  pub.validate = function(dsOptions, callback) {
    var options = dsOptions.config[dsOptions.type];
    console.log("Nomie Lab CouchDB valudate", options);
    var dburl = pvt.configToURL(options, '_events');
    var db = new PouchDB(dburl, {
      auth : {
        username: options.username,
        password: options.password
      }
    }).then(function(db) {
      db.info(function(err, data) {
        if(err===null) {
          callback(null, true);
          pub.valid = true;
        } else {
          callback(err, false);
        }
      })
    }).catch(function(err) {
      alert("An error validating the server");
      callback(err, false);
    });
    //pvt.remoteEventsCouch = new PouchDB('')

  } //pub.validate

  /**
   * @function getData
   * @memberof NomieLabDatasourceCouchDB
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, data)
   */
  pub.getEvents = function(options, callback) {
    console.log("Nomie Lab CouchDB getData", pvt.remoteEventsCouch);
    pvt.localEventsCouch.allDocs({
      include_docs : true,
      startkey : 'tick|tm|0',
      endkey : 'tick|tm|~',
    }).then(function(results) {
      callback(null, pvt.pouch2obj(results.rows));
    }).catch(function(error) {
      callback(error, []);
    });
  }

  pub.getTrackers = function(options, callback) {
    console.log("Nomie Lab CouchDB getTrackers()", pvt.localTrackersCouch);
    pvt.localTrackersCouch.allDocs({
      include_docs : true,
    }).then(function(results) {
      var trackers = [];
      for(var i in results.rows) {
        trackers.push(results.rows[i].doc);
      }
      callback(null, trackers);
    }).catch(function(error) {
      callback(error, []);
    });
  }

  pub.getNotes = function(options, callback) {
    callback = callback || function(err, data) {
      console.log("Intrem Callback for CouchDB.getNotes() missing callback", err, data);
    }
    console.log("Nomie Lab CouchDB getData", pvt.remoteEventsCouch);
    pvt.localEventsCouch.allDocs({
      startkey : 'note|0',
      endkey : 'note|~',
      include_docs : true
    }).then(function(results) {
      callback(null, pvt.pouch2obj(results.rows));
    }).catch(function(error) {
      callback(error, []);
    });
  }


  pvt.pouch2obj = function (rows) {
		var records = [];
		console.log("POUCH2OBJ", new Date());
		for (var i in rows) {
			var obj = pvt.decodeId(rows[i].id); // Decode the ID to an object
        if (rows[i].hasOwnProperty('doc')) {
  				obj.value = rows[i].doc.value;
  				obj.geo = rows[i].doc.geo;
  				if(rows[i].doc.hasOwnProperty('offset')) {
  					obj.offset = rows[i].doc.offset;
  				}
  			} else {
  				obj.geo = [];
  				obj.value = null;
  				obj.offset = null;
  			}
  			records.push(obj);
		}
    console.log("FINISHED POUCH2OBJ", new Date());
		return records;

	};

  pvt.decodeId = function (id) {
		var ida = id.split('|');
		var obj = {
			_id: id,
			type: ida[0]
		};
		var mode = ida[1];
		switch (mode) {
		case 'tm':
			obj.time = parseInt(ida[2]);
			obj.timeFormatted = moment(new Date(obj.time)).format('ddd MMM Do YYYY hh:mma');
			obj.parent = ida[3];
			obj.charge = parseInt(ida[4]);
			break;
		case 'dy':
			obj.time = parseInt(ida[4]);
			obj.timeFormatted = moment(new Date(obj.time)).format('ddd MMM Do YYYY hh:mma');
			obj.parent = ida[3];
			obj.charge = parseInt(ida[5]);
			break;
		case 'pr':
			obj.time = parseInt(ida[3]);
			obj.timeFormatted = moment(new Date(obj.time)).format('ddd MMM Do YYYY hh:mma');
			obj.parent = ida[2];
			obj.charge = parseInt(ida[4]);
			break;
		}
		return obj;

	}; // END EVENT OBJECT


  pvt.configToURL = function(options, prepend) {
    prepend = prepend || "";
    var theURL = ((options.https) ? 'https://' : 'http://') + options.host+'/'+options.username+prepend;
    return theURL;
  };

  pvt.configToDBName = function(options, prepend) {
    prepend = prepend || "";
    var theURL = ((options.https) ? 'https://' : 'http://') + options.host+'/'+options.username+prepend;
    return NomieLab.hash(theURL);
  };



  return pub;
};
