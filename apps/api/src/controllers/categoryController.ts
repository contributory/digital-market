import { Request, Response } from 'express';
import { productStore } from '../models/productStore';

export const getCategories = (_req: Request, res: Response) => {
  const categories = productStore.getAllCategories();
  res.json({
    status: 'success',
    data: categories,
  });
};

export const getCategoryById = (req: Request, res: Response) => {
  const { id } = req.params;
  const category = productStore.getCategoryById(id);

  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found',
    });
  }

  res.json({
    status: 'success',
    data: category,
  });
};

export const getCategoryBySlug = (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = productStore.getCategoryBySlug(slug);

  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found',
    });
  }

  res.json({
    status: 'success',
    data: category,
  });
};
