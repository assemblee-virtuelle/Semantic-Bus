TESTDIR=./tests
TESTENTS=`ls $(TESTDIR)/*.js`
MOCHA_OPT=--timeout 11000 
 
all:
	for i in $(TESTENTS); do \
		echo ; \
		echo Test $$i; \
		mocha $$i $(MOCHA_OPT); \
	done

test: all
