import { Router } from 'express';
import { toggleFavoriteController, getFavoritesController } from '../controllers/favorite.controllers';
import { verifyAccessToken } from '../middlewares/auth.middleware';

export const favoriteRoutes = Router();

favoriteRoutes.use(verifyAccessToken);

favoriteRoutes.get('/', getFavoritesController);
favoriteRoutes.post('/toggle/:doctorId', toggleFavoriteController);
