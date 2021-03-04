import { Request, Response, NextFunction, query } from "express";
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
    console.log(body);

    const newBarang = manager.create(DetailBarang, {
      barangId: body.barang,
      hargaBeli: body.hargaBeli,
      kodeBarang: body.kodeBarang,
      userId: body.user,
      barang: body.barang,
      user: body.user,
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
export const getTotalBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { id, page, search } = req.query;

    const cekId = await manager.findOne(User, { where: { id, active: true, role: "ruangan" } });
    if (cekId) {
      let query = `select b.namaBarang,b.jenisBarang,b.fotoBarang,b.keterangan,b.id,count(d.id) as qty from barang b,detail_barang d where d.barangId = b.id and d.userId = '${id}' and status = 'aktif' and d.active = true`;
      let queryCount = `select count(distinct(b.id)) as result from barang b,detail_barang d where d.barangId = b.id and d.userId = '${id}' and status = 'aktif' and d.active = true`;
      if (search) {
        const fields = ["b.namaBarang", "b.jenisBarang", "b.keterangan"];
        const searchQuery = fields.map((item) => `${item} like '%${search}%'`).join(" or ");
        query += ` and (${searchQuery})`;
        queryCount += ` and (${searchQuery})`;
      }
      query += " group by b.id";
      if (page) {
        const skip = (Number(page) - 1) * 12;
        query += ` limit 12 offset ${skip}`;
      }
      const data = await manager.query(query);
      const [{ result }] = await manager.query(queryCount);
      res.status(200).json({ data, result });
    } else {
      let query = `select b.namaBarang,b.jenisBarang,b.fotoBarang,b.keterangan,b.id,count(d.id) as qty from barang b,detail_barang d where d.barangId = b.id and status = 'aktif' and d.active = true`;
      let queryCount = `select count(distinct(b.id)) as result from barang b,detail_barang d where d.barangId = b.id and status = 'aktif' and d.active = true`;
      if (search) {
        const fields = ["b.namaBarang", "b.jenisBarang", "b.keterangan"];
        const searchQuery = fields.map((item) => `${item} like '%${search}%'`).join(" or ");
        query += ` and (${searchQuery})`;
        queryCount += ` and (${searchQuery})`;
      }
      query += " group by b.id";
      if (page) {
        const skip = (Number(page) - 1) * 12;
        query += ` limit 12 offset ${skip}`;
      }
      const data = await manager.query(query);
      const [{ result }] = await manager.query(queryCount);

      res.status(200).json({ data, result });
    }
  }
);
export const getDetailTotalBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { barang } = req.params;
    const { page, limit, search, sort }: any = req.query;
    const manager = getManager();
    let query = `select d.id,d.kodeBarang,d.tanggalBarang,b.namaBarang,u.name,d.hargaBeli from detail_barang d,barang b,user u where d.barangId = b.id and d.userId = u.id and d.barangId = '${barang}' and d.status='aktif' and d.active = true`;
    let queryCount = `select count(d.id) as result from detail_barang d,barang b,user u where d.barangId = b.id and d.userId = u.id and d.barangId = '${barang}' and d.status='aktif' and d.active = true`;
    if (search) {
      const fields = ["d.kodeBarang", "b.namaBarang", "b.jenisBarang", "u.name", "d.hargaBeli"];
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
    const reqOneBarang = manager.findOne(Barang, { where: { id: barang } });
    const reqBarang = manager.query(query);
    const reqResult = manager.query(queryCount);
    const [barangData, [{ result }], oneBarang] = await Promise.all([reqBarang, reqResult, reqOneBarang]);
    res.status(200).json({ data: barangData, result, barang: oneBarang });
  }
);
export const getAllRuangan = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const ruangan = await manager.find(User, { where: { active: true, role: "ruangan" } });
    res.status(200).json(ruangan);
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
      const cekKode = jenis === "medis" ? `M${generate5Digit(id.noId)}` : `U${generate5Digit(id.noId)}`;
      const cekBarang = await manager.findOne(DetailBarang, {
        where: { kodeBarang: cekKode, status: "aktif", active: true },
      });

      if (!cekBarang) {
        if (jenis === "medis") kodeBarang = `M${generate5Digit(id.noId)}`;
        if (jenis === "nonMedis") kodeBarang = `U${generate5Digit(id.noId)}`;

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
export const deleteDetailBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { barangs } = req.body;
    await Promise.all(
      barangs.map(async (id: string) => {
        await manager.update(DetailBarang, { id }, { active: false });
        return true;
      })
    );
    res.status(204).json(null);
  }
);

export const nonaktifkanBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { id } = req.params;
    const { tanggal, keterangan } = req.body;
    const barang = await manager.findOne(DetailBarang, {
      where: { id },
    });
    if (!barang) return next(new AppError("Barang Dengan ID yang Diberikan Tidak Ditemukan !", 400));
    console.log(barang);

    const newTransaksi = manager.create(TransaksiBarang, {
      barang: barang.id,
      keterangan,
      status: "keluar",
      tanggal: new Date(tanggal),
      user: barang.userId,
    });
    const errors = await validate(newTransaksi);
    if (errors.length > 0) return formError(errors, res);
    await manager.update(DetailBarang, { id }, { status: "tidak aktif" });
    await manager.save(newTransaksi);

    res.status(204).json(null);
  }
);

export const pindahBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { id } = req.params;
    const { tanggal, keterangan, user } = req.body;
    const barang = await manager.findOne(DetailBarang, { where: { id } });
    if (!barang) return next(new AppError("Barang Dengan ID yang Diberikan Tidak Ditemukan !", 400));
    barang.user = user;

    const newTransaksi = manager.create(TransaksiBarang, {
      barang: barang.id,
      keterangan,
      status: "pindah",
      tanggal: new Date(tanggal),
      user,
    });
    const errors = await validate(newTransaksi);
    if (errors.length > 0) return formError(errors, res);

    await manager.save(barang);
    await manager.save(newTransaksi);
    res.status(200).json(barang);
  }
);
export const riwayatBarang = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const manager = getManager();
    const { id } = req.params;
    const reqBarang = manager.query(
      "select b.id as barang,b.namaBarang,b.jenisBarang,b.keterangan,b.fotoBarang,d.id,u.name,d.kodeBarang,d.tanggalBarang,d.hargaBeli from barang b,detail_barang d,user u where d.userId = u.id and d.barangId = b.id and d.id = ?",
      [id]
    );
    const reqTransaksi = manager.query(
      "select t.id,t.tanggal,t.status,t.keterangan,u.name from transaksi_barang t,user u where t.userId = u.id and t.barangId = ?",
      [id]
    );
    const [[barang], transaksi] = await Promise.all([reqBarang, reqTransaksi]);
    res.status(200).json({ barang, transaksi });
  }
);
