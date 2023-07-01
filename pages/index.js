import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const fetch = require('node-fetch');
  const express = require('express');
  const VoiceResponse = require('twilio').twiml.VoiceResponse;

  const app = express();


  app.post('/voice', (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();
    twiml.say('Hi,');
  
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


  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();

  // const ngrok = require('ngrok');
  // (async function() {
  //   const url = await ngrok.connect(3000);
  // })();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const APIresponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal: animalInput }),
      });

      const data = await APIresponse.json();
      if (APIresponse.status !== 200) {
      }

      setResult(data.result);
      setAnimalInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
     
        <h3>Tech Help</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter your problem"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
