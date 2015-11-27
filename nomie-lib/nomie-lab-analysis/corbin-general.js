var CorbinGeneral = function(datapack) {
  //console.log("CorbinGeneral Analysis Starts", datapack);
  var pub = {};
  var jq = {
    notes : null,
    events : null,
    trackers : null
  }
  var r = {
    events : {
      positive : 0,
      negative : 0,
      neutral : 0,
      total : 0,
      byMonth : {
        'Jan' : 0,
        'Feb' : 0,
        'Mar' : 0,
        'Apr' : 0,
        'May' : 0,
        'Jun' : 0,
        'Jul' : 0,
        'Aug' : 0,
        'Sep' : 0,
        'Oct' : 0,
        'Nov' : 0,
        'Dec' : 0,
      },
      byHour : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0},
      byDay : {
        'Sun' : 0,
        'Mon' : 0,
        'Tue' : 0,
        'Wed' : 0,
        'Thu' : 0,
        'Fri' : 0,
        'Sat' : 0
      }
    },
    notes : {
      positive : 0,
      negative : 0,
      neutral : 0,
      total : 0
    },
    trackers : {

    }
  }

  pub.init = function() {
    //console.log("Init Corbin General");
    jq.notes = JsonQuery(datapack.notes);
    jq.trackers = JsonQuery(datapack.trackers);
    jq.events = JsonQuery(datapack.events);
    pub.processEvents();
    pub.processNotes();
    pub.processTrackers();
    //console.log(jq.events, datapack.events);
    return r;
  };

  /* Loop over events */
  pub.processEvents = function() {
    for(var e in datapack.events) {
      var tick = datapack.events[e];
      if(tick.charge>0) {
        r.events.positive++;
      } else if(tick.charge<0) {
        r.events.negative++;
      } else {
        r.events.neutral++;
      }

      r.events.byDay[moment(tick.time).format('ddd')]++;
      r.events.byMonth[moment(tick.time).format('MMM')]++;
      r.events.byHour[moment(tick.time).format('H')]++;
      r.events.total++;
    }
  }

  pub.processNotes = function() {
    for(var e in datapack.notes) {
      var note = datapack.notes[e];
      if(note.charge>0) {
        r.notes.positive++;
      } else if(note.charge<0) {
        r.notes.negative++;
      } else {
        r.notes.neutral++;
      }
      r.notes.total++;
    }
  }

  pub.processTrackers = function() {
    for(var t in datapack.trackers) {
      var tracker = datapack.trackers[t];
      r.trackers[tracker._id] = pub.trackerAnalysis(tracker);
    } // end loop over trackers`
  }

  pub.trackerAnalysis = function(tracker) {
      //console.log('|=====================================================|');
      //console.log('|====  Tracker Analysis Starts Now for '+tracker.label+' ===|');
      var dayLog = {};
      var monthLog = {};
      var stats = {
        positive : 0,
        negative : 0,
        neutral : 0,
        total : 0,
        byMonth : {'Jan' : 0, 'Feb' : 0, 'Mar' : 0, 'Apr' : 0, 'May' : 0, 'Jun' : 0, 'Jul' : 0, 'Aug' : 0, 'Sep' : 0, 'Oct' : 0, 'Nov' : 0, 'Dec' : 0 },
        byHour : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0},
        byDay : { 'Sun' : 0, 'Mon' : 0, 'Tue' : 0, 'Wed' : 0, 'Thu' : 0, 'Fri' : 0, 'Sat' : 0 }
      };
      ////console.log(jq);

      var events = jq.events.where({'parent' : tracker._id}).exec();
      //console.log("Events for "+tracker.label, events);

      for(var e in events) {
        var event = events[e];
        var daySlot = moment(event.time).format('YYYY-MM-DD');
        var monthSlot = moment(event.time).format('YYYY-MM');
        stats.byDay[moment(event.time).format('ddd')]++;
        stats.byMonth[moment(event.time).format('MMM')]++;
        stats.byHour[moment(event.time).format('H')]++;
        stats.total++;

        if(dayLog.hasOwnProperty(daySlot)) {
          dayLog[daySlot]++
        } else {
          dayLog[daySlot]=1;
        }
        if(monthLog.hasOwnProperty(monthSlot)) {
          monthLog[monthSlot]++
        } else {
          monthLog[monthSlot]=1;
        }
      }

      var dayLogArray = [];
      for(var i in dayLog) {
        dayLogArray.push(dayLog[i]);
      }
      var monthLogArray = [];
      for(var m in monthLog) {
        monthLogArray.push(monthLog[m]);
      }


      stats.averages = {
        byDay : jStat.mean(dayLogArray),
        byMonth : jStat.mean(monthLogArray)
      };
      tracker.stats = stats;

      return tracker;
  }; //pub.trackerAnalysis();



  return pub.init();
}; //CorbinGeneral
