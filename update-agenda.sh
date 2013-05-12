#!/bin/sh

java -cp geecon-gen-agenda-json-0.1.jar pl.project13.meetupgetnames.Agenda2Json > data/agenda.json

git add data && git commit -m "Updated agenda" && git push origin gh-pages