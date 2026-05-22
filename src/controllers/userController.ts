import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, nama_lengkap } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    // Check if username or email is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return errorResponse(res, 'Username/Email sudah digunakan', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nama_lengkap,
      },
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, 'User berhasil terdaftar', userWithoutPassword, 201);
  } catch (error: any) {
    return errorResponse(res, 'Internal Server Error during registration', 500, error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const searchIdentifier = email || username;

    if (!searchIdentifier || !password) {
      return errorResponse(res, 'Email/Username and password are required', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: searchIdentifier },
          { username: searchIdentifier },
        ],
      },
    });

    if (!user) {
      return errorResponse(res, 'Email/Username atau password salah', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email/Username atau password salah', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return errorResponse(res, 'Internal Server Error: JWT secret is not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '1d' }
    );

    return successResponse(res, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }, 200);
  } catch (error: any) {
    return errorResponse(res, 'Internal Server Error during login', 500, error);
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized: User ID not found in request', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, 'User profile retrieved successfully', userWithoutPassword, 200);
  } catch (error: any) {
    return errorResponse(res, 'Internal Server Error while retrieving profile', 500, error);
  }
};
