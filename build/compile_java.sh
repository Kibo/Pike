#!/bin/bash

VERSION="0.4"
PATH_TO_BUILDER="../../closure-library/closure/bin/build/closurebuilder.py"
PATH_TO_COMPILER="/usr/local/share/closure-compiler/compiler.jar"
PATH_TO_CLOSURE_LIBRARY="../../closure-library"
PATH_TO_SOURCES="../source"
OUTPUT_FILE="../pike"

java -jar $PATH_TO_COMPILER \
--js ../../closure-library/closure/goog/base.js \
--js ../source/animation.js \
--js ../../closure-library/closure/goog/disposable/idisposable.js \
--js ../../closure-library/closure/goog/disposable/disposable.js \
--js ../../closure-library/closure/goog/events/event.js \
--js ../../closure-library/closure/goog/events/listenable.js \
--js ../../closure-library/closure/goog/events/listener.js \
--js ../../closure-library/closure/goog/debug/errorhandlerweakdep.js \
--js ../../closure-library/closure/goog/string/string.js \
--js ../../closure-library/closure/goog/useragent/useragent.js \
--js ../../closure-library/closure/goog/object/object.js \
--js ../../closure-library/closure/goog/events/browserfeature.js \
--js ../../closure-library/closure/goog/debug/error.js \
--js ../../closure-library/closure/goog/asserts/asserts.js \
--js ../../closure-library/closure/goog/array/array.js \
--js ../../closure-library/closure/goog/debug/entrypointregistry.js \
--js ../../closure-library/closure/goog/events/eventwrapper.js \
--js ../../closure-library/closure/goog/events/eventtype.js \
--js ../../closure-library/closure/goog/reflect/reflect.js \
--js ../../closure-library/closure/goog/events/browserevent.js \
--js ../../closure-library/closure/goog/events/events.js \
--js ../../closure-library/closure/goog/events/eventtarget.js \
--js ../source/events.js \
--js ../../closure-library/closure/goog/math/math.js \
--js ../../closure-library/closure/goog/math/coordinate.js \
--js ../../closure-library/closure/goog/math/box.js \
--js ../../closure-library/closure/goog/math/size.js \
--js ../../closure-library/closure/goog/math/rect.js \
--js ../../closure-library/closure/goog/dom/vendor.js \
--js ../../closure-library/closure/goog/dom/classes.js \
--js ../../closure-library/closure/goog/dom/tagname.js \
--js ../../closure-library/closure/goog/dom/browserfeature.js \
--js ../../closure-library/closure/goog/dom/dom.js \
--js ../../closure-library/closure/goog/style/style.js \
--js ../source/graphics.js \
--js ../source/input.js \
--js ../source/ai.js \
--js ../source/core.js \
--js ../../closure-library/closure/goog/events/eventhandler.js \
--js ../source/layers.js \
--js ../source/components.js \
--js ../source/assets.js \
--compilation_level WHITESPACE_ONLY \
--warning_level VERBOSE \
--formatting=PRETTY_PRINT \
--formatting=PRINT_INPUT_DELIMITER \
--js_output_file $OUTPUT_FILE-$VERSION.js


cp $OUTPUT_FILE-$VERSION.js $OUTPUT_FILE-latest.js
