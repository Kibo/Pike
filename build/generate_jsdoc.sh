#!/bin/bash

JAVADOC_HOME="/usr/local/share/jsdoc_toolkit-2.4.0/jsdoc-toolkit"
PATH_TO_SOURCES="../source/"
PATH_TO_DOC="../doc"

java -jar $JAVADOC_HOME/jsrun.jar $JAVADOC_HOME/app/run.js \
-t=$JAVADOC_HOME/templates/jsdoc \
-d=$PATH_TO_DOC \
$PATH_TO_SOURCES


