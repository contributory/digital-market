import { Response } from 'express';
import { RegisterSchema, LoginSchema, UserRole } from '@repo/shared';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyToken } from '../utils/jwt';
import { userStore } from '../models/userStore';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = RegisterSchema.parse(req.body);

    const emailExists = await userStore.emailExists(validatedData.email);
    if (emailExists) {
      throw new AppError(400, 'Email already registered');
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await userStore.create(
      validatedData.email,
      passwordHash,
      validatedData.name,
      UserRole.CUSTOMER
    );

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user,
        tokens,
      },
    });
  }
);

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);

  const storedUser = await userStore.findByEmail(validatedData.email);
  if (!storedUser) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePassword(
    validatedData.password,
    storedUser.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const { passwordHash: _, ...user } = storedUser;

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    status: 'success',
    data: {
      user,
      tokens,
    },
  });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, 'Refresh token is required');
  }

  try {
    const decoded = verifyToken(refreshToken);

    const user = await userStore.findById(decoded.userId);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    const tokens = generateTokenPair({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.json({
      status: 'success',
      data: {
        tokens,
      },
    });
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await userStore.findById(req.user.userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  res.json({
    status: 'success',
    data: {
      user: userWithoutPassword,
    },
  });
});
