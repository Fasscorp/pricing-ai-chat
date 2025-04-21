import express from 'express';
import dotenv from 'dotenv';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ✅ CORS fix: allow requests from any frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // quickly handle preflight requests
  }
  next();
});

// Initialize LangChain with OpenAI
const chat = new ChatOpenAI({
  temperature: 0.7,
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// In-memory session (just for now — will reset every time)
let conversationState = {
  step: 0,
  courseName: null,
  valueResponses: [],
};

// Main AI-driven chat route
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    let aiResponse = '';

    if (conversationState.step === 0) {
      aiResponse = "Hi! I'm your pricing assistant 🤖\n\nWhat's the name of your course?";
      conversationState.step = 1;

    } else if (conversationState.step === 1) {
      conversationState.courseName = message;
      aiResponse = `Awesome! "${message}" sounds interesting.\n\nCan you tell me what kind of financial or time results students can expect from this course?`;
      conversationState.step = 2;

    } else if (conversationState.step === 2) {
      conversationState.valueResponses.push(message);
      aiResponse = "Thanks! Is there any non-quantifiable value — like peace of mind, competitive edge, or new skills?";
      conversationState.step = 3;

    } else if (conversationState.step === 3) {
      conversationState.valueResponses.push(message);

      // Ask OpenAI for pricing suggestion
      const finalResponse = await chat.call([
        new SystemMessage("You are a digital product pricing expert."),
        new HumanMessage(
          `The user is creating an online course called "${conversationState.courseName}".\n` +
          `They described its value like this:\n\n${conversationState.valueResponses.join('\n')}\n\n` +
          `Based on this, suggest one of these price brackets: "$0-$100", "$100-$1000", or "$1000+". ` +
          `Briefly explain your choice in one paragraph.`
        ),
      ]);

      aiResponse = finalResponse.text;

      // Reset session for next user
      conversationState = {
        step: 0,
        courseName: null,
        valueResponses: [],
      };
    }

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong talking to the AI." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
