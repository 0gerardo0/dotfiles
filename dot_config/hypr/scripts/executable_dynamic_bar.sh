#!/bin/bash

# Definir tus monitores (Asegúrate de que los nombres sean correctos con `hyprctl monitors`)
MAIN_MONITOR="HDMI-A-1"
LAPTOP_BAR_CONFIG="$HOME/.config/waybar/config-edp"

# Función para verificar estado
check_fullscreen() {
    # Obtener info de la ventana activa en JSON
    ACTIVE_WINDOW=$(hyprctl activewindow -j)
    
    # Extraer si está fullscreen y en qué monitor está
    IS_FULLSCREEN=$(echo "$ACTIVE_WINDOW" | jq -r '.fullscreen')
    CURRENT_MONITOR=$(echo "$ACTIVE_WINDOW" | jq -r '.monitor') # Devuelve el ID (0, 1)
    
    # Obtener el ID del monitor HDMI (porque hyprctl a veces usa ID, no nombre)
    HDMI_ID=$(hyprctl monitors -j | jq -r ".[] | select(.name == \"$MAIN_MONITOR\") | .id")

    # LÓGICA:
    # Si está Fullscreen (1 o 2) Y está en el monitor HDMI
    if [[ "$IS_FULLSCREEN" != "0" ]] && [[ "$CURRENT_MONITOR" == "$HDMI_ID" ]]; then
        # Si la barra secundaria NO está corriendo, lánzala
        if ! pgrep -f "waybar -c $LAPTOP_BAR_CONFIG" > /dev/null; then
            waybar -c "$LAPTOP_BAR_CONFIG" &
        fi
    else
        # Si NO es fullscreen o estamos en otra pantalla, mata la barra secundaria
        pkill -f "waybar -c $LAPTOP_BAR_CONFIG"
    fi
}

# 1. Ejecutar chequeo inicial al arrancar el script
check_fullscreen

# 2. Escuchar el socket de Hyprland en tiempo real
# Cada vez que cambie el foco o el estado de fullscreen, ejecutamos la función
socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do 
    case $line in
        fullscreen*|activewindow*)
            check_fullscreen
            ;;
    esac
done
