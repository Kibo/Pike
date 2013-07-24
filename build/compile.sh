#!/bin/bash

VERSION="0.3"
PATH_TO_BUILDER="../../closure-library/closure/bin/build/closurebuilder.py"
PATH_TO_COMPILER="/usr/local/share/closure-compiler/compiler.jar"
PATH_TO_CLOSURE_LIBRARY="../../closure-library"
PATH_TO_SOURCES="../source"
OUTPUT_FILE="../pike"

#For Python 2.7 >
$PATH_TO_BUILDER \
--input ../source/ai.js \
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
--output_mode=compiled \
--compiler_jar=$PATH_TO_COMPILER \
--compiler_flags="--compilation_level=WHITESPACE_ONLY" \
--compiler_flags="--warning_level=VERBOSE" \
--compiler_flags="--formatting=PRETTY_PRINT" \
--compiler_flags="--formatting=PRINT_INPUT_DELIMITER" \
> $OUTPUT_FILE-$VERSION.js

cp $OUTPUT_FILE-$VERSION.js $OUTPUT_FILE-latest.js


