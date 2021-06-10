const { Requester, Validator } = require('@chainlink/external-adapter')


// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  fixture: ['fixtureId']
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const appId = process.env.API_KEY; // input.data.key
  const fixtureId = input.data.fixtureId; //validator.validated.data.fixture

  console.log("Fixture ID =" + fixtureId + " input.data.fixtureId = " + input.data.fixtureId);
  console.log("x-rapidapi-key =" + appId);
  
  const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      params: {id: fixtureId},
      headers: {
        'x-rapidapi-key': appId,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
  };
  
  Requester.request(options).then(function (response) {
    /*
    console.log('######')
    //console.log(response.data.response);
    console.log('$$$$$')
    console.log(response.data.response[0].goals)
    console.log(response.data.response[0].teams)
    console.log(response.data.response[0].fixture.status) 
    */
    var finalResult = {};
    finalResult.winner = "Pending";

    if (response.data.response[0].fixture.status.short == 'FT') {
      if (response.data.response[0].teams.home.winner == true) {
        finalResult.winner = response.data.response[0].teams.home.name      
      }
      else if (response.data.response[0].teams.away.winner == true) {
        finalResult.winner = response.data.response[0].teams.away.name
      }
    }
    
    response.data = finalResult
    response.data.result = Requester.getResult(response.data, ['winner'])

    //console.log('###Sending Respone###')
    //console.log(response)

    callback(response.status, Requester.success(jobRunID, response))
  }).catch(function (error) {
    callback(500, Requester.errored(jobRunID, error));
  });
}


// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
