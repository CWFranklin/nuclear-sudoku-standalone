# Nuclear Sudoku

Nuclear Sudoku is an original idea conceived by [Phil Hazelton](https://github.com/philhaz) and was built inside a day with the assistance of [Chris Franklin](https://github.com/CWFranklin) during the September 2013 hackbmth event. A case study was published by Jon Ginn of Open Device Lab Bournemouth and can be found [here](https://odl.wearebase.com/blog/case-study-nuclear-sudoku/).

This version deviates from the original version with improved UI and UX, reduced player-count, etc. and is designed to run as a standalone, single instance of Nuclear Sudoku and persists under the MIT license as permitted by Phil.

An "instanced" version of Nuclear Sudoku is available [here](https://github.com/CWFranklin/nuclear-sudoku-instanced).

### Installation

Nuclear Sudoku requires [Node.js](https://nodejs.org/) to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd nuclear-sudoku
$ npm install -d
$ npm run dev
```

For production environments...

```sh
$ npm install --production
$ node app.js
```

### License

MIT
