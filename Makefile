.PHONY: install build typecheck test backend docker-build docker-run clean release-check

install:
	npm ci

build:
	npm run build

typecheck:
	npm run typecheck

test:
	npm test

backend:
	npm run test:backend --if-present

docker-build:
	npm run docker:build

docker-run:
	npm run docker:run

clean:
	npm run clean

release-check: install build test backend
