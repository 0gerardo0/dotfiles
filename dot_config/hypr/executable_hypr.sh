#!/bin/bash
# Script para generar ruido de fondo estilo hacker para screenshots
# Ejecuta esto en una terminal a pantalla completa

# Colores
GREEN='\033[0;32m'
DARKG='\033[1;30m' # Gris oscuro para simular comandos viejos
NC='\033[0m' # No Color

clear
echo -e "${GREEN}INIT_SEQUENCE_STARTING...${NC}"
sleep 1

# Lista de comandos falsos pero realistas
cmds=(
"root@sys: nmap -sS -sV -O -p- 192.168.1.10"
"[+] Nmap scan report for target-host (192.168.1.10)"
"[+] Host is up (0.00043s latency)."
"PORT    STATE SERVICE     VERSION"
"22/tcp  open  ssh         OpenSSH 8.9p1 Ubuntu 3ubuntu0.1"
"80/tcp  open  http        nginx 1.18.0 (Ubuntu)"
"root@sys: msfconsole -q"
"msf6 > use exploit/multi/handler"
"msf6 exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp"
"PAYLOAD => windows/x64/meterpreter/reverse_tcp"
"[*] Started reverse TCP handler on 10.0.0.5:4444"
"[*] Sending stage (200774 bytes) to 192.168.1.55"
"[*] Meterpreter session 1 opened (10.0.0.5:4444 -> 192.168.1.55:49673)"
"root@sys: aircrack-ng -w /usr/share/wordlists/rockyou.txt -b 00:11:22:33:44:55 handshake.cap"
"[+] Key found! [ supersecretpassword ]"
"root@sys: sqlmap -u 'http://vuln-site.com/index.php?id=1' --dbs --batch"
"[*] fetching database names"
"[*] available databases [4]: information_schema, mysql, users_db"
"root@sys: hydra -l admin -P passlist.txt ssh://10.10.10.5 -t 4"
"[DATA] attacking ssh://10.10.10.5:22/"
"[22][ssh] host: 10.10.10.5   login: admin   password: password123"
"root@sys: cat /etc/shadow"
"root:\$6\$hJ8...:18742:0:99999:7:::"
"root@sys: wireshark -i eth0 -k &"
"root@sys: hashcat -m 0 -a 0 hashes.txt rockyou.txt"
"Status: Cracked"
)

# Bucle infinito imprimiendo líneas
while true; do
    # Selecciona una línea aleatoria
    rand=$[$RANDOM % ${#cmds[@]}]
    echo -e "${GREEN}${cmds[$rand]}${NC}"
    
    # Velocidad aleatoria para que parezca tecleado real
    sleep 0.$(( ( RANDOM % 3 )  + 1 ))
done
