#!/bin/bash

echo "Searching for jsdom, parse5, sanitize-html, dompurify, marked, htmlparser2..."

grep -Rni \
  -e "jsdom" \
  -e "parse5" \
  -e "sanitize-html" \
  -e "dompurify" \
  -e "htmlparser2" \
  -e "marked" \
  -e "unified" \
  -e "@apollo" \
  src \
  | sed 's/^/FOUND: /'
