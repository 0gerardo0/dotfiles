#!/bin/sh
# A la escucha de monitores
 cd ~/.config/qtile && ./monitor-listen.sh &
#Picom 
picom --config ~/.config/picom/picom.conf &
#wallpaper
feh --bg-scale /home/gerardo0/.local/share/backgrounds/hollow_knight_3.png    
# systray battery icon
cbatticon -u 5 &
# systray volume
volumeicon &

blueman-applet &