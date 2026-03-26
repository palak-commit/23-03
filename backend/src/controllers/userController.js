import { models } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { BaseController } from './baseController.js';

const { User, RefreshToken } = models;

class UserController extends BaseController {
  constructor() {
    super(User, 'User');
  }

  // Helper methods for tokens
  generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: '15m',
    });
  };

  generateRefreshToken = async (userId) => {
    const token = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token,
      user: userId,
      expiresAt,
    });

    return token;
  };

  // Override create (Registration)
  create = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required', 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendError(res, 'Email is already registered', 409);
      }

      const createdBy = req.user && req.user.id ? req.user.id : 'System';

      const user = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        created_by: createdBy,
      });
      
      await user.save();
      const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      return sendSuccess(res, safeUser, 'User created successfully', 201);
    } catch (error) {
      return sendError(res, 'Error creating user', 500, error);
    }
  };

  // Auth specific methods
  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid password', 401);
      }

      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = await this.generateRefreshToken(user._id);

      return sendSuccess(res, { accessToken, refreshToken, user: { id: user._id, name: user.name } }, 'Login successful');
    } catch (error) {
      return sendError(res, 'Error logging in', 500, error);
    }
  };

  refresh = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return sendError(res, 'Refresh token is required', 400);
      }

      const storedToken = await RefreshToken.findOne({ token });
      if (!storedToken) {
        return sendError(res, 'Invalid refresh token', 401);
      }

      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      const newAccessToken = this.generateAccessToken(decoded.id);

      return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
    } catch (error) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }
  };

  logout = async (req, res) => {
    try {
      const { token } = req.body;
      if (token) {
        await RefreshToken.findOneAndDelete({ token });
      }
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      return sendError(res, 'Error logging out', 500, error);
    }
  };

  // Custom getAll (Exclude self)
  getAllUsers = async (req, res) => {
    try {
      const userId = req.user.id;
      const users = await User.find({ _id: { $ne: userId } });
      return sendSuccess(res, users, 'Users fetched successfully');
    } catch (error) {
      return sendError(res, 'Error fetching users', 500, error);
    }
  };
}

const userController = new UserController();

export const createUser = userController.create;
export const loginUser = userController.login;
export const refreshToken = userController.refresh;
export const logoutUser = userController.logout;
export const getUsers = userController.getAllUsers;
export const deleteUser = userController.delete;
