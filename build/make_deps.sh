#!/bin/bash

PATH_TO_DEPSWRITER="../../closure-library/closure/bin/build/depswriter.py"
PATH_TO_SOURCES="../source"
PREFIX="../../../Pike/source/"
OUTPUT_FILE="../source/deps.js"

$PATH_TO_DEPSWRITER \
--root_with_prefix="$PATH_TO_SOURCES $PREFIX" \
--output_file=$OUTPUT_FILE
