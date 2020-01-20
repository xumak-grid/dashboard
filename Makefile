.PHONY: run build default

run:
	npm run build
	gin --port 3001 -a 8000 -b bin/dashboard -i --build cmd/dashboard

build:
	npm run build
	CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -o bin/dashboard  -tags netgo cmd/dashboard/*.go

default: run
