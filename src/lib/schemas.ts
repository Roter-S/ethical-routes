import { zfd } from "zod-form-data";
import { z } from "zod";

const userPasswordSchema = z.object({
  email: zfd.text(z.string().email()),
  password: zfd.text(
    z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
  ),
});

const birthdaySchema = z.object({
  name: zfd.text(
    z.string().min(2, "El nombre debe tener al menos 2 personajes de largo")
  ),
  affiliation: zfd.text(
    z
      .string()
      .min(1, "La afiliación debe tener al menos 1 carácter de largo")
      .optional()
  ),
  month: zfd.numeric(
    z.number().min(1, "El mes debe estar entre 1 y 12").max(12)
  ),
  day: zfd.numeric(z.number().min(1).max(31)),
  year: zfd.numeric(
    z.number().min(1900, "El año debe ser entre 1900 y 2021").optional()
  ),
});

const birthdaySchemaWithId = birthdaySchema.extend({
  authorId: zfd.text(z.string()),
});

const register = userPasswordSchema
  .extend({
    name: zfd.text(
      z.string().min(2, "El nombre debe tener al menos 2 personajes de largo")
    ),
    confirmPassword: zfd.text(
      z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = zfd.formData(userPasswordSchema);
export const registerSchema = zfd.formData(register);
export const createBirthdaySchema = zfd.formData(birthdaySchema);
export const updateBirthdaySchema = zfd.formData(birthdaySchemaWithId);
