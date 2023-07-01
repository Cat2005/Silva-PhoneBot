import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid q",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(animal),
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
}

function generatePrompt(animal) {
 
  return `You are a voice assistant who is trying to help elderly people with tech support. The prompt you will receive below
  is a transcript of what they have said. Please provide your response, which will be spoken out loud to them.
  Make sure it is simple and concise, and easy to understand when it is spoken out loud. Make sure you are kind
  and friendly.
  Here is the prompt:  ${animal}'
`;
}

// Animal: ${capitalizedAnimal}
// Names:
