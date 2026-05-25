import type { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { google_place_id, nama_merchant, alamat } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return errorResponse(res, 'Unauthorized: User ID tidak ditemukan', 401);
    }

    // Validasi data input
    if (!google_place_id || !nama_merchant) {
      return errorResponse(res, 'google_place_id dan nama_merchant harus diisi', 400);
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

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return errorResponse(res, 'Unauthorized: User ID tidak ditemukan', 401);
    }

    const { kategori, rating, harga } = req.query;

    const favorites = await prisma.favorite.findMany({
      where: { user_id },
      include: {
        merchant: true,
      },
    });

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return errorResponse(res, 'Google API Key is not configured on the server', 500);
    }

    const detailedPlaces = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const googleUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
          const response = await axios.get(googleUrl, {
            params: {
              place_id: fav.merchant.google_place_id,
              fields: 'name,rating,price_level,types,vicinity,geometry',
              key: apiKey,
            },
          });

          const placeData = response.data.result;
          return {
            id: fav.id,
            user_id: fav.user_id,
            merchant_id: fav.merchant_id,
            createdAt: fav.createdAt,
            merchant: {
              ...fav.merchant,
              rating: placeData?.rating,
              price_level: placeData?.price_level,
              types: placeData?.types || [],
            },
          };
        } catch (err) {
          return {
            id: fav.id,
            user_id: fav.user_id,
            merchant_id: fav.merchant_id,
            createdAt: fav.createdAt,
            merchant: {
              ...fav.merchant,
              rating: undefined,
              price_level: undefined,
              types: [],
            },
          };
        }
      })
    );

    let filteredFavorites = detailedPlaces;

    if (kategori) {
      const katStr = String(kategori).toLowerCase();
      filteredFavorites = filteredFavorites.filter((fav) =>
        fav.merchant.types.some((t: string) => t.toLowerCase().includes(katStr))
      );
    }

    if (rating) {
      const minRating = parseFloat(String(rating));
      if (!isNaN(minRating)) {
        filteredFavorites = filteredFavorites.filter(
          (fav) => fav.merchant.rating !== undefined && fav.merchant.rating >= minRating
        );
      }
    }

    if (harga) {
      const priceLevel = parseInt(String(harga));
      if (!isNaN(priceLevel)) {
        filteredFavorites = filteredFavorites.filter(
          (fav) => fav.merchant.price_level !== undefined && fav.merchant.price_level === priceLevel
        );
      }
    }

    return successResponse(res, 'Berhasil mendapatkan daftar favorit', filteredFavorites);
  } catch (error: any) {
    return errorResponse(res, 'Gagal mengambil daftar favorit', 500, error);
  }
};
