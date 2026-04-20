import instance from "./axiosInstance";

export const getIngredients = () => instance.get("/inventory/ingredients/");

export const createIngredient = (data) =>
  instance.post("/inventory/ingredients/", data);
export const updateIngredient = (id, data) =>
  instance.patch(`/inventory/ingredients/${id}/`, data);

export const addStock = (data) => instance.post("/inventory/purchases/", data);

export const getMenuItems = () => instance.get("/menu/menu-items/");

export const getRecipes = () => instance.get("/inventory/recipes/");

export const addRecipeIngredient = (data) =>
  instance.post("/inventory/recipes/", data);

export const deleteRecipe = (id) =>
  instance.delete(`/inventory/recipes/${id}/`);

export const getStockMovements = (params) =>
  instance.get("/inventory/stock-movements/", { params });

export const adjustStock = (data) =>
  instance.post("/inventory/adjust-stock/", data);

export const getInventorySummary = () =>
  instance.get("/inventory/inventory-summary/");
