function mmg_google_docs_spreadsheet_IPTV(id, callback) {
    if (typeof reqwest === 'undefined'){
        throw 'CSV: reqwest required for mmg_csv_url';
    }
    
    var url = 'https://spreadsheets.google.com/feeds/list/' +
        id + '/1/public/values?alt=json-in-script&callback=callback';
    reqwest({
        url: url,
        type: 'jsonp',
        jsonpCallback: 'callback',
        success: response,
        error: response
    }); 

    function response(x) {
        var features = [],
            latfield = '',
            lonfield = '';
        if (!x || !x.feed){
			
			return features;
		}
		
        for (var f in x.feed.entry[0]) {
            if (f.match(/\$Lat/i)){
                latfield = f;           
            }
            if (f.match(/\$Lon/i)){
                lonfield = f;              
            }
        }
		
        for (var i = 0; i < x.feed.entry.length; i++) {                             
            var entry = x.feed.entry[i];
			var feature = {
				type: 'Feature',
				properties: {
                    'marker-color':'#fff',
					'type':"IPTV",
                    'title':  entry['gsx$entitat'].$t,
                    'description': '<b><font size="2">Entitat: </font></b> '+'<font size="2">' + entry['gsx$entitat'].$t + '</font>'+
								'<br/><b><font size="2">Tipus entitat: </font></b> '+'<font size="2">' + entry['gsx$tipusentitat'].$t + '</font>'+
								'<br/><b><font size="2">Nom comercial: </font></b> '+'<font size="2">' + entry['gsx$nomcomercial'].$t +'</font>'+
								'<br/><b><font size="2">URL: </font></b> '+'<font size="2">' + '<a href="#" onclick="window.open('+'&#39'+ entry['gsx$url'].$t +'&#39,&#39_system&#39,&#39location=yes&#39'+'); return false;">'+ entry['gsx$url'].$t +'</a>' +'</font>'+
								'<br/><b><font size="2">Programació: </font></b> '+'<font size="2">' + entry['gsx$programació'].$t + '</font>'+
								'<br/><b><font size="2">Canal TDT: </font></b> '+'<font size="2">' + entry['gsx$canaltdt'].$t + '</font>'+
								'<br/><b><font size="2">Xarxa: </font></b> '+'<font size="2">' + entry['gsx$xarxa'].$t +'</font>'+
								'<br/><b><font size="2">Youtube: </font></b> '+'<font size="2">' + entry['gsx$youtube'].$t +'</font>'+
								'<br/><b><font size="2">Població: </font></b> '+'<font size="2">' + entry['gsx$població'].$t +'</font>'+
								'<br/><b><font size="2">Observacions: </font></b> '+'<font size="2">' + entry['gsx$observacions'].$t +'</font>',
                    'date':  entry['gsx$marcatemporal'].$t,
                    //'hour': 'Hora: ' + entry['gsx$horadelincidente'].$t,
                    //'marcatemporal':entry['gsx$marcatemporal'].$t      
                },
                geometry: {
                    type: 'Point',
                    coordinates: []
                }
                
            };
			
            for (var y in entry) {
                if (y === latfield) feature.geometry.coordinates[1] = parseFloat(entry[y].$t);
                else if (y === lonfield) feature.geometry.coordinates[0] = parseFloat(entry[y].$t);
                else if (y.indexOf('gsx$') === 0) {                            
                    feature.properties[y.replace('gsx$', '')] = entry[y].$t;
                }
            }
            
            if (feature.geometry.coordinates.length == 2) features.push(feature);
			
            _.each(feature, function(value, key) {
                if(feature.properties['type']=="IPTV"){ feature.properties['marker-color']='#f4c700'} 
                   
            });
        }
        return callback(features);
    }
}


