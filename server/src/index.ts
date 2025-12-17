import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// In-memory server (for testing)
const users: Record<string, any> = {};
const characters: Record<string, any> = {};

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (users[email]) {
    return res.status(400).json({ error: 'User already exists' });
  }
  users[email] = { email, password, characters: [] };
  res.json({ message: 'Registered' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Logged in' });
});

app.post('/create-character', (req, res) => {
  const { email, name, race, charClass } = req.body;
  const user = users[email];
  if (!user) return res.status(400).json({ error: 'User not found' });
  const char = {
    id: `${Date.now()}`,
    name,
    race,
    class: charClass,
    level: 1,
    xp: 0,
    stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIT: 10, MEN: 10 },
    inventory: [],
    position: { x: 100, y: 100 },
  };
  user.characters.push(char);
  characters[char.id] = char;
  res.json(char);
});

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('join', (charId: string) => {
    const character = characters[charId];
    if (!character) return;
    socket.data.character = character;
    socket.emit('join-success', character);
  });

  socket.on('move', (data: { x: number; y: number }) => {
    const character = socket.data.character;
    if (!character) return;
    character.position = data;
    socket.broadcast.emit('character-moved', { id: character.id, position: data });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
