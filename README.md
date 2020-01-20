# dashboard

> Grid Dashboard

## Build and Run VueJS Project (Frontend)

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8081
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Build and Run Container

``` bash
# build the server (this also builds the VueJS project)
make build

# create the docker image
docker build -t dashboard .

# run the container
docker run --rm -it -p 8081:8081 dashboard
```

Copyright © 2016 Tikal Technologies, Inc.