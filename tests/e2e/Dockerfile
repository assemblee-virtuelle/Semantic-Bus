FROM codeception/codeceptjs
RUN apt-get update -q && apt-get install -yq curl --no-install-recommends && rm -rf /var/lib/apt/lists/*
ADD . .
RUN ls
ADD ./wait-for-it.sh /data/scripts/
CMD ["codeceptjs", "run", "--grep", "@local", "--verbose"]
