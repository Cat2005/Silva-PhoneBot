import { Configuration, OpenAIApi } from "openai";
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;


const app = express();

const openAPIGet = async (req, res) => {
    const configuration = new Configuration({
        apiKey: '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',
      });
    const openai = new OpenAIApi(configuration);


    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API key not configured, please follow instructions in README.md",
          }
        });
        return;
      }
    
      const speechToText = req;
      
    
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: generatePrompt(speechToText),
          temperature: 0.6,
          max_tokens: 200,
        });
        res.status(200).json({ result: completion.data.choices[0].text });
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
    
    
    function generatePrompt(prompt) {
     
      return `You are a voice assistant who is trying to help elderly people with tech support. The prompt you will receive below
      is a transcript of what they have said. Please provide your response, which will be spoken out loud to them.
      Make sure it is simple and concise, and easy to understand when it is spoken out loud. Make sure you are kind
      and friendly.
      Here is the prompt:  ${prompt}'
    `;
    }
}



  



  app.post('/voice', async (request, response) => {

   

       
    
      

    try {
        const APIresponse = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ animal: "Hi, my Youtube is not working" }),
        });
  
        const data = await APIresponse.json();
        if (APIresponse.status !== 200) {
          throw data.error || new Error(`Request failed with status ${APIresponse.status}`);
        }
  
        const result = data.result;

         // Use the Twilio Node.js SDK to build an XML response
         const twiml = new VoiceResponse();
         twiml.say(result);
     
         // Render the response as XML in reply to the webhook request
         response.type('text/xml');
         response.send(twiml.toString());
        
      } catch(error) {
        // Consider implementing your own error handling logic here
        console.error(error);
        // alert(error.message);
      }

       
  });
  
  // Create an HTTP server and listen for requests on port 3000
  app.listen(3000, () => {
    console.log(
      'Now listening on port 3000. ' +
      'Be sure to restart when you make code changes!'
    );
  });