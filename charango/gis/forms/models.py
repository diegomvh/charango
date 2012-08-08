#!/SRr/bin/env python
# -*- coding: utf-8 -*-

from django.contrib.gis.admin.widgets import OpenLayersWidget
from django.contrib.gis.gdal import OGRGeomType

"""
class AddressForm(ModelForm):
    class Meta:
        model = Address
        fields = ('stret', 'city', 'point')
        widgets = {
            'point': get_map_widget(Address.point)
        }
"""

def get_map_widget(db_field):
    """
    Returns a subclass of the OpenLayersWidget (or whatever was specified
    in the `widget` attribute) using the settings from the attributes set in this class.
    """
    is_collection = db_field.geom_type in ('MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION')
    if is_collection:
        if db_field.geom_type == 'GEOMETRYCOLLECTION': collection_type = 'Any'
        else: collection_type = OGRGeomType(db_field.geom_type.replace('MULTI', ''))
    else:
        collection_type = 'None'

    num_zoom = 18
    class OLMap(OpenLayersWidget):
        class Media:
            js = ( "js/gis/openlayers.js", )
        template = 'gis/forms/openlayers.html'
        geom_type = db_field.geom_type
        params = {'default_lon' : 0,
                  'default_lat' : 0,
                  'default_zoom' : 4,
                  'display_wkt' : False,
                  'geom_type' : OGRGeomType(db_field.geom_type),
                  'field_name' : db_field.name,
                  'is_collection' : is_collection,
                  'scrollable' : True,
                  'layerswitcher' : True,
                  'collection_type' : collection_type,
                  'is_linestring' : db_field.geom_type in ('LINESTRING', 'MULTILINESTRING'),
                  'is_polygon' : db_field.geom_type in ('POLYGON', 'MULTIPOLYGON'),
                  'is_point' : db_field.geom_type in ('POINT', 'MULTIPOINT'),
                  'num_zoom' : num_zoom,
                  'max_zoom' : False,
                  'min_zoom' : False,
                  'units' : False, #likely shoud get from object
                  'max_resolution' : False,
                  'max_extent' : False,
                  'modifiable' : True,
                  'mouse_position' : True,
                  'scale_text' : True,
                  'map_width' : 600,
                  'map_height' : 400,
                  'point_zoom' : num_zoom - 6,
                  'srid' : 4326,
                  'display_srid' : False,
                  'wms_url' : 'http://vmap0.tiles.osgeo.org/wms/vmap0',
                  'wms_layer' : 'basic',
                  'wms_name' : 'OpenLayers WMS',
                  'debug' : False,
                  }
    return OLMap