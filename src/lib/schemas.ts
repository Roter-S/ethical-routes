import { zfd } from "zod-form-data";
import { z } from "zod";

const userPasswordSchema = z.object({
  email: zfd.text(z.string().email()),
  password: zfd.text(
    z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
  ),
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
