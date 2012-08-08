$(function() {
    if (!window.gis)
        window.gis = {"fields": []};
        
    gis.wkt_f = new OpenLayers.Format.WKT();
    gis.re = new RegExp("^SRID=\\d+;(.+)", "i");
    
    gis.get_ewkt = function(srid, feat) {
        return 'SRID=' + srid + this.wkt_f.write(feat);
    }
    gis.read_wkt = function(wkt) {
        var match = this.re.exec(wkt);
        if (match){wkt = match[1];}
        return this.wkt_f.read(wkt);
    }
    gis.write_wkt = function(field, feat) {
      if (field.is_collection){ field.num_geom = feat.geometry.components.length;}
      else { field.num_geom = 1;}
      document.getElementById(field.id).value = this.get_ewkt(field.srid, feat);
    }
    
    $(gis.fields).each(function(index, field) {
        field.init();
        field.map.addLayers([
            new OpenLayers.Layer.Google("Google Streets"),
            new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID}),
            new OpenLayers.Layer.Google("Google Satellite",{type: google.maps.MapTypeId.SATELLITE}),
            new OpenLayers.Layer.Google("Google Physical",{type: google.maps.MapTypeId.TERRAIN}),
        ]);
    });
})