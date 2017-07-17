/*
 * index.js contains the window.load event handlers which start the app, as well as any other JavaScript code necessary.
 * This is where you will start adding your own code, adding event handlers, etc.
 *
 * The app is based on jQuery Mobile, so constructs like $('#id') and $.get() are entirely usable here.
 * But it's also designed for operating properly in Chrome for prototyping, so .click() is used instead of .tap()
 */

// the Map object, default center and zoom settings
var MAP, CACHE, MAP_FORM;
var DEFAULT_LAT =   44.5875;
var DEFAULT_LNG = -123.1712;
var DEFAULT_ZOOM = 8;
var MIN_ZOOM = 2;
var MAX_ZOOM = 25;


// initMap() will load this with some basemaps "terrain" and "photo"
// using these global references you can toggle the visible basemap via selectBasemap() or using your own programming style
// THE ONES SUPPLIED AS DEMOS IN initMap() ARE GREENINFO NETWORK'S MAPBOX ACCOUNT
// PLEASE USE YOUR OWN Mapbox layers if you use them; Mapbox is not free!
var BASEMAPS = {};

// what folder should this application use, to store offline tiles?
// passed as tge 'folder' parameter to L.TileLayer.Cordova
var OFFLINE_TILE_FOLDER = "MobileMapStarter";

// a Marker indicating our last-known geolocation, and a Circle indicating accuracy
// Our present latlng can be had from LOCATION..getLatLng(), a useful thing for doing distance calculations
var LOCATION_ICON = L.icon({
    iconUrl: 'img/marker-gps3.png',
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [13, 41], // point of the icon which will correspond to marker's location
    popupAnchor:  [13, 1] // point from which the popup should open relative to the iconAnchor
});
var LOCATION  = new L.Marker(new L.LatLng(DEFAULT_LAT,DEFAULT_LNG), { clickable:false, draggable:false, icon:LOCATION_ICON });
var ACCURACY  = new L.Circle(new L.LatLng(DEFAULT_LAT,DEFAULT_LNG), 1);

// should we automatically recenter the map when our location changes?
// You can set this flag anywhere, but if there's also a checkbox toggle (there is) then also update it or else you'll confuse the user with a checkbox that's wrong
var AUTO_RECENTER = true;

/***************************************************************************************************/

/*
 * Orientation change event handler
 * Detect whether the #map_canvas is showing, and if so trigger a resize
 * Leaflet needs this so it can correct its display, e.g. when changing pages within the app
 */



/*
 * The master init() function, called on deviceready
 * It's suggested that all other init be started from here
 * 
 * Pre-render the page divs (lazy loading doesn't help much here)
 * Start the caching system and then the Leaflet map
 * Then onward to other setup and handlers,. e.g. checkboxe,s geocoder text boxes, ...
 */
function init() {
	
    // pre-render the pages so we don't have that damnable lazy rendering thing messing with it
    $('div[data-role="page"]').page(); //DESCOMENTAR PER ORIGIANL
    
    // our startup, in phases so it's easier to keep track
    initMap();
    initSettings();
    initGeocoder();
    initData();
	
    // pick the basemap, center on a default location, and begin watching location
    selectBasemap('terrain');
	//selectBasemap2('terrain');
	
    MAP.setView(LOCATION.getLatLng(),DEFAULT_ZOOM);
    MAP.on('locationfound', onLocationFound);
    MAP.locate({ enableHighAccuracy:true, watch:true });
	
	MAP_FORM.setView(LOCATION.getLatLng(),DEFAULT_ZOOM);
    MAP_FORM.on('locationfound', onLocationFound);
    MAP_FORM.locate({ enableHighAccuracy:true, watch:true });


	
}

