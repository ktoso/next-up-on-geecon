#!/bin/sh

curl http://2013.geecon.org/rest/1/next-up > data/agenda.json
git add data
git commit -m "updated agenda"
git push origin gh-pages
