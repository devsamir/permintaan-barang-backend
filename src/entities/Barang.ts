import { IsDefined, MinLength } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class Barang {
  //
  @PrimaryColumn()
  id: string;
  //
  @Column()
  @IsDefined({ message: "Nama Barang Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Nama Barang Tidak Boleh Kosong !" })
  namaBarang: string;
  //
  @Column("enum", {
    enum: ["medis", "nonMedis"],
  })
  @IsDefined({ message: "Jenis Barang Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Jenis Barang Tidak Boleh Kosong !" })
  jenisBarang: string;
  //
  @Column({ nullable: true })
  fotoBarang: string;

  @Column("text", { nullable: true })
  keterangan: string;
  @Column("boolean", { default: true, select: false })
  active: boolean;
}
