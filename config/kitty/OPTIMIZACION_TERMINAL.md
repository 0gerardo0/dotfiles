# Optimizacion de Rendimiento de Terminal - ZSH

Fecha: 2026-04-24
Entorno: Hyprland (antes GNOME)

---

## RESUMEN

| Configuracion | Tiempo promedio |
|--------------|----------------|
| Original (todos los plugins) | 200-350ms por comando |
| Optimizada (sin syntax-highlighting + sin VCS) | 170-190ms por comando |

---

## SISTEMA ACTUAL

- Sistema: Arch Linux
- Display Manager: Hyprland (antes GNOME)
- Shell: ZSH con Powerlevel10k
- Terminal: Kitty
- Gestor de dotfiles: chezmoi

---

## OPTIMIZACIONES APLICADAS

### 1. Kitty (~/.config/kitty/kitty.conf)

repaint_delay 1
input_delay 0
sync_to_monitor yes

Antes: repaint_delay 10, input_delay 3

### 2. Compinit (~/.zshrc)

autoload -U compinit
compinit -C -d ~/.cache/zcompdump

Antes: compinit -i

### 3. Gitstatus/VCS (~/.zshrc)

typeset -g POWERLEVEL9K_VCS_DISABLE_GITSTATUS_FORMATTING=true
typeset -g POWERLEVEL9K_VCS_MAX_INDEX_SIZE_DIRTY=0

### 4. SSH Agent (~/.zshrc)

if [[ -z "$SSH_AUTH_SOCK" ]] || ! ssh-add -l >/dev/null 2>&1; then
    eval "$(ssh-agent -s)" >/dev/null
    ssh-add ~/.ssh/id_rsa 2>/dev/null || ssh-add ~/.ssh/id_ed25519 2>/dev/null
fi

### 5. syntax-highlighting DESHABILITADO (~/.zshrc)

# source ~/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

---

## RESULTADOS (BENCHMARKS)

| Test | Descripcion | CON plugins | SIN plugins | Mejora |
|------|------------|------------|------------|--------|
| Test 1 | ls simple | 210ms | 185ms | 12% |
| Test 2 | cat archivo | 291ms | 185ms | 36% |
| Test 3 | ls -la ~ | 241ms | 177ms | 27% |
| Test 4 | 500 chars | 193ms | 178ms | 8% |
| Test 5 | 5000 chars | 197ms | 157ms | 20% |
| Test 6 | alias ll | 198ms | 180ms | 9% |

---

## FUNCIONES DESHABILITADAS

- syntax-highlighting: Colores en comandos
- VCS/gitstatus: Rama git, indicadores staged/unstaged

---

## PROXIMOS PASOS (lazy loading)

Para futuro:
1. Lazy loading de syntax-highlighting
2. Lazy loading de gitstatus
3. Cargar bajo demanda

---

## ARCHIVOS RELACIONADOS

- ~/.zshrc
- ~/.config/kitty/kitty.conf
- ~/.config/hypr/hyprland.conf
- ~/.zsh/powerlevel10k/.p10k.zsh
- ~/.cache/zcompdump