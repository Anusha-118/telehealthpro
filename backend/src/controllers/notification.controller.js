const { Notification } = require('../models');

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('List Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id } }
      );
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const notification = await Notification.findOne({
      where: { notification_id: id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification state.' });
  }
};

module.exports = {
  listNotifications,
  markAsRead
};
