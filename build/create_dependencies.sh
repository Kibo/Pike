#!/bin/bash
python ../../closure-library/closure/bin/calcdeps.py --dep ../../closure-library --path ../source --output_mode deps > ../test/js/source-deps.js