function initMap() {
	
    // load the Tilelayers
	BASEMAPS['terrain'] = L.tileLayer("http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", {
        subdomains:['a','b','c','d'],
        maxZoom: 25,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        // now the Cordova-specific options
        folder: OFFLINE_TILE_FOLDER,
        name:'Terrain'
    });

    BASEMAPS['photo'] = L.tileLayer("http://{s}.tiles.mapbox.com/v3/greeninfo.map-zudfckcw/{z}/{x}/{y}.jpg", {
        subdomains:['a','b','c','d'],
        maxZoom: 25,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                     'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        // now the Cordova-specific options
        folder: OFFLINE_TILE_FOLDER,
        name:'Photo'
    });
	
	// load the map
    MAP = new L.Map('map_canvas', {
        attributionControl: true,
        zoomControl: false,
        dragging: true,
        closePopupOnClick: true,
        crs: L.CRS.EPSG3857,
		detectRetina: true,
		layers: [],
        minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM
    });
	
	// create 3 new layers fot data
	IP_TV = new L.MarkerClusterGroup({
		spiderfyOnMaxZoom: true,
		showCoverageOnHover: true,
		zoomToBoundsOnClick: true,
		animate:true,
	}).addTo(MAP);
	

    // add the location marker and accuracy circle
    MAP.addLayer(ACCURACY).addLayer(LOCATION);
	
	
    // move the geocoder and Settings button to inside the map_canvas, as it's more responsive to size changes that way
    //$('.leaflet-control-settings').appendTo( $('#map_canvas') );
    //$('#geocoder').appendTo( $('#map_canvas') );

	//MAP FORM
	// load the map
    MAP_FORM = new L.Map('map_form', {
        attributionControl: true,
        zoomControl: true,
        dragging: true,
        closePopupOnClick: true,
        crs: L.CRS.EPSG3857,
		minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM
    });
	
	L.tileLayer("http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(MAP_FORM);
	
	
	// add tilelayer
	var marker;
	MAP_FORM.on('click', function(e) {
		
		if(MAP_FORM.hasLayer(marker)){
			MAP_FORM.removeLayer(marker);
		}
		var TVIcon = L.icon({
			iconUrl: 'img/marker-gps3.png',
			iconSize: [20, 30],
			iconAnchor: [8, 25],
			popupAnchor: [0, 0]
			});
		var lat = e.latlng.lat
		var lng = e.latlng.lng
		var myElement = document.getElementById("Latitud").value=lat;
		var myElement = document.getElementById("Longitud").value=lng;
		marker = new L.marker(e.latlng,{icon: TVIcon});
		MAP_FORM.addLayer(marker);
		
		
		MAP_FORM.setView([lat,lng],15);
		
	});
}

function mapDataIPTV(f) {	
	var TVIcon = L.icon({
	iconUrl: 'img/logo-IPTV2.png',
	iconSize: [25, 25],
	iconAnchor: [10, 10],
	popupAnchor: [0, 0]
	});
		
	var layerTVLocal = L.geoJson(f, {
		pointToLayer: function (feature, latlng) {
		return L.marker(latlng, {icon: TVIcon});
	    }, onEachFeature: onEachFeature
		}).addTo(IP_TV);	
};




			
function onEachFeature(feature, layer) {
	var popupContent = "<h3>"+feature.properties.title+"</h3></p>";
	var customOptions =
		{
		'className' : 'popupCustom'
		};
	if (feature.properties && feature.properties.description) {
		popupContent += feature.properties.description;
	}
	layer.bindPopup(popupContent,customOptions);

};

function initSettings() {
    // enable the basemap picker in the Settings page
    // AND check the currently-selected one
    $('input[type="radio"][name="basemap"]').change(function () {
        var layername = $(this).val();
        $.mobile.changePage('#page-map');
        selectBasemap(layername);
    });
    
    // enable the various "features" checkboxes
    $('input[type="checkbox"][name="features"][value="gps"]').change(function () {
        var show = $(this).is(':checked');
        if (show) {
            MAP.addLayer(ACCURACY);
            MAP.addLayer(LOCATION);
        } else {
            MAP.removeLayer(ACCURACY);
            MAP.removeLayer(LOCATION);
        }
        $.mobile.changePage('#page-map')
    });
    $('input[type="checkbox"][name="features"][value="autocenter"]').change(function () {
        AUTO_RECENTER = $(this).is(':checked');
        $.mobile.changePage('#page-map')
    });
}

function initData(){


	var data_IPTV = '1scC17IE0nbBGIihkBBSD9IPv2AJE-hec9s7-9d8gH34';
	
	mmg_google_docs_spreadsheet_IPTV(data_IPTV, mapDataIPTV);
}

function initGeocoder(){
    $('#geocoder_button').click(function () {
        var address = $('#geocoder_text').val();
        if (! address) return;
        geocodeAndZoom(address);
    });
    $('#geocoder_text').keydown(function (key) {
        if(key.keyCode == 13) $('#geocoder_button').click();
    });
}

/*
 * This is mostly a callback for the [name="basemap"] radioboxes,
 * but can also be called programatically to set the base layer at any time
 */
function selectBasemap(which){
    for (var i in BASEMAPS) MAP.removeLayer(BASEMAPS[i]);
    MAP.addLayer(BASEMAPS[which],true);
}
function selectBasemap2(which){
    for (var i in BASEMAPS) MAP_FORM.removeLayer(BASEMAPS[i]);
    MAP_FORM.addLayer(BASEMAPS[which],true);
}
/*
 * Wrapper functions to set the basemaps to online and offline mode
 * See also L.TileLayer.Cordova documentation
 */
function switchBasemapsToOffline() {
    for (var i in BASEMAPS) BASEMAPS[i].goOffline(layername);
}
function switchBasemapsToOnline() {
    for (var i in BASEMAPS) BASEMAPS[i].goOnline(layername);
}

/*
 * Whenever the user's location changes, this is called. It updates the LOCATION and ACCURACY layers (a Marker and a Circle).
 */
function onLocationFound(event) {
    // Update our location and accuracy
    // Even if we don't auto-pan nor display the marker, we may need LOCATION updated for future distance-to-point calculations.
    LOCATION.setLatLng(event.latlng);
    ACCURACY.setLatLng(event.latlng);
    ACCURACY.setRadius(event.accuracy);

    // center the map
    if (AUTO_RECENTER) MAP.panTo(LOCATION.getLatLng());
	if (AUTO_RECENTER) MAP_FORM.panTo(LOCATION.getLatLng());
}

