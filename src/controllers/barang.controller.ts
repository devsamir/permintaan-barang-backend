import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { v4 } from "uuid";
import multer, { DiskStorageOptions, FileFilterCallback } from "multer";

import catchAsync from "../utils/catchAsync";
import Barang from "../entities/Barang";
import AppError from "../utils/appError";
import formError from "../utils/formError";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".")[1];
    if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "png") {
      cb(null, `barang-${new Date().getTime()}-${v4()}.${ext}`);
    }
  },
} as DiskStorageOptions);

const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = file.originalname.split(".")[1];
  if (ext.toLowerCase().startsWith("jpg") || ext.toLowerCase().startsWith("png")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
export const uploadImageBarang = upload.single("image");
export const getAllBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page, limit, search, sort }: any = req.query;
    const manager = getManager();
    let query = "";
    if (search) {
      const fields = ["namaBarang", "jenisBarang", "qty", "keterangan"];
      const searchQuery = fields.map((item) => `${item} like '%${search}%'`).join(" or ");
      query += ` and (${searchQuery})`;
    }
    if (page && limit) {
      const take = page * limit;
      const skip = (page - 1) * limit;
      query += ` limit ${take} offset ${skip}`;
    }
    if (sort) {
      query += ` order by ${sort.split("_")[0]} ${sort.split("_")[1]} `;
    }
    const barang = await manager.query(`select * from barang where 1 ${query}`);
    res.status(200).json(barang);
  }
);
export const createBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
    let path = "-";
    if (req.file) path = req.file.path;
    const manager = getManager();
    const newBarang = manager.create(Barang, { id: v4(), fotoBarang: path, ...body });
    const errors = await validate(newBarang);
    if (errors.length > 0) return formError(errors, res);
    await manager.save(newBarang);
    res.status(201).json(newBarang);
  }
);
