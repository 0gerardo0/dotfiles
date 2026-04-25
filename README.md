# Dotfiles de Gerardo

Repositorio gestionado con [`chezmoi`](https://www.chezmoi.io/) para mantener y versionar mi entorno personal de desarrollo y escritorio en Arch Linux + Hyprland.

## Tecnologias y herramientas

- **Sistema**: Arch Linux
- **WM**: Hyprland
- **Shell**: ZSH con [Powerlevel10k](https://github.com/romkatv/powerlevel10k)
- **Terminal**: Kitty
- **Terminal Plugins**: ZSH plugins in dot_zshrc
- **Gestor de dotfiles**: [chezmoi](https://www.chezmoi.io/)
- **Editor**: Neovim with [NvChad](https://nvchad.com/)
- **Barra**: Waybar

---

## Estructura del repositorio

```
~/.local/share/chezmoi/
|
├── dot_config/
│   ├── hypr/            → Config de Hyprland
│   ├── kitty/           → Config de terminal
│   ├── nvim/            → Configuracion de Neovim
│   ├── waybar/          → Config de barra
│   ├── zsh/             → Plugins y Zsh extras
│   └── ...              → Otras configuraciones
│
├── dot_zshrc            → Config principal de ZSH
├── dot_p10k.zsh         → Tema Powerlevel10k
├── dot_pkglist          → Lista de paquetes instalados
├── dot_fonts/           → Fuentes personalizadas
└── dot_themes/          → Temas y colores
```

---

## Instalacion (restaurar dotfiles)

> Requiere tener `chezmoi` instalado.

```bash
sh -c "$(curl -fsLS get.chezmoi.io/lb)" -- init gerardozuniga --apply
```

---

## Restaurar paquetes del sistema

> Asumiendo que ya se tiene un AUR Helper

### Paquetes oficiales (`pacman`):

```bash
sudo pacman -S --needed - < ~/.pkglist
```

### Paquetes AUR [Instalar con un AUR helper deseado]:

```bash
paru -S --needed - < ~/.pkglist.aur
```

---

## Configuracion de Hyprland

Archivos principales en `~/.config/hypr/`:

- `hyprland.conf` - Configuracion principal
- `hyprpaper.conf` - Wallpaper
- `hyprlock.conf` - Pantalla de bloqueo
- `hypridle.conf` - Inactividad
- `autostart.conf` - Aplicaciones al iniciar
- `scripts/` - Scripts personalizados

---

## Documentacion adicional

- [config/kitty/OPTIMIZACION_TERMINAL.md](config/kitty/OPTIMIZACION_TERMINAL.md) - Notas de optimizacion de terminal

---

## Mejoras futuras

- Automatizar instalacion de extensiones
- Script `post-install.sh` para ajustes
- Capturas de pantalla del entorno

---

## Licencia

MIT. Libre para usar, modificar y adaptar.