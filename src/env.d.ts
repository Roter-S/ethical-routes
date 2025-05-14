/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly FIREBASE_PROJECT_ID: string;
  readonly FIREBASE_PRIVATE_KEY_ID: string;
  readonly FIREBASE_PRIVATE_KEY: string;
  readonly FIREBASE_CLIENT_EMAIL: string;
  readonly FIREBASE_CLIENT_ID: string;
  readonly FIREBASE_AUTH_URI: string;
  readonly FIREBASE_TOKEN_URI: string;
  readonly FIREBASE_AUTH_CERT_URL: string;
  readonly FIREBASE_CLIENT_CERT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        user?: {
            uid: string;
            email?: string | null;
            displayName?: string | null;
            photoURL?: string | null;
            emailVerified: boolean;
            isAdmin: boolean;
            // Agrega aquí cualquier otra propiedad que devuelva tu función getUser
        };
        // puedes añadir otras propiedades a locals si las necesitas
    }
}
