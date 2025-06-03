const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Document = mongoose.model('Document', new mongoose.Schema({ content: String }));

let documentContent = '';

io.on('connection', (socket) => {
  socket.emit('load-document', documentContent);

  socket.on('save-document', async (data) => {
    documentContent = data;
    await Document.findOneAndUpdate({}, { content: data }, { upsert: true });
    socket.broadcast.emit('receive-changes', data);
  });
});

server.listen(3001, () => console.log('Server running on http://localhost:3001'));
