import User from '../models/User.js';

// @desc    Update currency
// @route   PUT /api/settings/currency
// @access  Private
export const updateCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body;
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { currency },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
      message: 'Currency updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theme
// @route   PUT /api/settings/theme
// @access  Private
export const updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
      message: 'Theme updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/settings/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, avatar } = req.body;
    const userId = req.userId;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

