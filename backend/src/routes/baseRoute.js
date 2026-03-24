import express from 'express';

/**
 * @description Helper function to create standard CRUD routes
 * @param {string} resourceName - Name of the resource (e.g., 'tasks', 'groups')
 * @param {Object} controller - Instance of the controller containing CRUD methods
 * @param {Array} middlewares - Array of middlewares to apply to all routes
 * @returns {express.Router}
 */
export const createBaseRouter = (resourceName, controller, middlewares = {}) => {
  const router = express.Router();

  // Helper to get middlewares for a specific method
  const getMw = (method) => {
    if (Array.isArray(middlewares)) return middlewares;
    return middlewares[method] || middlewares.all || [];
  };

  // Creat
  router.post(`/${resourceName}`, ...getMw('create'), controller.create);

  // Get All
  router.get(`/${resourceName}`, ...getMw('getAll'), controller.getAll);

  // Get By ID
  router.get(`/${resourceName}/:id`, ...getMw('getById'), controller.getById);

  // Update
  router.put(`/${resourceName}/:id`, ...getMw('update'), controller.update);

  // Delete
  router.delete(`/${resourceName}/:id`, ...getMw('delete'), controller.delete);

  return router;
};
