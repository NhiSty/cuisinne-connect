import { openaiChat } from '../utils/Openai.js';

export async function sendMessageController(req, res) {
	try {
		const { message } = req.body;
		const response = await openaiChat.sendMessage(message);
		const conversation = await openaiChat.getConversation();

		res.status(200).json({ conversation });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
