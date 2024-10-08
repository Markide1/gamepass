import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Use body-parser to parse JSON requests
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:3002', // Specify the frontend URL
  methods: ['GET', 'POST', 'PUT'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Welcome to the Guesser Game API');
});

// POST /register
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, try to find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      // If the user exists and the password is correct, log them in
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      return res.json({ token });
    }

    // If the login failed, check if the password matches any other user
    const allUsers = await prisma.user.findMany();
    
    for (const otherUser of allUsers) {
      if (await bcrypt.compare(password, otherUser.password)) {
        // We found a user with a matching password
        return res.status(401).json({
          message: `You've entered ${otherUser.name}'s password, maybe your email is ${otherUser.email}?`
        });
      }
    }

    // If we get here, no matching password was found
    res.status(401).json({ message: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /forgot-password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // In a real application, you would send an email with a reset link
      // For this example, we'll just return a success message
      res.json({ message: 'Password reset link sent to your email' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /change-password
app.put('/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && await bcrypt.compare(oldPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /leave-message
app.post('/leave-message', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        userId,
      },
    });
    res.status(201).json({ message: 'Message created successfully', messageId: newMessage.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: { user: { select: { name: true } } },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


