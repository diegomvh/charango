$(function() {
    if (!window.gis)
        window.gis = {"fields": []};
    //Cargar open layers http://openlayers.org/api/2.11/OpenLayers.js
    //Cargar google v3
    OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:3857", OpenLayers.Layer.SphericalMercator.projectForward);
    
    gis.wkt_f = new OpenLayers.Format.WKT();
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
    
    $(gis.fields).each(function(field) {
        field.init();
    });
})