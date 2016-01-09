angular.module('eventmapModule', [])
  .directive('eventmap', function() {

    var pvt = {
      events : [],
      mapContainer : null,
      element : null
    };

    pvt.normalize = function() {

    };

    pvt.render = function(scope, element, attrs) {
      console.log("Rendering Event Map", scope.events.length);

      // if(!pvt.mapContainer) {
        var id = Math.floor(Math.random() * (100000000 - 1)) + 100000000;
        pvt.mapContainer = document.createElement('div');
        pvt.mapContainer.style.height="400px";
        pvt.mapContainer.style.position='relative';
        pvt.mapContainer.id = id;
        pvt.mapContainer.className = 'eventmapContainer';
        element[0].innerHTML="";
        element[0].appendChild(pvt.mapContainer);
        pvt.map = L.map(pvt.mapContainer, {
            center: [51.505, -0.09],
            zoom: 10
        });
        var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        });
        pvt.map.addLayer(layer);
        setTimeout(function() {
          pvt.map.invalidateSize();
        },200);
      // }
      var mapLocationIcon = L.divIcon({
        className : 'mapLocationIcon',
        iconSize : [25,25]
      });
      var mapLocations = [];
      for(var i in scope.events) {
        var event = scope.events[i];
        if(event.geo.length>0) {
          var marker = L.marker([event.geo[0], event.geo[1]], { icon: mapLocationIcon });
          mapLocations.push(marker);
        }
      }
      var group = L.featureGroup(mapLocations).addTo(pvt.map);
      //pvt.map.fitBounds(group.getBounds());
      pvt.map.panTo(new L.LatLng(scope.events[scope.events.length-1].geo[0],scope.events[scope.events.length-1].geo[1]));



      //marker.addTo(pvt.map);
    }

    return {
        restrict: 'E',
        scope : {
          events: '=events'
        },
        link: function(scope, element, attrs) {
          pvt.element = element;
          pvt.attrs = attrs;
          //return function($scope) {
            scope.$watch('events', function() {
              if(scope.events.length>0) {
                pvt.render(scope, element, attrs);
              }
            });
          //}
        }
    };
})
