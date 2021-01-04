import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";

import catchAsync from "../utils/catchAsync";
import User from "../entities/User";
import AppError from "../utils/appError";
import formError from "../utils/formError";

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const user = await manager.find(User, { select: ["id", "username", "name", "role"], where: { active: true } });
    res.status(200).json(user);
  }
);
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, name, role } = req.body;
    const manager = getManager();
    if (role === "managerKeuangan" || role === "managerPelayanan") {
      const [, count] = await manager.findAndCount(User, { where: { role, active: true } });
      if (count > 0) return next(new AppError(`User dengan role ${role} sudah ada`, 400));
    }
    const newPassword = await bcrypt.hash(password, 10);
    const newUser = manager.create(User, { id: v4(), name, role, username, password: newPassword });
    const errors = await validate(newUser);
    if (errors.length > 0) return formError(errors, res);
    await manager.save(newUser);
    res.status(201).json(newUser);
  }
);

export { getAllUser, createUser };
