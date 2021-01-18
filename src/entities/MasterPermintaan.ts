import { IsDefined, MinLength } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "master_permintaan" })
export default class MasterPermintaan {
  @PrimaryColumn()
  kodePr: string;
  @Column()
  @IsDefined({ message: "Nama Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Nama Tidak Boleh Kosong !" })
  name: string;
}
