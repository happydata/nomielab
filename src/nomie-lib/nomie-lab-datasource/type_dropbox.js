/**
 * @class NomieLabDataSourceDropbox
 * @param  {object} options default set of options
 * @return {object}         public functions
 */
var NomieLabDatasourceDropbox = function(options) {
  var pub = {};
  var pvt = {};
  pvt.options = options || {};
  pub.self = this;
  pub.internal = pvt;
  pvt.data = null;

  /**
   * @function init
   * @memberof NomieLabDatasourceDropbox
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, pub)
   */
  pub.init = function(options,callback) {
    localforage.getItem(options.keyName, function(err, data) {
      pvt.data = data;
      callback(null, pub);
    });
  }
  /**
   * @function init
   * @memberof NomieLabDatasourceDropbox
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, pub)
   */
  pub.validate = function(datasourceSettings, callback) {
    var errors = [];
    var data = {};
    var valid = true;
    var jsonReader = new FileReader();

    jsonReader.onload = function(e) {
        var fileContent = e.target.result;
        var keyName = datasourceSettings.config.dropbox.file.lastModified+'_'+datasourceSettings.config.dropbox.file.name;
        datasourceSettings.config.dropbox.keyName = keyName;
        try {
          data = JSON.parse(fileContent);
          localforage.setItem(keyName, data);
       } catch(e) {
         valid = false;
         errors.push(e);
       };
        if(valid) {
          callback(null, true);
        } else {
          callback({ message: errors.join(" - ")});
        }
    }
    jsonReader.readAsText(datasourceSettings.config.dropbox.file);

    //callback(null, options);
  }
  /**
   * @function getData
   * @memberof NomieLabDatasourceDropbox
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, data)
   */
  pub.getTrackers = function(options, callback) {
    callback(null, pvt.data.trackers);
  }

  /**
   * @function getEvents
   * @memberof NomieLabDatasourceDropbox
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, data)
   */
  pub.getEvents = function(options, callback) {
    callback(null, pvt.data.ticks);
  }

  /**
   * @function getNotes
   * @memberof NomieLabDatasourceDropbox
   * @param  {object}   options  Options for initialization
   * @param  {Function} callback Callback(err, data)
   */
  pub.getNotes = function(options, callback) {
    callback(null, pvt.data.notes);
  }

  return pub;
};
