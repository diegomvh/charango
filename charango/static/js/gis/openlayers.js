$(function() {
    if (!window.gis) { window.gis = {}, window.gis.config = []; }
    
    /* GisField class */
    var GisField = function(config) {
        $.extend(this, config);
        // The admin map for this geometry field.
        this.map = new OpenLayers.Map(this.id + '_map', this.options);
        // Base Layer
        this.layers.base = new OpenLayers.Layer.WMS( "{{ wms_name }}", "{{ wms_url }}", {layers: '{{ wms_layer }}'} );
        this.map.addLayer(this.layers.base);
        if (this.is_linestring)
            OpenLayers.Feature.Vector.style["default"]["strokeWidth"] = 3; // Default too thin for linestrings.
        this.layers.vector = new OpenLayers.Layer.Vector(this.field_name);
        this.map.addLayer(this.layers.vector);
        // Read WKT from the text field.
        var wkt = document.getElementById(this.id).value;
        if (wkt){
            // After reading into geometry, immediately write back to
            // WKT <textarea> as EWKT (so that SRID is included).
            var admin_geom = gis.read_wkt(wkt);
            this.write_wkt(admin_geom);
            if (this.is_collection){
                // If geometry collection, add each component individually so they may be
                // edited individually.
                for (var i = 0; i < this.num_geom; i++){
                    this.layers.vector.addFeatures([new OpenLayers.Feature.Vector(admin_geom.geometry.components[i].clone())]);
                }
            } else {
	       this.layers.vector.addFeatures([admin_geom]);
            }
            // Zooming to the bounds.
            this.map.zoomToExtent(admin_geom.geometry.getBounds());
            if (this.is_point){
                this.map.zoomTo({{ point_zoom }});
            }
        } else {
                this.map.setCenter(new OpenLayers.LonLat({{ default_lon }}, {{ default_lat }}), {{ default_zoom }});
        }
        // This allows editing of the geographic fields -- the modified WKT is
        // written back to the content field (as EWKT, so that the ORM will know
        // to transform back to original SRID).
        this.layers.vector.events.on({"featuremodified" : this.modify_wkt});
        this.layers.vector.events.on({"featureadded" : this.add_wkt});
        
        // Map controls:
        // Add geometry specific panel of toolbar controls
        this.getControls(this.layers.vector);
        this.panel.addControls(this.controls);
        this.map.addControl(this.panel);
        this.addSelectControl();
        // Then add optional visual controls
        if (this.mouse_position)
            this.map.addControl(new OpenLayers.Control.MousePosition());
        if (this.scale_text)
            this.map.addControl(new OpenLayers.Control.Scale());
        if (this.layerswitcher)
            this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        // Then add optional behavior controls
        if (!this.scrollable)
            this.map.getControlsByClass('OpenLayers.Control.Navigation')[0].disableZoomWheel();
        if (wkt){
            if (this.modifiable) { this.enableEditing(); }
        } else { this.enableDrawing(); }
    }

    GisField.prototype.add_wkt = function(event) {
        // This function will sync the contents of the `vector` layer with the
        // WKT in the text field.
        if (this.is_collection){
            var feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry[this.geom_type]());
            for (var i = 0; i < this.layers.vector.features.length; i++) {
                feat.geometry.addComponents([this.layers.vector.features[i].geometry]);
            }
            gis.write_wkt(this, feat);
        } else {
            // Make sure to remove any previously added features.
            if (this.layers.vector.features.length > 1) {
                old_feats = [this.layers.vector.features[0]];
                this.layers.vector.removeFeatures(old_feats);
                this.layers.vector.destroyFeatures(old_feats);
            }
            gis.write_wkt(this, event.feature);
        }
    };
    
    GisField.prototype.modify_wkt = function(event) {
        if (this.is_collection){
            if (this.is_point){
              this.add_wkt(event);
              return;
            } else {
              // When modifying the selected components are added to the
              // vector layer so we only increment to the `num_geom` value.
              var feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry[this.geom_type]());
              for (var i = 0; i < this..num_geom; i++){
        	feat.geometry.addComponents([this.layers.vector.features[i].geometry]);
              }
              this.write_wkt(feat);
            }
          } else {
            this.write_wkt(event.feature);
          }
    };
    
    // Function to clear vector features and purge wkt from div
    GisField.prototype.deleteFeatures = function() {
        this.layers.vector.removeFeatures(this.layers.vector.features);
        this.layers.vector.destroyFeatures();
    };
    GisField.prototype.clearFeature = function() {
        this.deleteFeatures();
        document.getElementById(this.id).value = '';
        this.map.setCenter(new OpenLayers.LonLat(this.default_lon, this.default_lat), this.default_zoom);
    };
    
    // Add Select control
    GisField.prototype.addSelectControl = function() {
        var select = new OpenLayers.Control.SelectFeature(this.layers.vector, {'toggle' : true, 'clickout' : true});
        this.map.addControl(select);
        select.activate();
    };
    GisField.prototype.enableDrawing = function() {
        this.map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].activate();
    };
    GisField.prototype.enableEditing = function() {
        this.map.getControlsByClass('OpenLayers.Control.ModifyFeature')[0].activate();
    };
    
    // Create an array of controls based on geometry type
    GisField.prototype.getControls = function(lyr) {
        this.panel = new OpenLayers.Control.Panel({'displayClass': 'olControlEditingToolbar'});
        var nav = new OpenLayers.Control.Navigation();
        var draw_ctl;
        if (this.is_linestring) {
            draw_ctl = new OpenLayers.Control.DrawFeature(lyr, OpenLayers.Handler.Path, {'displayClass': 'olControlDrawFeaturePath'});
        } else if (this.is_polygon){
            draw_ctl = new OpenLayers.Control.DrawFeature(lyr, OpenLayers.Handler.Polygon, {'displayClass': 'olControlDrawFeaturePolygon'});
        } else if (this.is_point){
            draw_ctl = new OpenLayers.Control.DrawFeature(lyr, OpenLayers.Handler.Point, {'displayClass': 'olControlDrawFeaturePoint'});
        }
        if (this.modifiable){
            var mod = new OpenLayers.Control.ModifyFeature(lyr, {'displayClass': 'olControlModifyFeature'});
            this.controls = [nav, draw_ctl, mod];
        } else {
            if(!lyr.features.length){
                this.controls = [nav, draw_ctl];
            } else {
                this.controls = [nav];
            }
        }
    };
    
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
    
    gis.fields = [];
    $(gis.config).each(function(index, config) {
        var field = new GisField(config);
        field.map.addLayers([
            new OpenLayers.Layer.Google("Google Streets"),
            new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID}),
            new OpenLayers.Layer.Google("Google Satellite",{type: google.maps.MapTypeId.SATELLITE}),
            new OpenLayers.Layer.Google("Google Physical",{type: google.maps.MapTypeId.TERRAIN}),
        ]);
        gis.fields.append(field);
    });
})