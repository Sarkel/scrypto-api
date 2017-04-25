/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 24/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    bodyParser = require('body-parser');
let app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.json('Working')
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});