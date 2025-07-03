#!/bin/bash

# Función para ejecutar el comando xrandr
run_xrandr_command() {
    xrandr --output HDMI-A-0 --mode 1920x1080 --rate 74.99
}
run_xrandr_command_2(){
    xrandr --output HDMI-A-0 --primary
}
run_xrandr_command_3(){
    (mons -m && xrandr --output eDP --off && feh --bg-scale /home/gerardo0/.local/share/backgrounds/hollow_knight_3.png) &
}

# Obtener el número de monitores conectados
connected_monitors=$(xrandr | grep -w 'connected' | wc -l)

# Verificar si hay más de un monitor conectado
if [ $connected_monitors -gt 1 ]; then
    # Ejecutar el comando para configurar el segundo monitor
    run_xrandr_command
    run_xrandr_command_2
    run_xrandr_command_3
    #run_xrandr_command_4
fi

# # Variable para indicar si el comando xrandr ya se ha ejecutado
# command_executed=false
# # Bucle infinito
# while true; do
#     # Verificar si el monitor HDMI está conectado
#     #xrandr | grep -q 'HDMI-A-0 connected'
#     if [ $connected_monitors -gt 1 ] && [ "$command_executed" = false ]; then
#         # Verificar si el comando xrandr ya se ha ejecutado
#             run_xrandr_command
#             # Actualizar la variable para indicar que el comando se ha ejecutado
#             command_executed=true
#     fi
#     sleep 0.5
# done