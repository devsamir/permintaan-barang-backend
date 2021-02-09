import { IsDefined, MinLength } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from "typeorm";
import Barang from "./Barang";
import User from "./User";

@Entity({ name: "detail_barang" })
@Unique("kodeBarang", ["kodeBarang", "status", "active"])
export default class DetailBarang {
  @PrimaryColumn()
  @IsDefined()
  id: string;
  @ManyToOne(() => Barang, (Barang) => Barang.id, { nullable: false })
  @IsDefined({ message: "Barang Tidak Boleh Kosong !" })
  barang: string;
  @ManyToOne(() => User, (User) => User.id, { nullable: false })
  @IsDefined({ message: "Ruangan Tidak Boleh Kosong !" })
  user: string;

  @Column("enum", { enum: ["aktif", "tidak aktif"] })
  @IsDefined({ message: "Status Barang Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Status Barang Tidak Boleh Kosong !" })
  status: "aktif" | "tidak aktif";

  @Column({ length: "7" })
  @IsDefined({ message: "Kode Barang Tidal Boleh Kosong !" })
  @MinLength(1, { message: "Kode Barang Tidal Boleh Kosong !" })
  kodeBarang: string;
  @Column({ type: "date" })
  @IsDefined({ message: "Tanggal Barang Mulai Dipakai Harus Diisi !" })
  tanggalBarang: string;
  @Column("boolean", { default: true, select: false })
  active: boolean;
}
