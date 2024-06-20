require("dotenv").config();
const OpenAI = require("openai").OpenAI;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createChatCompletion = async (messages) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error creating chat completion:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to connect to OpenAI API");
  }
};

exports.openaiChat = async (req, res) => {
  try {
    const { text } = req.body;
    const messages = [
      {
        role: "system",
        content:
          "You are a chess expert. Evaluate the following chess move and provide feedback.",
      },
      { role: "user", content: `The move is: ${text}` },
    ];

    const reply = await createChatCompletion(messages);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error creating chat completion:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
};
