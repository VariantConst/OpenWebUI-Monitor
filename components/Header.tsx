"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Dropdown, Modal } from "antd";
import { toast, Toaster } from "sonner";
import type { MenuProps } from "antd";
import {
  Copy,
  LogOut,
  Database,
  Github,
  Menu,
  Globe,
  X,
  Settings,
  ChevronDown,
} from "lucide-react";
import DatabaseBackup from "./DatabaseBackup";
import { APP_VERSION } from "@/lib/version";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiDatabase, FiUsers, FiBarChart2 } from "react-icons/fi";

export default function Header() {
  const { t, i18n } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleLanguageChange = async (newLang: string) => {
    await i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const isTokenPage = pathname === "/token";

  if (isTokenPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16">
          <div className="h-full flex items-center justify-between">
            <div className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-transparent">
              {t("common.appName")}
            </div>
            <button
              className="p-2 rounded-lg hover:bg-gray-50/80 transition-colors relative group"
              onClick={() =>
                handleLanguageChange(i18n.language === "zh" ? "en" : "zh")
              }
            >
              <Globe className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200 shadow-sm px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i18n.language === "zh"
                  ? t("header.language.zh")
                  : i18n.language === "zh-tw"
                    ? t("header.language.zh-tw")
                    : t("header.language.en")
                  }
              </span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  const [apiKey, setApiKey] = useState(t("common.loading"));

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setAccessToken(token);

    if (!token) {
      router.push("/token");
      return;
    }

    fetch("/api/v1/config", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("access_token");
          router.push("/token");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {
        setApiKey(t("common.error"));
        localStorage.removeItem("access_token");
        router.push("/token");
      });
  }, [router, t]);

  const handleCopyApiKey = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error(t("header.messages.unauthorized"));
      return;
    }
    navigator.clipboard.writeText(apiKey);
    toast.success(t("header.messages.apiKeyCopied"));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/token";
  };

  const checkUpdate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error(t("header.messages.unauthorized"));
      return;
    }

    setIsCheckingUpdate(true);
    try {
      const response = await fetch(
        "https://api.github.com/repos/variantconst/openwebui-monitor/releases/latest"
      );
      const data = await response.json();
      const latestVersion = data.tag_name;

      if (!latestVersion) {
        throw new Error(t("header.messages.getVersionFailed"));
      }

      const currentVer = APP_VERSION.replace(/^v/, "");
      const latestVer = latestVersion.replace(/^v/, "");

      if (currentVer === latestVer) {
        toast.success(`${t("header.messages.latestVersion")} v${APP_VERSION}`);
      } else {
        return new Promise((resolve) => {
          const dialog = document.createElement("div");
          document.body.appendChild(dialog);

          const DialogComponent = () => {
            const [open, setOpen] = useState(true);

            const handleClose = () => {
              setOpen(false);
              document.body.removeChild(dialog);
              resolve(null);
            };

            const handleUpdate = () => {
              window.open(
                "https://github.com/VariantConst/OpenWebUI-Monitor/releases/latest",
                "_blank"
              );
              handleClose();
            };

            return (
              <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="w-[calc(100%-2rem)] !max-w-[70vw] sm:max-w-[425px] rounded-lg">
                  <DialogHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                        <Github className="w-4 h-4 text-gray-500" />
                      </div>
                      <DialogTitle className="text-base sm:text-lg">
                        {t("header.update.newVersion")}
                      </DialogTitle>
                    </div>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 sm:gap-4 py-3 sm:py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-muted-foreground">
                        {t("header.update.currentVersion")}
                      </span>
                      <span className="font-mono text-sm sm:text-base">
                        v{APP_VERSION}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-muted-foreground">
                        {t("header.update.latestVersion")}
                      </span>
                      <span className="font-mono text-sm sm:text-base text-primary">
                        {latestVersion}
                      </span>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="h-8 sm:h-10 text-sm sm:text-base"
                    >
                      {t("header.update.skipUpdate")}
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      className="h-8 sm:h-10 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {t("header.update.goToUpdate")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          };

          createRoot(dialog).render(<DialogComponent />);
        });
      }
    } catch (error) {
      toast.error(t("header.messages.updateCheckFailed"));
      console.error(t("header.messages.updateCheckFailed"), error);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const navigationItems = [
    {
      path: "/models",
      icon: <FiDatabase className="w-5 h-5" />,
      label: t("home.features.models.title"),
      color: "from-blue-500/10 to-indigo-500/10",
      hoverColor: "group-hover:text-blue-600",
    },
    {
      path: "/users",
      icon: <FiUsers className="w-5 h-5" />,
      label: t("home.features.users.title"),
      color: "from-rose-500/10 to-pink-500/10",
      hoverColor: "group-hover:text-rose-600",
    },
    {
      path: "/panel",
      icon: <FiBarChart2 className="w-5 h-5" />,
      label: t("home.features.stats.title"),
      color: "from-emerald-500/10 to-teal-500/10",
      hoverColor: "group-hover:text-emerald-600",
    },
  ];

  const settingsItems = [
    {
      icon: <Copy className="w-5 h-5" />,
      label: t("header.menu.copyApiKey"),
      onClick: handleCopyApiKey,
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: t("header.menu.dataBackup"),
      onClick: () => setIsBackupModalOpen(true),
      color: "from-rose-500/20 to-pink-500/20",
    },
    {
      icon: <Github className="w-5 h-5" />,
      label: t("header.menu.checkUpdate"),
      onClick: checkUpdate,
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: t("header.menu.logout"),
      onClick: handleLogout,
      color: "from-orange-500/20 to-red-500/20",
    },
  ];

  const menuItems = [
    ...(!isTokenPage
      ? navigationItems.map((item) => ({
          ...item,
          onClick: () => router.push(item.path),
        }))
      : []),
    {
      icon: <Copy className="w-5 h-5" />,
      label: t("header.menu.copyApiKey"),
      onClick: handleCopyApiKey,
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: t("header.menu.dataBackup"),
      onClick: () => setIsBackupModalOpen(true),
      color: "from-rose-500/20 to-pink-500/20",
    },
    {
      icon: <Github className="w-5 h-5" />,
      label: t("header.menu.checkUpdate"),
      onClick: checkUpdate,
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: t("header.menu.logout"),
      onClick: handleLogout,
      color: "from-orange-500/20 to-red-500/20",
    },
  ];

  const actionItems = [
    {
      icon: <Globe className="w-5 h-5" />,
      label: i18n.language === "zh"
        ? "简体中文"
        : i18n.language === "zh-tw"
        ? "繁體中文"
        : "English",
      onClick: () =>
        handleLanguageChange(
          i18n.language === "zh"
            ? "en"
            : i18n.language === "zh-tw"
            ? "zh"
            : "zh-tw"
        ),
      color: "from-gray-100 to-gray-50",
      hoverColor: "group-hover:text-gray-900",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: t("header.menu.settings"),
      onClick: () => setIsMenuOpen(true),
      color: "from-gray-100 to-gray-50",
      hoverColor: "group-hover:text-gray-900",
    },
  ];

  return (
    <>
      <Toaster
        richColors
        position="top-center"
        theme="light"
        expand
        duration={1500}
      />
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16">
          <div className="h-full flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-transparent"
              >
                {t("common.appName")}
              </Link>
            </motion.div>

            <div className="flex items-center gap-4">
              {!isTokenPage && (
                <div className="hidden md:flex items-center gap-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="group relative"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r hover:bg-gradient-to-br transition-all duration-300 relative">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300`}
                        />
                        <span
                          className={`relative z-10 ${item.hoverColor} transition-colors duration-300`}
                        >
                          {item.icon}
                        </span>
                        <span className="relative z-10 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                {actionItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="group relative"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r hover:bg-gradient-to-br transition-all duration-300 relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300`}
                      />
                      <span
                        className={`relative z-10 ${item.hoverColor} transition-colors duration-300`}
                      >
                        {item.icon}
                      </span>
                      <span className="relative z-10 hidden md:block text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:bg-black/10"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full bg-white/95 backdrop-blur-xl z-50 w-full max-w-[480px] md:top-[calc(4rem+0.5rem)] md:h-auto md:mr-6 md:rounded-2xl md:border md:shadow-xl md:max-h-[calc(100vh-5rem)] overflow-hidden shadow-lg border-l border-gray-100/50"
            >
              <div className="relative h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
                  <h2 className="text-lg font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {t("header.menu.settings")}
                  </h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    <div className="md:hidden space-y-1">
                      {navigationItems.map((item, index) => (
                        <motion.button
                          key={item.path}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push(item.path);
                          }}
                          className="w-full group"
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                            <span
                              className={`${item.hoverColor} transition-colors duration-300`}
                            >
                              {item.icon}
                            </span>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                              {item.label}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="border-t border-gray-100/50 pt-2 md:border-t-0 md:pt-0">
                      {settingsItems.map((item, index) => (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              (index + navigationItems.length * 0.05) * 0.05,
                          }}
                          onClick={() => {
                            setIsMenuOpen(false);
                            item.onClick();
                          }}
                          className="w-full group"
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                            <span className="text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
                              {item.icon}
                            </span>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                              {item.label}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DatabaseBackup
        open={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        token={accessToken || undefined}
      />
    </>
  );
}
