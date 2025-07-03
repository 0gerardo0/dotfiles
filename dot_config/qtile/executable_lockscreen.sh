#!/bin/sh

# Ejecuta betterlockscreen y luego espera 5 segundos antes de suspender el sistema
betterlockscreen --lock blur && sleep 15 && systemctl suspend

