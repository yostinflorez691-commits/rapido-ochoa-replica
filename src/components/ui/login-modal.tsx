"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular llamada al API
    setTimeout(() => {
      setIsLoading(false);
      alert(
        isRegistering
          ? "Registro exitoso. Por favor inicia sesión."
          : "Funcionalidad de login pendiente de implementar en el backend"
      );
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="modal-content relative"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-[#636e72] transition-colors hover:bg-gray-100 hover:text-[#2d3436]"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Logo/Título */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#B42121]">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#B42121]">
                {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
              </h2>
              <p className="mt-1 text-sm text-[#636e72]">
                {isRegistering
                  ? "Regístrate para comprar tus pasajes"
                  : "Ingresa a tu cuenta de Rapido Ochoa"}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d3436]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]" />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-[#dee2e6] py-3 pl-10 pr-4 text-[16px] transition-colors focus:border-[#1F8641] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d3436]">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-[#dee2e6] py-3 pl-10 pr-12 text-[16px] transition-colors focus:border-[#1F8641] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#636e72]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password (solo en login) */}
              {!isRegistering && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-[#1F8641] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F8641] py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#1a7339] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>{isRegistering ? "Crear cuenta" : "Ingresar"}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#dee2e6]" />
              <span className="text-sm text-[#636e72]">o</span>
              <div className="h-px flex-1 bg-[#dee2e6]" />
            </div>

            {/* Toggle Register/Login */}
            <p className="text-center text-[14px] text-[#636e72]">
              {isRegistering ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="font-semibold text-[#B42121] hover:underline"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
