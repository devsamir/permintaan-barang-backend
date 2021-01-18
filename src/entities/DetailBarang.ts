import { IsDefined } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import Barang from "./Barang";
import User from "./User";

@Entity({ name: "detail_barang" })
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
  status: string;

  @Column("boolean", { default: true, select: false })
  active: boolean;
}
