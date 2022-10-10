FROM debian:bullseye

RUN \
	rm -rf /var/lib/apt/lists/* && \
	DEBIAN_FRONTEND=noninteractive apt update && apt dist-upgrade && apt install -y \
		curl \
		locales \
		nano \
		nodejs \
		net-tools \
		npm \
	&& \
	rm -rf /var/lib/apt/lists/*

WORKDIR /dashboard

RUN \
	git clone --depth 1 https://github.com/fishbach/gitlab-dashboard.git . && \
	npm install && \
	npm run build

EXPOSE 5000/tcp
CMD ["bash", "-l"]
ENTRYPOINT ["./start.js"]
