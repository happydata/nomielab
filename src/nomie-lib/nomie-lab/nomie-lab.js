var NomieLabCore = function(options) {
  var pub = {};
  var pvt = {};
  pub.self = this;
  pub.internal = pvt;
  pub.currentDatasource = null;
  pub.datasources = new NomieLabDatasourceFactory();

  pub.storage = {
    get : function(key) {
      console.log("NomieLabCore.storage.get()", key);
      return JSON.parse(window.localStorage.getItem(key) || '{ "value": null }').value;
    },
    set : function(key, value) {
      console.log("NomieLabCore.storage.put()", key);
      var pack = {
        key : key,
        value : value
      };
      return window.localStorage.setItem(key,JSON.stringify(pack));
    }
  };

  /**
   * @object
   * @memberof nomielab
   * @type {Object}
   * @example
   *
   */
  pub.notify = {
    warning : toastr.warning,
    success : toastr.success,
    error : toastr.error,
    clear : toastr.clear
  };

  // Simple but unreliable function to create string hash by Sergey.Shuchkin [t] gmail.com
  // alert( strhash('http://www.w3schools.com/js/default.asp') ); // 6mn6tf7st333r2q4o134o58888888888
  pub.hash = function( str ) {
        if (str.length % 32 > 0) str += Array(33 - str.length % 32).join("z");
        var hash = '', bytes = [], i = j = k = a = 0, dict = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','1','2','3','4','5','6','7','8','9'];
        for (i = 0; i < str.length; i++ ) {
            ch = str.charCodeAt(i);
            bytes[j++] = (ch < 127) ? ch & 0xFF : 127;
        }
        var chunk_len = Math.ceil(bytes.length / 32);
        for (i=0; i<bytes.length; i++) {
            j += bytes[i];
            k++;
            if ((k == chunk_len) || (i == bytes.length-1)) {
                a = Math.floor( j / k );
                if (a < 32)
                    hash += '0';
                else if (a > 126)
                    hash += 'z';
                else
                    hash += dict[  Math.floor( (a-32) / 2.76) ];
                j = k = 0;
            }
        }
        return hash;
    }

  return pub;
};
