if (!window.gis) { window.gis = {}, window.gis.config = []; }
{% block vars %}
var {{ module }} = {
    "id": "{{ id }}",
    "srid": "{{ srid }}",
    "field_name": "{{ field_name }}"
};
{{ module }}.map = null; {{ module }}.controls = null; {{ module }}.panel = null; {{ module }}.layers = {};
{{ module }}.modifiable = {{ modifiable|yesno:"true,false" }};
{{ module }}.is_collection = {{ is_collection|yesno:"true,false" }};
{{ module }}.collection_type = '{{ collection_type }}';
{{ module }}.is_linestring = {{ is_linestring|yesno:"true,false" }};
{{ module }}.is_polygon = {{ is_polygon|yesno:"true,false" }};
{{ module }}.is_point = {{ is_point|yesno:"true,false" }};
{{ module }}.options = {
{% autoescape off %}{% for item in map_options.items %}      '{{ item.0 }}' : {{ item.1 }}{% if not forloop.last %},{% endif %}
{% endfor %}{% endautoescape %}    };
//Controls
{{ module }}.mouse_position = {{ mouse_position|yesno:"true,false" }};
{{ module }}.scale_text = {{ scale_text|yesno:"true,false" }};
{{ module }}.layerswitcher = {{ layerswitcher|yesno:"true,false" }};
{{ module }}.scrollable = {{ scrollable|yesno:"true,false" }};
window.gis.config.push({{ module }});