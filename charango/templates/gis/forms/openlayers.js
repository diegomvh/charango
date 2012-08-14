if (!window.gis) { gis = {}, gis.config = []; }
gis.config.push({
    "id": "{{ id }}",
    "srid": "{{ srid }}",
    "field_name": "{{ field_name }}",
    "map": null, 
    "controls": null,
    "panel": null,
    "layers": {},
    "modifiable": {{ modifiable|yesno:"true,false" }},
    "is_collection": {{ is_collection|yesno:"true,false" }},
    "collection_type": '{{ collection_type }}',
    "is_linestring": {{ is_linestring|yesno:"true,false" }},
    "is_polygon": {{ is_polygon|yesno:"true,false" }},
    "is_point": {{ is_point|yesno:"true,false" }},
    "point_zoom": {{ point_zoom }},
    "default_lon": {{ default_lon }},
    "default_lat": {{ default_lat }},
    "default_zoom": {{ default_zoom }},
    "options": {
    {% autoescape off %}{% for item in map_options.items %}      '{{ item.0 }}' : {{ item.1 }}{% if not forloop.last %},{% endif %}
    {% endfor %}{% endautoescape %}    },
    "wms_name": "{{ wms_name }}",
    "wms_url": "{{ wms_url }}",
    "params": {layers: "{{ wms_layer }}"},
    //Controls
    "mouse_position": {{ mouse_position|yesno:"true,false" }},
    "scale_text": {{ scale_text|yesno:"true,false" }},
    "layerswitcher": {{ layerswitcher|yesno:"true,false" }},
    "scrollable": {{ scrollable|yesno:"true,false" }},
});