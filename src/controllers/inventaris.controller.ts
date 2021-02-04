import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { v4 } from "uuid";
import catchAsync from "../utils/catchAsync";
import AutoId from "../entities/AutoId";
import DetailBarang from "../entities/DetailBarang";
import AppError from "../utils/appError";
import formError from "../utils/formError";
import { generate5Digit } from "../utils/helper";

export const createInventBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
  }
);
export const generateKodeBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { jenis } = req.params;
    const manager = getManager();
    let regen = true;
    let kodeBarang = "";
    while (regen) {
      const id = await manager.findOne(AutoId, { where: { namaId: jenis } });
      if (!id) return next(new AppError("Auto ID Tidak Ditemukan, Hubungi Samir !", 400));
      const cekBarang = await manager.findOne(DetailBarang, { where: { kodeBarang: id.noId, active: true } });
      if (!cekBarang) {
        kodeBarang = generate5Digit(id.noId);
        regen = false;
      } else {
        await manager.update(AutoId, { namaId: jenis }, { noId: id.noId + 1 });
      }
    }
  }
);
export const checkBarcode = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
  }
);
