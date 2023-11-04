import OpenAI from "openai";

export default class OpenAIChat {
    constructor(apiKey,
                initialSystemMessage = 'Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier et tu es en train de discuter avec des élèves qui souhaitent que tu répondes à leurs questions sur leurs besoins de recettes ou autres questions concernant la cuisine du monde entier.') {
        this.openai = new OpenAI({ apiKey });
        this.model = 'gpt-3.5-turbo';
        this.conversation = [
            { role: 'system', content: initialSystemMessage },
        ];
    }

    async getConversation() {
        return this.conversation;
    }

    async sendMessage(userMessage) {
        try {
            this.conversation.push({ role: 'user', content: userMessage });

            const completion = await this.openai.chat.completions.create({
                messages: this.conversation,
                model: this.model,
                //maxTokens: 300,
            });

            const assistantResponse = completion.choices[0].message.content;
            this.conversation.push({ role: 'assistant', content: assistantResponse });

            return assistantResponse;
        } catch (error) {
            throw error;
        }
    }
}

