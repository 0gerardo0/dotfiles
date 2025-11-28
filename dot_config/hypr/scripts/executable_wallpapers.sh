#!/bin/bash

# Esperar a que el daemon de hyprpaper inicie correctamente
sleep 2

# --- CONFIGURACIÓN ---
DIR="$HOME/.local/share/backgrounds/parasite-wallpaper"
# Duración total del ciclo en segundos (24 horas = 86400)
DAY_SECONDS=86400

# --- INICIO ---

# 1. Comprobamos que el directorio existe
if [ ! -d "$DIR" ]; then
    echo "Error: El directorio $DIR no existe."
    exit 1
fi

# 2. Crear array con las imágenes ordenadas (sort -V para orden numérico correcto)
mapfile -t IMAGES < <(find "$DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | sort -V)

# Contar imágenes
COUNT=${#IMAGES[@]}

if [ "$COUNT" -eq 0 ]; then
    echo "Error: No hay imágenes en $DIR"
    exit 1
fi

echo "Iniciando ciclo de 24h con $COUNT imágenes."

# --- BUCLE PRINCIPAL ---
while true; do
    # 3. Obtener los segundos actuales desde medianoche (00:00:00)
    # %H*3600 + %M*60 + %S
    CURRENT_SEC=$(date "+%s")
    MIDNIGHT_SEC=$(date -d "today 00:00:00" "+%s")
    SEC_PASSED=$((CURRENT_SEC - MIDNIGHT_SEC))

    # 4. Calcular qué imagen toca ahora
    # Fórmula: (SegundosPasados / (86400 / TotalImagenes))
    # Usamos awk para precisión con decimales si COUNT es un número raro (ej. 177)
    INDEX=$(awk -v passed="$SEC_PASSED" -v total="$COUNT" -v day="$DAY_SECONDS" 'BEGIN { printf("%d", passed / (day / total)) }')

    # Protección por si el índice se sale (ej. 23:59:59 y redondeo)
    if [ "$INDEX" -ge "$COUNT" ]; then
        INDEX=$((COUNT - 1))
    fi

    TARGET_IMG="${IMAGES[$INDEX]}"

    # 5. Aplicar wallpaper con hyprpaper
    # Solo si la imagen actual es diferente a la que vamos a poner (evita parpadeos)
    # Guardamos el nombre en una variable temporal para comparar
    if [ "$TARGET_IMG" != "$CURRENT_WALLPAPER" ]; then
        hyprctl hyprpaper preload "$TARGET_IMG"
        hyprctl hyprpaper wallpaper ",$TARGET_IMG"
        
        # Liberar memoria de la imagen anterior (opcional, pero recomendado)
        if [ -n "$CURRENT_WALLPAPER" ]; then
            hyprctl hyprpaper unload "$CURRENT_WALLPAPER"
        fi
        
        CURRENT_WALLPAPER="$TARGET_IMG"
        echo "Hora: $(date +%H:%M:%S) | Imagen [$INDEX/$COUNT]: $(basename "$TARGET_IMG")"
    fi

    # 6. Calcular cuánto dormir hasta el siguiente cambio
    # Duración de cada imagen
    IMG_DURATION=$(awk -v day="$DAY_SECONDS" -v total="$COUNT" 'BEGIN { print day / total }')
    
    # Siguiente segundo de cambio = (Indice + 1) * Duración
    NEXT_SWITCH=$(awk -v idx="$INDEX" -v dur="$IMG_DURATION" 'BEGIN { print (idx + 1) * dur }')
    
    # Tiempo a dormir = Siguiente cambio - Segundos pasados actuales
    SLEEP_TIME=$(awk -v next="$NEXT_SWITCH" -v passed="$SEC_PASSED" 'BEGIN { print int(next - passed) }')

    # Si el cálculo da 0 o negativo (por milisegundos), forzamos 1 segundo mínimo
    if [ "$SLEEP_TIME" -le 0 ]; then
        SLEEP_TIME=1
    fi

    sleep "$SLEEP_TIME"
done
