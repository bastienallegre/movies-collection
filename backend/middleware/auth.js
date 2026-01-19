import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour protéger les routes (authentification requise)
export const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est dans le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token du header "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // Vérifier et décoder le token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi'
      );

      // Récupérer l'utilisateur depuis la base de données (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);

      // Gérer les différents types d'erreurs JWT
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token invalide'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expiré, veuillez vous reconnecter'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Non autorisé'
      });
    }
  }

  // Si aucun token n'est fourni
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Accès non autorisé, token manquant'
    });
  }
};

// Middleware pour restreindre l'accès par rôle
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource`
      });
    }

    next();
  };
};

// Middleware optionnel : récupère l'utilisateur si un token est fourni, mais ne bloque pas
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // En cas d'erreur, on continue sans utilisateur
      req.user = null;
    }
  }

  next();
};
