FROM alpine:3.6
COPY bin/dashboard /usr/local/bin
ADD ./dist /dist/
CMD ["dashboard"]
