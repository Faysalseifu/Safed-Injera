import { Request, Response } from 'express';
import {
  getAllBranches,
  getBranchById,
  getMainHubBranch,
  getBranchesExcludingMainHub,
  createBranch,
} from '../repositories/branchRepository';
import logger from '../utils/logger';

export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await getAllBranches();
    res.json(branches);
  } catch (error) {
    logger.error('Get branches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await getBranchById(id);
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }
    res.json(branch);
  } catch (error) {
    logger.error('Get branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMainHub = async (req: Request, res: Response): Promise<void> => {
  try {
    const branch = await getMainHubBranch();
    if (!branch) {
      res.status(404).json({ message: 'Main Hub not configured' });
      return;
    }
    res.json(branch);
  } catch (error) {
    logger.error('Get main hub error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBranchOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await getBranchesExcludingMainHub();
    res.json(branches);
  } catch (error) {
    logger.error('Get branch options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBranchHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, isMainHub } = req.body;
    if (!name || !location) {
      res.status(400).json({ message: 'Name and location are required' });
      return;
    }
    const branch = await createBranch({
      name,
      location,
      is_main_hub: isMainHub ?? false,
    });
    logger.info(`Branch created: ${name}`);
    res.status(201).json(branch);
  } catch (error) {
    logger.error('Create branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
