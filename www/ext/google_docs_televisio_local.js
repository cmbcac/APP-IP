function mmg_google_docs_spreadsheet_televisio_local(id, callback) {
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
					'type':"Televisió_Local",
                    'title': entry['gsx$indiqueuelmunicipidesdonompliuelformulari'].$t,
                    'description': '<b>Canal Blau:</b> ' + entry['gsx$canalblau'].$t + 
									'<br/><b>Penedès TV:</b> ' + entry['gsx$penedèstv'].$t +
									'<br/><b>Mola TV:</b> ' + entry['gsx$molatv'].$t +
									'<br/><b>TV El Vendrel/3 de 8 TV:</b> ' + entry['gsx$tvelvendrel3de8tv'].$t + 
									'<br/><b>Canal Taronja: </b>' + entry['gsx$canaltaronja'].$t +
									'<br/><b>Televisió de Berguedà:</b> ' + entry['gsx$televisiódeberguedà'].$t +
									'<br/><b>El Punt Avui TV: </b>' + entry['gsx$elpuntavuitv'].$t +
									'<br/><b>TAC 12:</b> ' + entry['gsx$tac12'].$t +
									'<br/><b>Barcelona Televisió (BTV):</b> ' + entry['gsx$barcelonatelevisióbtv'].$t +
									'<br/><b>TV Hospitalet:</b> ' + entry['gsx$tvlhospitalet'].$t +
									'<br/><b>Televisió de Badalona (Teleb) :</b> ' + entry['gsx$televisiódebadalonateleb'].$t +
									'<br/><b>25 TV:</b> ' + entry['gsx$tv'].$t +
									'<br/><b>M1 TV:</b> ' + entry['gsx$m1tv'].$t +
									'<br/><b>Maresme TV:</b> ' + entry['gsx$maresmetv'].$t +
									'<br/><b>El 9 TV:</b> ' + entry['gsx$el9tv'].$t +
									'<br/><b>Canal Terrassa Vallès:</b> ' + entry['gsx$canalterrassavallès'].$t +
									'<br/><b>TVSC Vallès 1:</b> ' + entry['gsx$tvscvallès1'].$t +
									'<br/><b>Vallès Oriental TV:</b> ' + entry['gsx$vallèsorientaltv'].$t +
									'<br/><b>Vallès Visió:</b> ' + entry['gsx$vallèsvisió'].$t +
									'<br/><b>Canal 10 Empordà:</b> ' + entry['gsx$canal10empordà'].$t +
									'<br/><b>Emporà Televisió:</b> ' + entry['gsx$empordàtelevisió'].$t +
									'<br/><b>Televisió Costa Brava:</b> ' + entry['gsx$televisiócostabrava'].$t +
									'<br/><b>Tot TV:</b> ' + entry['gsx$tottv'].$t +
									'<br/><b>Prineus TV:</b> ' + entry['gsx$pirineustv'].$t +
									'<br/><b>Andorra TV:</b> ' + entry['gsx$andorratv'].$t +
									'<br/><b>Televisió del Ripollès:</b> ' + entry['gsx$televisiódelripollès'].$t +
									'<br/><b>Olot Televisió:</b> ' + entry['gsx$olottelevisió'].$t +
									'<br/><b>Televisió de Girona:</b> ' + entry['gsx$televisiódegirona'].$t +
									'<br/><b>Banyoles Televisió:</b> ' + entry['gsx$banyolestelevisió'].$t +
									'<br/><b>Lleida TV:</b> ' + entry['gsx$lleidatv'].$t +
									'<br/><b>Canal Reus TV:</b> ' + entry['gsx$canalreustv'].$t +
									'<br/><b>Canal 21 Ebre:</b> ' + entry['gsx$canal21ebre'].$t +
									'<br/><b>Canal TE: </b>' + entry['gsx$canalte'].$t +
									'<br/><b>Observacions:</b> ' + entry['gsx$observacions'].$t,
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
                if(feature.properties['type']=="Televisió_Local"){ feature.properties['marker-color']='#f4c700'} 
                   
            });
        }
        return callback(features);
    }
}


