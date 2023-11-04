import express from 'express';
import chat from './routes/chat.js';
import cors from 'cors';

const app = express();


// Define a sample route
app.get('/', (req, res) => {
    res.send('Hello, this is your API!');
});

app.use(express.json());
app.use(cors());
app.use('/chat', chat);

// Define a port to listen on
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port  http://localhost:${port}`);
});
