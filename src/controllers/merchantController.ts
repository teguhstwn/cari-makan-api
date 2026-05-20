import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMerchants = async (req: Request, res: Response) => {
  try {
    const merchants = await prisma.merchant.findMany();
    return successResponse(res, 'Success get all merchants', merchants);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get merchants', 500, error);
  }
};
