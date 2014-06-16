/*
*  Simple navigation control that allows back and forward navigation through map's view history
*/

(function () {
  L.Control.NavBar = L.Control.extend({
    options: {
      position: 'topleft',
      //center:,
      //zoom :,
      forwardTitle : "Go forward in map view history",
      backTitle : "Go back in map view history",
      homeTitle : "Go to home map view"
    },

    onAdd: function (map) {

      // Set options
      if(!this.options.center){
        this.options.center = map.getCenter();
      }
      if(!this.options.zoom){
        this.options.zoom = map.getZoom();
      }
      options = this.options;

      // Create toolbar
      var controlName = 'leaflet-control-navbar',
      container = L.DomUtil.create('div', controlName + ' leaflet-bar');

      // Add toolbar buttons
      this._homeButton = this._createButton(options.homeTitle,controlName + '-home', container, this._goHome);
      this._fwdButton = this._createButton(options.forwardTitle,controlName + '-fwd', container, this._goFwd);
      this._backButton = this._createButton(options.backTitle,controlName + '-back', container, this._goBack);

      // Initialize view history and index
      this._viewHistory=[{center:options.center,zoom:options.zoom}];
      this._curIndx = 0;
      // Set intial view to home
      map.setView(options.center,options.zoom);

      map.on('moveend', this._updateHistory, this);

      return container;
    },

    onRemove: function (map) {
      map.off('moveend', this._updateHistory, this);
    },

    _goHome:function(){
      this._map.setView(this.options.center,this.options.zoom);
    },

    _goBack:function(){
      if(this._curIndx!=0){
      this._curIndx--;
      this._updateDisabled();
      var view = this._viewHistory[this._curIndx];
      this._map.setView(view.center,view.zoom);
      }
    },

    _goFwd:function(){
      if(this._curIndx!=this._viewHistory.length-1){
      this._curIndx++;
      this._updateDisabled();
      var view = this._viewHistory[this._curIndx];
      this._map.setView(view.center,view.zoom);
      }
    },

    _createButton: function (title, className, container, fn) {
      // Modified from Leaflet zoom control

      var link = L.DomUtil.create('a', className, container);
      link.href = '#';
      link.title = title;

      L.DomEvent
      .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
      .on(link, 'click', L.DomEvent.stop)
      .on(link, 'click', fn, this)
      .on(link, 'click', this._refocusOnMap, this);

      return link;
    },

    _updateHistory :function(e){
      var newView = {center:this._map.getCenter(),zoom:this._map.getZoom()};
      var curView = this._viewHistory[this._curIndx]
      if(!newView.center.equals(curView.center)||newView.zoom!=curView.zoom){
        var insertIndx = this._curIndx+1;
        this._viewHistory.splice(insertIndx,this._viewHistory.length-insertIndx,newView);
        this._curIndx++;
        // Update disabled state of toolbar buttons
        this._updateDisabled();
      }
    },

    _updateDisabled: function () {
      // Modified from Leaflet zoom control
      var map = this._map,
      leafletDisable = 'leaflet-disabled',
      fwdDisabled='leaflet-control-navbar-fwd-disabled',
      backDisabled='leaflet-control-navbar-back-disabled';

      L.DomUtil.removeClass(this._fwdButton, leafletDisable);
      L.DomUtil.removeClass(this._backButton, leafletDisable);
      L.DomUtil.removeClass(this._fwdButton, fwdDisabled);
      L.DomUtil.removeClass(this._backButton, backDisabled);

      if (this._curIndx == (this._viewHistory.length-1)) {
        L.DomUtil.addClass(this._fwdButton, leafletDisable);
        L.DomUtil.addClass(this._fwdButton, fwdDisabled);
      }
      if (this._curIndx <= 0) {
        L.DomUtil.addClass(this._backButton, leafletDisable);
        L.DomUtil.addClass(this._backButton, backDisabled);
      }
    }

  });

  L.control.navbar = function (options) {
    return new L.Control.NavBar(options);
  };

})();
