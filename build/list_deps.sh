#!/bin/bash

PATH_TO_BUILDER="../../closure-library/closure/bin/build/closurebuilder.py"
PATH_TO_CLOSURE_LIBRARY="../../closure-library"
PATH_TO_SOURCES="../source"

$PATH_TO_BUILDER \
--input ../source/animation.js \
--input ../source/assets.js \
--input ../source/components.js \
--input ../source/core.js \
--input ../source/events.js \
--input ../source/graphics.js \
--input ../source/input.js \
--input ../source/layers.js \
--root=$PATH_TO_CLOSURE_LIBRARY \
--root=$PATH_TO_SOURCES \
--output_mode=list

