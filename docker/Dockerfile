FROM debian:bullseye AS base
RUN \
	rm -rf /var/lib/apt/lists/* && \
	DEBIAN_FRONTEND=noninteractive apt update && apt dist-upgrade && apt install -y \
		curl \
		locales \
		nano \
		nodejs \
		net-tools \
		npm \
		procps \
	&& \
	rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY app               /build/app
COPY package.json      /build/
COPY package-lock.json /build/
COPY webpack.config.js /build/
RUN \
	cd /build && \
	npm install

FROM base
COPY --from=build /build/node_modules /dashboard/node_modules
COPY --from=build /build/app-build    /dashboard/app-build
COPY server                           /dashboard/server
COPY start.js                         /dashboard/

WORKDIR /dashboard
EXPOSE 5000/tcp
ENTRYPOINT ["./start.js"]
