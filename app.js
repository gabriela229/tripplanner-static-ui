const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const models = require('./models');
const morgan = require('morgan');
const bodyParser = require('body-parser');


const app = express();

app.use(morgan('dev'));
app.set('view engine', 'html');
// app.engine('html', nunjucks.render);

nunjucks.configure('views', {
  noCache: true,
  express: app,
  autoescape: true
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res, next)=> {
  models.retrieveAll()
    .then(([activities, hotels, restaurants]) => {
      res.render('index', {activities, hotels, restaurants});
      // res.json({activities, hotels, restaurants});
    }).catch(err => { throw err; });

    //res.render('index')
});

app.use((req, res, next)=> {
  const error = new Error('page not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).render('error', { error: err });
});

const port = process.env.PORT || 3000;
models.sync()
  .then(()=> {
    app.listen(port, ()=> {
      console.log(`listening on port ${port}`);
    });
  });
