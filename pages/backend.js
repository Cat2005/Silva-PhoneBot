 const express = require('express');
  const VoiceResponse = require('twilio').twiml.VoiceResponse;

  const app = express();


  app.post('/voice', (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();
    twiml.say('H');
  
    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
  });
  
  // Create an HTTP server and listen for requests on port 3000
  app.listen(3000, () => {
    console.log(
      'Now listening on port 3000. ' +
      'Be sure to restart when you make code changes!'
    );
  });