import type { Request, Response } from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../utils/response.js';

export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, name, keyword, type } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, 'Latitude (lat) and Longitude (lng) are required', 400);
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return errorResponse(res, 'Google API Key is not configured on the server', 500);
    }

    const googleUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const response = await axios.get(googleUrl, {
      params: {
        location: `${lat},${lng}`,
        radius: radius || 1500,
        type: type || 'restaurant',
        keyword: keyword || name,
        key: apiKey,
      },
    });

    if (response.data.status && response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return errorResponse(res, `Google API Error: ${response.data.status}`, 400, response.data.error_message);
    }

    const rawResults = response.data.results || [];

    const places = rawResults.map((item: any) => ({
      place_id: item.place_id,
      name: item.name,
      vicinity: item.vicinity,
      koordinat: {
        lat: item.geometry?.location?.lat,
        lng: item.geometry?.location?.lng,
      },
      items: [], // Placeholder items agar sesuai dengan standar response format
    }));

    return successResponse(res, 'Data berhasil diambil', places);
  } catch (error: any) {
    return errorResponse(res, 'Gagal mengambil data tempat makan terdekat', 500, error);
  }
};

export const getRecommendedPlaces = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, 'Latitude (lat) and Longitude (lng) are required', 400);
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return errorResponse(res, 'Google API Key is not configured on the server', 500);
    }

    const googleUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const response = await axios.get(googleUrl, {
      params: {
        location: `${lat},${lng}`,
        radius: radius || 1500,
        type: 'restaurant',
        key: apiKey,
      },
    });

    if (response.data.status && response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return errorResponse(res, `Google API Error: ${response.data.status}`, 400, response.data.error_message);
    }

    const rawResults = response.data.results || [];

    // Filter: rating >= 4.0 dan user_ratings_total > 0
    const filteredResults = rawResults.filter((item: any) => 
      item.rating !== undefined && item.rating >= 4.0 &&
      item.user_ratings_total !== undefined && item.user_ratings_total > 0
    );

    // Sort: rating desc, jika sama, user_ratings_total desc
    filteredResults.sort((a: any, b: any) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.user_ratings_total - a.user_ratings_total;
    });

    const places = filteredResults.map((item: any) => ({
      place_id: item.place_id,
      name: item.name,
      vicinity: item.vicinity,
      koordinat: {
        lat: item.geometry?.location?.lat,
        lng: item.geometry?.location?.lng,
      },
      rating: item.rating,
      user_ratings_total: item.user_ratings_total,
      items: [], // Placeholder items agar sesuai dengan standar response format
    }));

    return successResponse(res, 'Data rekomendasi berhasil diambil', places);
  } catch (error: any) {
    return errorResponse(res, 'Gagal mengambil data rekomendasi tempat makan', 500, error);
  }
};

export const searchPlaces = async (req: Request, res: Response) => {
  try {
    const { lat, lng, type, radius } = req.query;

    if (!lat || !lng || !type) {
      return errorResponse(res, 'Latitude (lat), Longitude (lng), and Type (type) are required', 400);
    }

    if (type !== 'food' && type !== 'drink') {
      return errorResponse(res, 'Type must be either "food" or "drink"', 400);
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return errorResponse(res, 'Google API Key is not configured on the server', 500);
    }

    let includedTypes: string[] = [];
    if (type === 'food') {
      includedTypes = ['restaurant', 'fast_food_restaurant', 'meal_delivery', 'meal_takeaway'];
    } else {
      includedTypes = ['cafe', 'coffee_shop', 'bar'];
    }

    const googleUrl = 'https://places.googleapis.com/v1/places:searchNearby';
    const response = await axios.post(
      googleUrl,
      {
        includedTypes,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(lat as string),
              longitude: parseFloat(lng as string),
            },
            radius: parseInt(radius as string) || 1500,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.primaryType,places.location,places.rating',
        },
      }
    );

    const rawPlaces = response.data.places || [];

    const places = rawPlaces.map((item: any) => ({
      place_id: item.id,
      name: item.displayName?.text || '',
      vicinity: item.formattedAddress || '',
      koordinat: {
        lat: item.location?.latitude,
        lng: item.location?.longitude,
      },
      primaryType: item.primaryType || '',
      rating: item.rating,
      items: [], // Placeholder items agar sesuai dengan standar response format
    }));

    return successResponse(res, 'Data berhasil diambil', places);
  } catch (error: any) {
    return errorResponse(
      res,
      'Gagal melakukan pencarian tempat',
      500,
      error.response?.data?.error?.message || error.message || error
    );
  }
};
