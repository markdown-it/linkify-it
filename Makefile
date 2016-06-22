NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut --bytes=-6) master)
GITHUB_PROJ := https://github.com/nodeca/${NPM_PACKAGE}


lint:
	./node_modules/.bin/eslint .


test: lint
	rm -rf coverage
	./node_modules/.bin/istanbul cover node_modules/.bin/_mocha


report-coverage:
	./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage


demo: lint
	rm -rf ./demo
	mkdir ./demo
	./support/demodata.js > ./support/demo_template/sample.json
	./node_modules/.bin/jade ./support/demo_template/index.jade --pretty \
		--obj ./support/demo_template/sample.json \
		--out ./demo
	./node_modules/.bin/stylus -u autoprefixer-stylus \
		< ./support/demo_template/index.styl \
		> ./demo/index.css
	rm -rf ./support/demo_template/sample.json
	./node_modules/.bin/browserify ./support/demo_template/index.js > ./demo/index.js


doc:
	rm -rf ./doc
	./node_modules/.bin/ndoc --link-format "{package.homepage}/blob/${CURR_HEAD}/{file}#L{line}"


gh-pages:
	@if test -z ${REMOTE_REPO} ; then \
		echo 'Remote repo URL not found' >&2 ; \
		exit 128 ; \
		fi
	$(MAKE) demo && \
		cp -r ./demo ${TMP_PATH} && \
		touch ${TMP_PATH}/.nojekyll
	$(MAKE) doc && \
		cp -r ./doc ${TMP_PATH}/doc
	cd ${TMP_PATH} && \
		git init && \
		git add . && \
		git commit -q -m 'Recreated docs'
	cd ${TMP_PATH} && \
		git remote add remote ${REMOTE_REPO} && \
		git push --force remote +master:gh-pages
	rm -rf ${TMP_PATH}


publish: browserify
	# run browserify to make sure that browserified version is in sync
	@if test 0 -ne `git status --porcelain | wc -l` ; then \
		echo "Unclean working tree. Commit or stash changes first." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git tag -l ${NPM_VERSION} | wc -l` ; then \
		echo "Tag ${NPM_VERSION} exists. Update package.json" >&2 ; \
		exit 128 ; \
		fi
	git tag ${NPM_VERSION} && git push origin ${NPM_VERSION}
	npm publish ${GITHUB_PROJ}/tarball/${NPM_VERSION}


.PHONY: publish lint test doc demo gh-pages coverage
.SILENT: help lint test doc todo
