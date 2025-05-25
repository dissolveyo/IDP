import Message from '../models/message.model.js';

export const sendMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();

    req.io?.to(req.body.chatId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMessagesByChat = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).populate('senderId');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};