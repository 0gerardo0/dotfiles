# Dotfiles de Gerardo

Repositorio gestionado con [`chezmoi`](https://www.chezmoi.io/) para mantener y versionar mi entorno personal de desarrollo y escritorio en Arch Linux + GNOME.

## 🧰 Tecnologías y herramientas

- **Sistema**: Arch Linux  
- **DE**: GNOME  
- **Shell**: ZSH con [Powerlevel10k](https://github.com/romkatv/powerlevel10k)  
- **Terminal**: Kitty
- **Terminal Plugins**  ZSH plugings in dot_zshrc
- **Gestor de dotfiles**: [chezmoi](https://www.chezmoi.io/)  
- **Editor**: Neovim with [NvChad](https://nvchad.com/)
- **Temas y apariencia**: GTK, Shell themes, iconos, fuentes  
- **Extensiones**: GNOME Shell Extensions personalizadas  

---

## 🏗️ Estructura del repositorio

```
~/.local/share/chezmoi/
│
├── dot_config/
│   ├── gtk-3.0/         → Tema visual
│   ├── kitty/           → Config de terminal
│   ├── nvim/            → Configuración de Neovim
│   ├── zsh/             → Plugins y Zsh extras
│   └── ...              → Otras configuraciones
│
├── dot_zshrc            → Config principal de ZSH
├── dot_p10k.zsh         → Tema Powerlevel10k
├── dot_pkglist          → Lista de paquetes instalados
├── dot_fonts/           → Fuentes personalizadas
├── dot_themes/          → Temas GTK y GNOME Shell
└── dot_icons/           → Iconos personalizados
```

---

## 🚀 Instalación (restaurar dotfiles)

> Requiere tener `chezmoi` instalado.

```bash
sh -c "$(curl -fsLS get.chezmoi.io/lb)" -- init gerardozuniga --apply
```

---

## 📦 Restaurar paquetes del sistema

> Asumiendo que ya se tiene un AUR Helper

### 📦 Paquetes oficiales (`pacman`):

```bash
sudo pacman -S --needed - < ~/.pkglist
```

### 📦 Paquetes AUR:

```bash
yay -S --needed - < ~/.pkglist.aur
```

---

## 🎨 Apariencia y temas

Incluye:

- Temas GTK y Shell (`~/.themes`)



---

## 🧩 Extensiones GNOME

La lista de extensiones puede instalarse manualmente o mediante backup. Consulta tus extensiones activas:

```bash
gsettings get org.gnome.shell enabled-extensions
```

---

## 📌 Mejoras futuras

- Automatizar instalación de extensiones GNOME
- Script `post-install.sh` para ajustes visuales
- Snapshot de configuraciones `dconf` importantes
- Capturas de pantalla del entorno

---

## 📜 Licencia

MIT. Libre para usar, modificar y adaptar.

