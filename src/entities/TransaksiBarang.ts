import { IsDate, IsDefined } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import DetailBarang from "./DetailBarang";
import User from "./User";

@Entity({ name: "transaksi_barang" })
export default class TransaksiBarang {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @ManyToOne(() => DetailBarang, (DetailBarang) => DetailBarang.id, { nullable: false })
  barang: string;
  @Column("date")
  @IsDefined({ message: "Tanggal Tidak Boleh Kosong !" })
  @IsDate({ message: "Format Tanggal Salah !" })
  tanggal: Date;
  @ManyToOne(() => User, (User) => User.id, { nullable: false })
  @IsDefined({ message: "Ruangan Tidak Boleh Kosong !" })
  user: string;
  @Column("enum", { enum: ["masuk", "pindah", "keluar"] })
  @IsDefined({ message: "Status Transaksi Tidak Boleh Kosong" })
  status: "masuk" | "pindah" | "keluar";
  @Column("text", { nullable: true })
  keterangan: string;
}
