import { type Document } from "mongoose"

export type MDoc = Simplify<
  Document & {
    createdAt: Date
    updatedAt: Date
  }
>

export type Simplify<T> = { [K in keyof T]: T[K] }
