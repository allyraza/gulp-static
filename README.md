# Gulp Site


### Requirements
- node >6.0.0
- npm >3.0.0  
- gulp >3.0.0

1. To setup nodejs and npm follow the official guide

    [NodeJS](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

2. To setup gulp
```sh
npm install gulp -g
```

    [GulpJS](http://gulpjs.com/)

## How to Setup
- Get the source from git repo if you don't have a local copy.

```sh
$ git clone http://github.com/allyraza/gulp-site
$ cd gulp-site
```

- Install dependecies by running
    
```sh
npm install
```

- Run the development server by executing

```sh
gulp
```

open http://host:port in your browser to view the application

- To build the app run the following command, it will create a dist dir which contains the final set of files

```sh
gulp -p
```

To deply the html build files, you need a web server copy & paste dist dir to htdocs and apache/nginx can handle the rest.

- To run the test run

```sh
gulp test
```

- To clean the build dir

```sh
gulp clean
```

### Available Tasks

- `gulp`: initialize watch for changes and a server (localhost:3000)
- `gulp js`: execute js files
- `gulp lint`: execute js files
- `gulp test`: execute js files
- `gulp nunjucks`: compile nunjucks templates
- `gulp sass`: compile sass files
- `gulp imagemin`: compress image files
- `gulp watch`: call for watch files
- `gulp clean`: call for watch files
- `gulp -p`: minify all files for production