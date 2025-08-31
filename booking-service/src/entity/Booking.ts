import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from "typeorm";
import { Resource } from "./Resource";

export enum BookingStatus {
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
}

@Entity({ name: "bookings" })
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Resource, (resource) => resource.bookings, { eager: true })
  resource!: Resource;

  @Column({ type: "timestamptz" })
  startTime!: Date;

  @Column({ type: "timestamptz" })
  endTime!: Date;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.BOOKED })
  status!: BookingStatus;

  @Column({ type: "uuid" })
  createdBy!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt!: Date | null;
}
