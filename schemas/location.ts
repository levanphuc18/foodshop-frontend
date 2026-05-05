import { z } from 'zod';

export const provinceSchema = z.object({
  code: z.string(),
  name: z.string(),
  fullName: z.string(),
  codeName: z.string(),
});
export type Province = z.infer<typeof provinceSchema>;

export const districtSchema = z.object({
  code: z.string(),
  name: z.string(),
  fullName: z.string(),
  codeName: z.string(),
  provinceCode: z.string(),
});
export type District = z.infer<typeof districtSchema>;

export const wardSchema = z.object({
  code: z.string(),
  name: z.string(),
  fullName: z.string(),
  codeName: z.string(),
  districtCode: z.string(),
});
export type Ward = z.infer<typeof wardSchema>;
