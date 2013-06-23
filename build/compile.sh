#!/bin/bash

PATH_TO_BUILDER="../../closure-library/closure/bin/build/closurebuilder.py"
PATH_TO_COMPILER="/usr/local/share/closure-compiler/compiler.jar"
PATH_TO_CLOSURE_LIBRARY="../../closure-library"
PATH_TO_SOURCES="../source"
OUTPUT_FILE="../pike-0.1.min.js"

java -jar $PATH_TO_COMPILER \
--js ../../closure-library/closure/goog/base.js \
--js ../source/animation.js \
--js ../../closure-library/closure/goog/disposable/disposable.js \
--js ../../closure-library/closure/goog/disposable/idisposable.js \
--js ../../closure-library/closure/goog/events/event.js \
--js ../../closure-library/closure/goog/debug/error.js \
--js ../../closure-library/closure/goog/string/string.js \
--js ../../closure-library/closure/goog/asserts/asserts.js \
--js ../../closure-library/closure/goog/events/listenable.js \
--js ../../closure-library/closure/goog/events/listener.js \
--js ../../closure-library/closure/goog/object/object.js \
--js ../../closure-library/closure/goog/useragent/useragent.js \
--js ../../closure-library/closure/goog/events/browserfeature.js \
--js ../../closure-library/closure/goog/array/array.js \
--js ../../closure-library/closure/goog/debug/entrypointregistry.js \
--js ../../closure-library/closure/goog/events/eventtype.js \
--js ../../closure-library/closure/goog/reflect/reflect.js \
--js ../../closure-library/closure/goog/events/browserevent.js \
--js ../../closure-library/closure/goog/events/events.js \
--js ../../closure-library/closure/goog/events/eventtarget.js \
--js ../source/events.js \
--js ../source/graphics.js \
--js ../source/core.js \
--js ../source/input.js \
--js ../../closure-library/closure/goog/events/eventhandler.js \
--js ../source/layers.js \
--js ../source/components.js \
--js ../source/assets.js \
--compilation_level SIMPLE_OPTIMIZATIONS \
--warning_level VERBOSE \
--formatting=PRETTY_PRINT \
--formatting=PRINT_INPUT_DELIMITER \
--js_output_file $OUTPUT_FILE

#$PATH_TO_BUILDER \
#--input ../source/animation.js \
#--input ../source/assets.js \
#--input ../source/components.js \
#--input ../source/core.js \
#--input ../source/events.js \
#--input ../source/graphics.js \
#--input ../source/input.js \
#--input ../source/layers.js \
#--root=$PATH_TO_CLOSURE_LIBRARY \
#--root=$PATH_TO_SOURCES \
#--output_mode=compiled \
#--compiler_jar=$PATH_TO_COMPILER
#> $OUTPUT_FILE
