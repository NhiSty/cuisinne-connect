import express from 'express';
import OpenAIChat from '../utils/Openai.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const openaiChat = new OpenAIChat(process.env.OPENAI_API_KEY,);

router.post('/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openaiChat.sendMessage(message);
    const conversation = await openaiChat.getConversation();

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
