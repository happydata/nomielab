/**
 * @class NomieLabDataSourceCSV
 * @param  {object} options default set of options
 * @return {object}         public functions
 */
var NomieLabDatasourceCSV = function (options) {
	var pub = {};
	var pvt = {};
	pvt.options = options || {};
	pub.self = this;
	pub.internal = pvt;
	pvt.data = null;

	/**
	 * @function init
	 * @memberof NomieLabDatasourceCSV
	 * @param  {object}   options  Options for initialization
	 * @param  {Function} callback Callback(err, pub)
	 */
	pub.init = function (options, callback) {
			localforage.getItem(options.keyName, function (err, data) {
				pvt.data = data;
				callback(null, pub);
			});
		}
	/**
	 * @function validate
	 * @memberof NomieLabDatasourceCSV
	 * @param  {object}   datasourceSettings  Options for initialization
	 * @param  {Function} callback Callback(err, pub)
	 * @description Validates and Saves data as needed.
	 */
	pub.validate = function (datasourceSettings, callback) {
			var errors = [];
			var data = {};
			var valid = true;
			var csvReader = new FileReader();

			/* When the File is Loaded */
			csvReader.onload = function (e) {
					var fileContent = e.target.result;
					var keyName = datasourceSettings.config.csv.file.lastModified + '_' + datasourceSettings.config.csv.file.name;
					datasourceSettings.config.csv.keyName = keyName;
					try {
						/* Try and convert the CSV to a JSON object, then to a Datasource object */
						data = pvt.json2datasource(pvt.csv2json(fileContent))
						localforage.setItem(keyName, data);
					}
					catch (e) {
						/* Catch any failures */
						valid = false;
						errors.push(e);
					};

					if (valid) {
						callback(null, true);
					}
					else {
						callback({
							message: errors.join(" - ")
						});
					}
				}
				/* Read the CSV File the user Selected */
			csvReader.readAsText(datasourceSettings.config.csv.file);

		}
	/**
	 * @function getData
	 * @memberof NomieLabDatasourceCSV
	 * @param  {object}   options  Options for initialization
	 * @param  {Function} callback Callback(err, data)
	 */
	pub.getTrackers = function (options, callback) {
		callback(null, pvt.data.trackers);
	}

	/**
	 * @function getEvents
	 * @memberof NomieLabDatasourceCSV
	 * @param  {object}   options  Options for initialization
	 * @param  {Function} callback Callback(err, data)
	 */
	pub.getEvents = function (options, callback) {
		callback(null, pvt.data.events);
	}

	/**
	 * @function getNotes
	 * @memberof NomieLabDatasourceCSV
	 * @param  {object}   options  Options for initialization
	 * @param  {Function} callback Callback(err, data)
	 */
	pub.getNotes = function (options, callback) {
			callback(null, pvt.data.notes);
		}
		/**
		 * @function csv2JSON
		 * @memberof NomieLabDatasourceCSV
		 * @param  {string} string CSV String
		 * @return {object}        JSON version
		 */
	pvt.csv2json = function (csv) {
		var lines = csv.split("\n");
		var result = [];
		var headers = lines[0].split(",");
		for (var i = 1; i < lines.length; i++) {
			var obj = {};
			var currentline = lines[i].split(",");
			for (var j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
			}
			result.push(obj);
		}
		return (result); //JSON
	}

  /**
   * @function json2datasource
   * @description Will take a json version of the csv and convert it to a datasource
   */
	pvt.json2datasource = function (json) {
		var trackersMap = {};
		var ds = {
			events: [],
			notes: [],
			trackers: []
		}
		var rows = [];
		for (var r in json) {
			var thisr = json[r];
			var row = {};
			row.charge = thisr.charge || 0;
			row.parent = thisr.trackerId || null;
			row.time = thisr.time || null;
			row._id = 'tick|tm|' + row.time + '|' + row.parent + '|' + row.charge;
      /* Make sure we haven't already processed this tracker */
			if (!trackersMap.hasOwnProperty(thisr.trackerId)) {
				trackersMap[thisr.trackerId] = thisr.tracker;
        /* Build a partially complete Tracker from the data we do have */
        ds.trackers.push({
					label: thisr.tracker,
					_id: thisr.trackerId,
					color: '#999699',
					charge: thisr.charge,
					config: {
						type: 'tick'
					}
				});
			}
			row.geo = [thisr.lat, thisr.long];
			row.value = thisr.value;
			ds.events.push(row);
		}
		return ds;
	}

	return pub;
};
