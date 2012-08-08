$(function() {
    if (!window.gis)
        window.gis = {"fields": []};
        
    //Hacer esta carga condicional y dependiente de las urls que quiera usar
    Modernizr.load([{
        load: 'http://openlayers.org/api/2.11/OpenLayers.js',
        complete: function () {
            OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:3857", OpenLayers.Layer.SphericalMercator.projectForward);
            gis.wkt_f = new OpenLayers.Format.WKT();
            
            $(gis.fields).each(function(index, field) {
                field.init();
            });
        },
    },
    {
        load: 'http://maps.google.com/maps/api/js?sensor=false',
        complete: function () {
            
            google.maps.Load(function() {
                $(gis.fields).each(function(index, field) {
                    field.map.addLayers([
                        new OpenLayers.Layer.Google("Google Streets"),
                        new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID}),
                        new OpenLayers.Layer.Google("Google Satellite",{type: google.maps.MapTypeId.SATELLITE}),
                        new OpenLayers.Layer.Google("Google Physical",{type: google.maps.MapTypeId.TERRAIN}),
                    ]);
                });
    
                gis.geocoder = new google.maps.Geocoder();
            });
        },
    }]);
    
    //Cargar open layers http://openlayers.org/api/2.11/OpenLayers.js
    //Cargar google v3
    
    gis.re = new RegExp("^SRID=\\d+;(.+)", "i");
    
    gis.get_ewkt = function(srid, feat) {
        return 'SRID=' + srid + this.wkt_f.write(feat);
    }
    gis.read_wkt = function(wkt) {
        // OpenLayers cannot handle EWKT -- we make sure to strip it out.
        // EWKT is only exposed to OL if there's a validation error in the admin.
        var match = this.re.exec(wkt);
        if (match){wkt = match[1];}
        return this.wkt_f.read(wkt);
    }
    gis.write_wkt = function(field, feat) {
      if (field.is_collection){ field.num_geom = feat.geometry.components.length;}
      else { field.num_geom = 1;}
      document.getElementById(field.id).value = this.get_ewkt(field.srid, feat);
    }
})