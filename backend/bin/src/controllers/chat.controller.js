const { Message, User } = require('../models');
const { Op } = require('sequelize');

const getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'Target peer User ID is required.' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: req.user.id }
        ]
      },
      order: [['created_at', 'ASC']],
      include: [
        { model: User, as: 'Sender', attributes: ['name', 'id'] },
        { model: User, as: 'Receiver', attributes: ['name', 'id'] }
      ]
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history.' });
  }
};

module.exports = {
  getChatHistory
};
