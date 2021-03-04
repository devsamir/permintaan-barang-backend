import fs from "fs";
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
    cb(null, `barang-${new Date().getTime()}-${v4()}.${ext}`);
  },
} as DiskStorageOptions);

const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  cb(null, true);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
export const uploadImageBarang = upload.single("image");
export const getAllBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page, limit, search, sort }: any = req.query;
    const manager = getManager();
    let query = "";
    let queryCount = "";
    if (search) {
      const fields = ["namaBarang"];
      const searchQuery = fields.map((item) => `${item} like '%${search}%'`).join(" or ");
      query += ` and (${searchQuery})`;
      queryCount += ` and (${searchQuery})`;
    }
    if (sort) {
      query += ` order by ${sort.split("_")[0]} ${sort.split("_")[1]} `;
    }
    if (page && limit) {
      const take = page * limit;
      const skip = (page - 1) * limit;
      query += ` limit ${take} offset ${skip}`;
    }
    const barang = await manager.query(`select * from barang where active=true ${query}`);
    const count = await manager.query(`select count(*) as result from barang where active=true ${queryCount}`);
    barang.forEach((item: any) => {
      item.active = undefined;
      if (item.jenisBarang === "medis") item.jenisBarang = "Barang Medis";
      if (item.jenisBarang === "nonMedis") item.jenisBarang = "Barang Non Medis";
    });
    res.status(200).json({ data: barang, result: count[0].result });
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
export const updateBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
    const { id } = req.params;
    const manager = getManager();

    const barang = await manager.findOne(Barang, { where: { id } });
    if (!barang) return next(new AppError("Barang Dengan ID yang diberikan Tidak Ditemukan !", 400));
    if (req.file) {
      try {
        fs.unlinkSync(barang.fotoBarang);
      } catch (e) {
        console.log(e);
      }
    }
    let path = barang.fotoBarang;
    if (req.file) path = req.file.path;
    const updatedBarang = manager.create(Barang, { ...body, id, fotoBarang: path });
    const errors = await validate(updatedBarang);
    if (errors.length > 0) return formError(errors, res);
    await manager.save(updatedBarang);
    res.status(200).json(updatedBarang);
  }
);

export const deleteBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { barang } = req.body;
    const manager = getManager();
    await Promise.all(
      barang.map((id: string) => {
        return manager.update(Barang, { id }, { active: false });
      })
    );
    res.status(204).json(null);
  }
);
