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
import User from "../entities/User";
import Barang from "../entities/Barang";

export const createInventBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;
    const manager = getManager();

    // 1. Check Apakah Barang valid
    const checkbarang = await manager.findOne(Barang, { where: { id: body.barang } });
    if (!checkbarang) return next(new AppError("Barang dengan ID yang Diberikan Tidak Ditemukan !", 400));
    // 2. Check Terlebih dahulu apakah role user adalah ruangan
    const checkRoleUser = await manager.findOne(User, { where: { id: body.user } });
    if (!checkRoleUser) return next(new AppError("User Tidak Ditemukan !", 400));
    if (checkRoleUser.role !== "ruangan") return next(new AppError("Role Yang Dimiliki User Bukan Ruangan !", 400));
    // 3. Check Kode Barang Valid
    if (!(body.kodeBarang.toLowerCase().startsWith("u") || body.kodeBarang.toLowerCase().startsWith("m")))
      return next(new AppError("Format Kode Barang Tidak Valid !", 400));
    const kodeInventaris = v4();
    const newBarang = manager.create(DetailBarang, {
      ...body,
      id: kodeInventaris,
      status: "aktif",
      tanggalBarang: new Date(body.tanggal),
    });
    const newTransaksi = manager.create(TransaksiBarang, {
      ...body,
      status: "masuk",
      tanggal: new Date(body.tanggal),
      barang: kodeInventaris,
    });
    const [errorsBarang, errorsTransaksi] = await Promise.all([validate(newBarang), validate(newTransaksi)]);
    if (errorsBarang.length > 0) return formError(errorsBarang, res);
    if (errorsTransaksi.length > 0) return formError(errorsTransaksi, res);
    await manager.save(newBarang);
    await manager.save(newTransaksi);
    res.status(200).json({ barang: newBarang, transaksi: newTransaksi });
  }
);
export const getInventBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { type, id } = req.body;
    if (type === "ruang") {
      // const barangInventarisReq = await manager.find(DetailBarang, {
      //   where: { user: id, active: true, status: "aktif" },
      //   relations:[]
      // });
      manager.query("select ");
    } else if (type === "barang") {
    }
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
      if (!id) return next(new AppError("Auto ID Tidak Ditemukan, Hubungi Developer !", 400));
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
