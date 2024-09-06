import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: "Guesser Game API",
    version: "1.0.0",
    endpoints: [
      {
        method: "POST",
        path: "/register",
        description: "Register a new user",
        body: { email: "string", password: "string", name: "string" },
        response: { message: "string", userId: "string" }
      },
      {
        method: "POST",
        path: "/login",
        description: "Log in a user",
        body: { email: "string", password: "string" },
        response: { token: "string" }
      },
      {
        method: "POST",
        path: "/forgot-password",
        description: "Request a password reset",
        body: { email: "string" },
        response: { message: "string" }
      },
      {
        method: "PUT",
        path: "/change-password",
        description: "Change a user's password",
        body: { userId: "string", oldPassword: "string", newPassword: "string" },
        response: { message: "string" }
      },
      {
        method: "POST",
        path: "/leave-message",
        description: "Leave a new message",
        body: { userId: "string", message: "string" },
        response: { message: "string", messageId: "string" }
      },
      {
        method: "GET",
        path: "/messages",
        description: "Retrieve all messages",
        response: { 
          type: "array",
          items: {
            id: "string",
            content: "string",
            userId: "string",
            user: { name: "string" },
            createdAt: "string",
            updatedAt: "string"
          }
        }
      }
    ]
  });
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

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      res.json({ token });
    } else {
      // Check if the password matches another user's password
      const otherUser = await prisma.user.findFirst({
        where: {
          password: await bcrypt.hash(password, 10)
        }
      });

      if (otherUser) {
        res.status(401).json({
          message: `You entered "${otherUser.name}"'s password, maybe your email is "${otherUser.email}"?`
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});