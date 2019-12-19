var express = require('express');
var proxy = require('http-proxy-middleware'); // This one does most of the heavy lifting
var axios = require('axios');
var base64 = require('base-64');
var cors = require('cors')

require('dotenv').config()

var options = {
  target: 'https://api.airtable.com/v0/' + process.env.APP_ID, // Airtable ENV var
  changeOrigin: true,
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + process.env.API_KEY // Airtable ENV var
  },
  pathRewrite: {
    '^/api' : ''
  },
  // http://stackoverflow.com/questions/14262986/node-js-hostname-ip-doesnt-match-certificates-altnames
  // https://github.com/nodejitsu/node-http-proxy/blob/f345a1ac2dde1884e72b952a685a0a1796059f14/lib/http-proxy/common.js#L54
  secure: false,
  ssl: {
    rejectUnauthorized: false
  },
};

var apiProxy = proxy(options);

var app = express();

app.use(cors())

app.use('/api', apiProxy);

const axiosInstance = axios.create({
  baseURL: options.target,
  headers: options.headers
});

app.use(express.json())

app.post('/auth', (req, res) => {
  console.log(req.body)
  return axiosInstance.get('/users', { // I use an Airtable table itself to hold credentials. Could be a different mechanism tho (Passport, Auth0, etc...)
    params: {
      maxRecords: 1,
      filterByFormula:
        `AND(\
          {user} = '${req.body.user}',\
          {password} = '${req.body.password}',\
          {active} = TRUE()\
        )`
    }
  })
  .then(function (response) {
    console.log(response.data);
    var records = response.data.records;
    if(records.length > 0) {
      const { id, fields: { user, full_name, level } } = records[0];
      res.send({
        session: base64.encode(id),
        info: { user, full_name, level }
      })
    } else {
      res.status(401).send({ error: { message: 'Unauthorized' } })
    }
  })
  .catch(function (error) {
    console.log('Error: ', error.response)
    res.status(error.response.status).send(error.response.data)
  })
})

var listener = app.listen(process.env.PORT || 2010, function(){
  console.log('Listening on port ' + listener.address().port);
});

module.exports = app;
