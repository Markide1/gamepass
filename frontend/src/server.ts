import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';

const app = express();

app.use(express.json());

// Use body-parser to parse JSON requests
app.use(bodyParser.json());

// Define your API routes here
app.post('/login', (req, res) => { /* ... */ });
app.post('/register', (req, res) => { /* ... */ });
// ... other routes ...

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

