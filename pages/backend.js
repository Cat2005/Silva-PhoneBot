const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');


let gptPrompt = `You are a voice assistant called Silva who is trying to help elderly people with tech support.
The prompt you will receive below is a transcript of what you and they have said so far.
Please provide your response, which will be spoken out loud to them.
Make sure it is simple and concise, and easy to understand when it is spoken out loud.
Make sure you are kind, friendly, and extremely patient and encouraging. You should never repeat answers that are already in the transcript.
The following piece of information is VERY IMPORTANT: Make sure when you answer, your response should NEVER say 'Silva:' at the start, EVER.
Also, make sure you don't say 'The response is:' or 'Response:' in your answer. 
If the user asks you to talk more slowly, put more commas in your answer so it will be read out more slowly. 
Also, if at any point the user seems really frustrated or upset, or nothing seems to be working, tell them "It seems you may need some expert help. Would you like me to put you into contact with a human expert?"
Just immediately start answering the question please. 
Here is the transcript so far:
 `;

let conversation = `Silva: Hi there, I'm Silva, a voice-based assistant who's here to help you with any tech-related issues - how can I help you today?
User:`;

let reconnectPrompt = `You are a phone call voice assistant called Silva who is trying to help elderly people with tech support. Please provide your response, which will be spoken out loud to them.
Make sure it is simple and concise, and easy to understand when it is spoken out loud.
Make sure you are kind, friendly, and extremely patient and encouraging. You should never repeat answers that are already in the transcript. The prompt you will receive below is a transcript of what you and they have said so far.
The user has just been disconnected but has called back. As such, your next message should say something like you are glad they reconnected and ask them if they still need
help with whatever issue they were having. If they disconnected for a specific reason that they told you about, for example they had to take a call from their grandchild, you
should try and be friendly and say I hope your call went well. Make it appropriate for the context of the transcript you will receive below.`;

let previousUser = false;
let reconnectMessage = false;
let rconversation = "";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openAPIGet = async (req, res) => {
    const configuration = new Configuration({
        apiKey: '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',
      });
    const openai = new OpenAIApi(configuration);

    const generatePrompt = (prompt) => {
        // console.log("prompt is", prompt);
        if (reconnectMessage) {
            gptPrompt = `You are a phone call voice assistant called Silva who is trying to help elderly people with tech support. You must provide your response to the user which has just been disconnected, which should start with: "Hi there, I'm glad we reconnected. Do you still need help with....".
            Make sure it is simple and concise, and easy to understand when it is spoken out loud.
            Make sure you are kind, friendly, and extremely patient and encouraging. You should never repeat answers that are already in the transcript. This is the conversation transcript so far: ` + rconversation;
            console.log(gptPrompt);
        } else{
            conversation += prompt + '\n';
            gptPrompt += conversation + '\n' + "Silva: ";
            console.log(gptPrompt);

        }
        
        return gptPrompt
      
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
        gptPrompt += "Silva: " + completion.data.choices[0].text + '\n';
        rconversation = conversation + '\n' + "Silva: " + completion.data.choices[0].text + '\n';
        return completion.data.choices[0].text.replace('Silva:', '');
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

app.all('/gatherInput', async (request, response) => {
    const twiml = new VoiceResponse();
    // console.log(gptPrompt);
    if (previousUser){
        const reconnectMessage = true;
        const send = {
            // speechToText: "Hi, I'm having trouble with Youtube"
            speechToText: ""
           
            // speechToText: await awaitUserResponse()
          };
        
        const result = await openAPIGet({
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: send,
      });
      

      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice'
    }).say({
        voice: 'Google.en-GB-Neural2-A',
    }, "Hi there, I'm glad we reconnected. " + result);

    } else{
        previousUser = true;
        

        
        
        // twiml.say({
        //     voice: 'Google.en-GB-Neural2-C',
        // }, "Hi there, I'm Silva, a voice-based assistant who's here to help you with any tech-related issues. How can I help you today?");

        const gather = twiml.gather({
            input: 'speech',
            speechTimeout: 'auto',
            action: '/voice'
        }).say({
            voice: 'Google.en-GB-Neural2-A',
        }, "Hi there, I'm Silva, a voice-based assistant who's here to help you with any tech-related issues - how can I help you today?");

    }
    
    
 
    
    // Render the response as XML in reply to the webhook request
    // console.log(twiml.toString());
    response.type('text/xml');
    response.send(twiml.toString());
    });


app.all('/Brr', async (request, response) => {

    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice'
    })

    
    // Render the response as XML in reply to the webhook request
    // console.log(twiml.toString());
    response.type('text/xml');
    response.send(twiml.toString());
    });


app.all('/voice', async (request, response) => {
    
    // console.log("Hi, I'm having trouble with my Youtube.");
    try {
        console.log(request.body.SpeechResult.replace('Silva:', ''));

        // console.log("Hi request was", request.body.SpeechResult);
        
    //   const speechToText = request.body.speechToText;
        
        const send = {
            // speechToText: "Hi, I'm having trouble with Youtube"
            speechToText: request.body.SpeechResult.replace('Silva:', '')
           
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
            voice: 'Google.en-GB-Neural2-A', // Replace with the desired Amazon Polly voice
        },
        result
      );
      twiml.redirect('/Brr');
      
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