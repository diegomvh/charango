#!/src/bin/env python
# -*- coding: utf-8 -*-

import re

from compressor.conf import settings
from compressor.base import Compressor, SOURCE_HUNK, SOURCE_FILE
from compressor.js import JsCompressor

class JsExternalCompressor(JsCompressor):

    def __init__(self, content=None, output_prefix="js", context=None):
        super(JsExternalCompressor, self).__init__(content, output_prefix, context)
        self.external = []
        self.epattern = re.compile(r'^https?://.*$')
        
    def split_contents(self):
        if self.split_content:
            return self.split_content
        for elem in self.parser.js_elems():
            attribs = self.parser.elem_attribs(elem)
            if 'src' in attribs:
                if self.epattern.match(attribs['src']):
                    self.external.append(elem)
                else:
                    basename = self.get_basename(attribs['src'])
                    filename = self.get_filename(basename)
                    content = (SOURCE_FILE, filename, basename, elem)
                    self.split_content.append(content)
            else:
                content = self.parser.elem_content(elem)
                self.split_content.append((SOURCE_HUNK, content, None, elem))
        return self.split_content
        
    def output(self, mode='file', forced=False):
        print self.external  
        output = super(JsExternalCompressor, self).output(mode, forced)
        return output