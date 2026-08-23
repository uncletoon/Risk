// ============================================================================
// Auth Controller
// ============================================================================

const { authenticateUser, getUserById } = require('../services/authService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userData = await authenticateUser(email, password);
    res.json(userData);
  } catch (err) {
    res.status(401).json({ message: err.message || 'Authentication failed' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = {
  login,
  getMe,
};
