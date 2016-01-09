var NomieLabDatasource = function(datasourceConfig) {
  if(!datasourceConfig.type) {
    alert("Error, must provide a type to the NomieLabDatasource Constructor");
  } else {
    console.log("We're good", datasourceConfig);
  }
  var pub = {
    id : null,
    name : null,
    type : null
  };
  var pvt = {};
  pub.self = this;
  pub.internal = pvt;
  pvt.parents = [];
  pvt.data = {};
  pub.config = datasourceConfig;
  pvt.dataProxy = new NomieLabDatasourceTypes[datasourceConfig.type](datasourceConfig);
  pvt.dataProxy.init(datasourceConfig, function(err, data) {
    console.log("Datasource is Ready");
  });

  pvt.prep = function() {
    console.log("Initializing NomieLabDataasource", datasourceConfig);
  }(); // auto fire it

  // pub.Query = function() {
  //     var queryOptions = {
  //       parents : [],
  //       daysOfWeek : []
  //     };
  //     var q = {
  //       parent : function(id) {
  //         queryOptions.parents.push(id);
  //         return q;
  //       },
  //       daysOfWeek : function(day) {
  //         queryOptions.day = day;
  //         return q;
  //       },
  //       startAt : function(time) {
  //         queryOptions.startAt = time;
  //       },
  //       endAt : function(time) {
  //         queryOptions.endAt = time;
  //       },
  //       options : queryOptions
  //     };
  //     return q;
  // }; //pub.Query()

  /**
   * [function description]
   * @return {object} [description]
   * @example
   *  datasource.query().trackers()
   */
  pvt.jq = {
    trackers : null,
    notes : null,
    events : null
  };



  pub.getParents = function() {
    return pvt.parents;
  }
  pub.getEvents = function(options, callback) {
    options = options || {};
    pvt.dataProxy.getEvents(options, callback);
    return pub;
  }
  pub.getNotes = function(options, callback) {
    options = options || {};
    pvt.dataProxy.getNotes(options, callback);
    return pub;
  }
  pub.getTrackersOld = function(options, callback) {
    options = options || {};
    pvt.dataProxy.getTrackers(options, callback);
    return pub;
  }
  pub.getTrackers = function(options, callback) {
    options = options || {};
    var trackerObj = {};
    pvt.dataProxy.getTrackers(options, function(err, trackers) {
      for(var i in trackers) {
        trackerObj[trackers[i]._id] = trackers[i];
      }
      callback(err, trackerObj);
    });
    return pub;
  }


  pub.getAllData = function(callback) {
    var pack = {
      trackers : [],
      notes : [],
      events : []
    };
    pub.getEvents({},function(eventsError, events) {
      pack.events = events;
      pub.getNotes({},function(notesError,notes) {
        pack.notes = notes;
        pub.getTrackers({}, function(trackersError, trackers) {
          pack.trackers = trackers;
          pack.trackerArray = function(trackerObjs) {
            var r = [];
            for(var i in trackerObjs) {
              r.push(trackerObjs[i]);
            }
            return r;
          }(trackers);
          callback(null, pack);
        })
      });
    });
  }

  pub.analysis = {};
  pub.analysis.CorbinGeneral = function(callback) {
    pub.getEvents({}, function(eventsErr, events) {
      pub.getNotes({}, function(notesErr, notes) {
        pub.getTrackers({}, function(trackerErr, trackers) {
          var data = {
            trackers : trackers,
            events : events,
            notes : notes
          };
          callback(null, CorbinGeneral(data));
        }); //pub.getTrackers()
      }); //pub.getNotes()
    }); //pub.getEvents()
  };


  return pub;
};

/**
 * @constant NomieDatasourceTypes
 */

var NomieLabDatasourceTypes = {
  'csv' : NomieLabDatasourceCSV,
  'dropbox' : NomieLabDatasourceDropbox,
  'couchdb' : NomieLabDatasourceCouchDB
}

/**
 * @class NomieLabDatasource
 * @name NomieLabDatasource
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var NomieLabDatasourceFactory = function(options) {
  var pub = {}; //public scope
  var pvt = {}; //private scope
  pub.self = this;
  pub.internal = pvt;

  pub.add = function(datasource, callback) {
    console.log("Adding the datasource", datasource);
    // lets prune it.
    var ds = datasource;
    console.log("New Datasource Config", ds);
    var datasources = NomieLab.storage.get('datasources') || [];
    pub.validateDatasource(ds, function(err, data) {
      if(err!==null) {
        console.log(err);
        callback(err, datasource);
      } else {
        console.log("|---------------------------------------------------------|");
        console.log("|----- VALID DATASOURCE LETS SAVE IT   ------------|")
        console.log("|---------------------------------------------------------|");
        console.log(datasource.config[datasource.type]);
        datasources.push(datasource.config[datasource.type]);
        NomieLab.storage.set('datasources', datasources);
        callback(null, datasource);
      }
    })
  }; //pub.add

  pub.getAll = function() {
    return NomieLab.storage.get('datasources');
  }

  pub.validateDatasource = function(datasource, callback) {
    console.log("|---------------------------------------------------------|");
    console.log("|----- NOMIE LAB VALIDATE DATA SOURCE -----   ------------|")
    console.log("|---------------------------------------------------------|");
    datasource = datasource || {};
    datasource.type = datasource.type || "empty";
    if(NomieLabDatasourceTypes.hasOwnProperty(datasource.type)) {
      try{
        new NomieLabDatasourceTypes[datasource.type]().validate(datasource, function(err, data) {
          var valid = true;
          callback(err, data);
        });
      } catch(e) {
        callback({ message: ''}, null);
      }
    } else {
      alert("No valid datasource type found for "+datasource.type);
      callback({ message : datasource.type + " is not an available datasource type"}, null);
    }
  }


  return pub;
};
