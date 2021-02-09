import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { v4 } from "uuid";
import catchAsync from "../utils/catchAsync";
import AutoId from "../entities/AutoId";
import DetailBarang from "../entities/DetailBarang";
import TransaksiBarang from "../entities/TransaksiBarang";
import AppError from "../utils/appError";
import formError from "../utils/formError";
import { generate5Digit } from "../utils/helper";

export const createInventBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
    const manager = getManager();
    const newBarang = manager.create(DetailBarang, { ...body, id: v4(), status: "aktif" });
    const newTransaksi = manager.create(TransaksiBarang, { ...body, status: "masuk" });
    const [errorsBarang, errorsTransaksi] = await Promise.all([validate(newBarang), validate(newTransaksi)]);
    if (errorsBarang.length > 0) return formError(errorsBarang, res);
    if (errorsTransaksi.length > 0) return formError(errorsTransaksi, res);
    await manager.save([newBarang, newTransaksi]);
    res.status(200).json({ barang: newBarang, transaksi: newTransaksi });
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
      const cekBarang = await manager.findOne(DetailBarang, {
        where: { kodeBarang: id.noId, status: "aktif", active: true },
      });
      if (!cekBarang) {
        if (jenis === "medis") kodeBarang = `m${generate5Digit(id.noId)}`;
        if (jenis === "nonMedis") kodeBarang = `u${generate5Digit(id.noId)}`;

        regen = false;
      } else {
        await manager.update(AutoId, { namaId: jenis }, { noId: id.noId + 1 });
      }
    }
    res.status(200).json(kodeBarang);
  }
);
export const checkKodeBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { kodeBarang } = req.params;
    const manager = getManager();
    const cekKode = await manager.findOne(DetailBarang, { where: { kodeBarang, active: true, status: "aktif" } });
    if (cekKode) return next(new AppError("Kode Barang Tidak Tersedia", 400));
    res.status(200).json({
      available: true,
    });
  }
);
