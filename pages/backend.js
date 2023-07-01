const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;


const app = express();

const openAPIGet = async (req, res) => {
    const configuration = new Configuration({
        apiKey: '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',
      });
    const openai = new OpenAIApi(configuration);

    const generatePrompt = (prompt) => {
        // console.log("prompt is", prompt);
  
     
        return `You are a voice assistant who is trying to help elderly people with tech support. The prompt you will receive below
        is a transcript of what they have said. Please provide your response, which will be spoken out loud to them.
        Make sure it is simple and concise, and easy to understand when it is spoken out loud. Make sure you are kind
        and friendly.
        Here is the prompt:  ${prompt}'
      `;
      }


    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API key not configured, please follow instructions in README.md",
          }
        });
        return;
      }
    
      
      const speechToText = req.body.speechToText;
    //   console.log(speechToText);
    //   console.log(generatePrompt(speechToText));
      
    
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: generatePrompt(speechToText),
          temperature: 0.6,
          max_tokens: 200,
        });
        console.log(completion.data.choices[0].text);
        return completion.data.choices[0].text;
      } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
        } else {
          console.error(`Error with OpenAI API request: ${error.message}`);
          res.status(500).json({
            error: {
              message: 'An error occurred during your request.',
            }
          });
        }
      }
    
    
    
}

// app.post('/gatherInput', (request, response) => {
//     const twiml = new VoiceResponse();
  
//     const gather = twiml.gather({
//       input: 'speech', // Accept speech input
//       timeout: 10, // Maximum timeout in seconds
//       action: '/processInput', // URL to receive the gathered input
//       method: 'POST',
//     });
//     gather.say(
//         {
//           voice: 'Polly.Amy', // Replace with the desired Amazon Polly voice
//         },
//         "Hi there, I am Silva, what do you need help with today?"
//       );
  
//     // gather.say('Hi there, I am Silva, what do you need help with today?');
  
//     // // If no input is received, handle the case
//     // twiml.say("We didn't receive any input. Goodbye!");
  
//     response.type('text/xml');
//     response.send(twiml.toString());
//   });

app.post('/gatherInput', async (request, response) => {

    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice'
    });

    gather.say({
        voice: 'alice',
    }, "Hi there, I'm Silva, how can I help");
    // Render the response as XML in reply to the webhook request
    console.log(twiml.toString());
    response.type('text/xml');
    response.send(twiml.toString());
    });


app.all('/voice', async (request, response) => {
    console.log("Hi request was", request.body);
    // console.log("Hi, I'm having trouble with my Youtube.");
    try {
    //   const speechToText = request.body.speechToText;
        
        const send = {
            // speechToText: "Hi, I'm having trouble with Youtube"
            speechToText: "Hello"
           
            // speechToText: await awaitUserResponse()
          };
        
        const result = await openAPIGet({
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: send,
      });
    
    //   const result = await openAPIGet("Hi, I'm having trouble with my Youtube.");
  
      // Use the Twilio Node.js SDK to build an XML response
      const twiml = new VoiceResponse();
      console.log(result);
      twiml.say(
        {
          voice: 'Polly.Joanna', // Replace with the desired Amazon Polly voice
        },
        result
      );
    //   twiml.say(result);
  
      // Render the response as XML in reply to the webhook request
      response.type('text/xml');
      response.send(twiml.toString());
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      response.status(500).json({ error: error.message });
    }
  });
  
  // Create an HTTP server and listen for requests on port 3000
  app.listen(3000, () => {
    console.log(
      'Now listening on port 3000. ' +
      'Be sure to restart when you make code changes!'
    );
  });