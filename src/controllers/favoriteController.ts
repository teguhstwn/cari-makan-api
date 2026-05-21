import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { google_place_id, nama_merchant, alamat, user_id } = req.body;

    // Validasi data input
    if (!google_place_id || !nama_merchant || !user_id) {
      return errorResponse(res, 'google_place_id, nama_merchant, and user_id are required fields', 400);
    }

    // 1. Lakukan upsert untuk Merchant
    const merchant = await prisma.merchant.upsert({
      where: { google_place_id },
      update: {
        nama_merchant, // Update nama jika ada perubahan
        alamat,        // Update alamat jika ada perubahan
      },
      create: {
        google_place_id,
        nama_merchant,
        alamat,
      },
    });

    // 2. Cek apakah merchant ini sudah difavoritkan oleh user tersebut
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        user_id,
        merchant_id: merchant.id,
      },
    });

    if (existingFavorite) {
      return successResponse(res, 'Merchant is already in favorites', existingFavorite, 200);
    }

    // 3. Simpan ke database tabel Favorite
    const favorite = await prisma.favorite.create({
      data: {
        user_id,
        merchant_id: merchant.id,
      },
    });

    return successResponse(res, 'Berhasil menyimpan merchant ke daftar favorit', favorite, 201);
  } catch (error: any) {
    return errorResponse(res, 'Failed to add merchant to favorites', 500, error);
  }
};
