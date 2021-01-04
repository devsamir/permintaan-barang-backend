import { IsDefined, MinLength } from "class-validator";
import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

// enum Role {
//   Ruangan = "ruangan",
//   TimPenapisan = "timPenapisan",
//   TimPengadaan = "timPengadaan",
//   Atem = "atem",
//   ManagerKeuangan = "managerKeuangan",
//   ManagerPelayanan = "managerPelayanan",
//   Admin = "admin",
// }

@Entity()
@Unique("Nama", ["name", "role", "active"])
export default class User {
  @PrimaryColumn()
  id: string;
  @Column()
  @IsDefined({ message: "Username Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Username Tidak Boleh Kosong !" })
  username: string;
  @Column()
  @IsDefined({ message: "Password Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Password Tidak Boleh Kosong !" })
  password: string;
  @Column()
  @IsDefined({ message: "Nama Tidak Boleh Kosong !" })
  @MinLength(1, { message: "Nama Tidak Boleh Kosong !" })
  name: string;
  @Column("enum", {
    enum: ["ruangan", "timPenapisan", "timPengadaan", "atem", "managerKeuangan", "managerPelayanan", "admin"],
  })
  @IsDefined()
  role: string;
  @Column("boolean", { default: true, select: false })
  active: boolean;
}
