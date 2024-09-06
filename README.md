# gamepass
This is a fun system that tells you a user's email if you happen to use their password during login.


import express from 'express';
// ... other imports ...

const app = express();

// ... other middleware and route setups ...

// Add this new route handler
app to.get('/', (req, res) => {
  res.send('Welcome to the Guesser Game API');
});

// ... rest of your code ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});