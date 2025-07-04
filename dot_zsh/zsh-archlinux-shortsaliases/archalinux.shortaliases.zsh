#######################################
#               Pacman                #
#######################################

# Pacman - https://wiki.archlinux.org/index.php/Pacman_Tips
if (( $+commands[pacman] )); then
  alias pacupg='sudo pacman -Syu'
  alias pacin='sudo pacman -S'
  alias pacndeps='sudo pacman -Sdd'
  alias paclean='sudo pacman -Sc'
  alias pacins='sudo pacman -U'
  alias paclr='sudo pacman -Scc'
  alias pacre='sudo pacman -R'
  alias pacrem='sudo pacman -Rncs'
  alias pacrep='pacman -Si'
  alias pacreps='pacman -Ss'
  alias pacloc='pacman -Qi'
  alias paclocs='pacman -Qs'
  alias pacinsd='sudo pacman -S --asdeps'
  alias pacmir='sudo pacman -Syy'
  alias paclsorphans='sudo pacman -Qdt'
  alias pacrmorphans='sudo pacman -Rs $(pacman -Qtdq)'
  alias pacfileupg='sudo pacman -Fy'
  alias pacfiles='pacman -F'
  alias pacls='pacman -Ql'
  alias pacown='pacman -Qo'
  alias pacupd="sudo pacman -Sy"
  alias pacserch="sudo pacman -Ss"

  #bonus: repository blackarch
  alias paclistcatba='sudo pacman -Sg | grep blackarch'
  alias paclistba='sudo pacman -Sgg | grep blackarch | cut -d" " -f2 | sort -u'
  alias paclistinstalledba='pacman -Qs blackarch'
  alias paclogsba='sudo less /var/log/pacman.log'
  alias paclock='sudo rm /var/lib/pacman/db.lck'

  function paclist() {
    # Based on https://bbs.archlinux.org/viewtopic.php?id=93683
    pacman -Qqe | \
      xargs -I '{}' \
        expac "${bold_color}% 20n ${fg_no_bold[white]}%d${reset_color}" '{}'
  }

  function pacdisowned() {
    local tmp db fs
    tmp=${TMPDIR-/tmp}/pacman-disowned-$UID-$$
    db=$tmp/db
    fs=$tmp/fs

    mkdir "$tmp"
    trap 'rm -rf "$tmp"' EXIT

    pacman -Qlq | sort -u > "$db"

    find /bin /etc /lib /sbin /usr ! -name lost+found \
      \( -type d -printf '%p/\n' -o -print \) | sort > "$fs"

    comm -23 "$fs" "$db"
  }

  alias pacmanallkeys='sudo pacman-key --refresh-keys'

  function pacmansignkeys() {
    local key
    for key in $@; do
      sudo pacman-key --recv-keys $key
      sudo pacman-key --lsign-key $key
      printf 'trust\n3\n' | sudo gpg --homedir /etc/pacman.d/gnupg \
        --no-permission-warning --command-fd 0 --edit-key $key
    done
  }

  pacinba() {
    if [ -z "$1" ]; then
      echo "Por favor proporciona un nombre de categoría o herramienta."
    else
      sudo pacman -S "blackarch-$1"
    fi
  }


fi

if (( $+commands[xdg-open] )); then
  function pacweb() {
    if [[ $# = 0 || "$1" =~ '--help|-h' ]]; then
      local underline_color="\e[${color[underline]}m"
      echo "$0 - open the website of an ArchLinux package"
      echo
      echo "Usage:"
      echo "    $bold_color$0$reset_color ${underline_color}target${reset_color}"
      return 1
    fi

    local pkg="$1"
    local infos="$(LANG=C pacman -Si "$pkg")"
    if [[ -z "$infos" ]]; then
      return
    fi
    local repo="$(grep -m 1 '^Repo' <<< "$infos" | grep -oP '[^ ]+$')"
    local arch="$(grep -m 1 '^Arch' <<< "$infos" | grep -oP '[^ ]+$')"
    xdg-open "https://www.archlinux.org/packages/$repo/$arch/$pkg/" &>/dev/null
  }
fi

#######################################
#             AUR helpers             #
#######################################

if (( $+commands[aura] )); then
  alias auin='sudo aura -S'
  alias aurin='sudo aura -A'
  alias auclean='sudo aura -Sc'
  alias auclr='sudo aura -Scc'
  alias auins='sudo aura -U'
  alias auinsd='sudo aura -S --asdeps'
  alias aurinsd='sudo aura -A --asdeps'
  alias auloc='aura -Qi'
  alias aulocs='aura -Qs'
  alias aulst='aura -Qe'
  alias aumir='sudo aura -Syy'
  alias aurph='sudo aura -Oj'
  alias aure='sudo aura -R'
  alias aurem='sudo aura -Rns'
  alias aurep='aura -Si'
  alias aurrep='aura -Ai'
  alias aureps='aura -As --both'
  alias auras='aura -As --both'
  alias auupd="sudo aura -Sy"
  alias auupg='sudo sh -c "aura -Syu              && aura -Au"'
  alias ausu='sudo sh -c "aura -Syu --no-confirm && aura -Au --no-confirm"'
  alias upgrade='sudo aura -Syu'

  # extra bonus specially for aura
  alias auown="aura -Qqo"
  alias auls="aura -Qql"
  function auownloc() { aura -Qi  $(aura -Qqo $@); }
  function auownls () { aura -Qql $(aura -Qqo $@); }
fi

if (( $+commands[pacaur] )); then
  alias pacclean='pacaur -Sc'
  alias pacclr='pacaur -Scc'
  alias paupg='pacaur -Syu'
  alias pasu='pacaur -Syu --noconfirm'
  alias pain='pacaur -S'
  alias pains='pacaur -U'
  alias pare='pacaur -R'
  alias parem='pacaur -Rns'
  alias parep='pacaur -Si'
  alias pareps='pacaur -Ss'
  alias paloc='pacaur -Qi'
  alias palocs='pacaur -Qs'
  alias palst='pacaur -Qe'
  alias paorph='pacaur -Qtd'
  alias painsd='pacaur -S --asdeps'
  alias pamir='pacaur -Syy'
  alias paupd="pacaur -Sy"
  alias upgrade='pacaur -Syu'
fi

if (( $+commands[trizen] )); then
  alias trconf='trizen -C'
  alias trupg='trizen -Syua'
  alias trsu='trizen -Syua --noconfirm'
  alias trin='trizen -S'
  alias trclean='trizen -Sc'
  alias trclr='trizen -Scc'
  alias trins='trizen -U'
  alias trre='trizen -R'
  alias trrem='trizen -Rns'
  alias trrep='trizen -Si'
  alias trreps='trizen -Ss'
  alias trloc='trizen -Qi'
  alias trlocs='trizen -Qs'
  alias trlst='trizen -Qe'
  alias trorph='trizen -Qtd'
  alias trinsd='trizen -S --asdeps'
  alias trmir='trizen -Syy'
  alias trupd="trizen -Sy"
  alias upgrade='trizen -Syu'
fi

if (( $+commands[paru] )); then
  alias parclean='paru -Sc'
  alias parin='paru -S'
  alias parins='paru -U'
  alias parclr='paru -Scc'
  alias parre='paru -R'
  alias parrem='paru -Rns'
  alias parrep='paru -Si'
  alias parreps='paru -Ss'
  alias parloc='paru -Qi'
  alias parlocs='paru -Qs'
  alias parlst='paru -Qe'
  alias parinsd='paru -S --asdeps'
  alias parmir='paru -Syy'
  alias parown='paru -Qo'
  alias parupd="paru -Sy"
  alias parupg='paru -Syu'
  alias upgrade='paru -Syu'
fi

if (( $+commands[yay] )); then
  alias yaconf='yay -Pg'
  alias yaclean='yay -Sc'
  alias yaclr='yay -Scc'
  alias yaupg='yay -Syu'
  alias yasu='yay -Syu --noconfirm'
  alias yain='yay -S'
  alias yains='yay -U'
  alias yare='yay -R'
  alias yarem='yay -Rns'
  alias yarep='yay -Si'
  alias yareps='yay -Ss'
  alias yaloc='yay -Qi'
  alias yalocs='yay -Qs'
  alias yalst='yay -Qe'
  alias yaorph='yay -Qtd'
  alias yainsd='yay -S --asdeps'
  alias yamir='yay -Syy'
  alias yaupd="yay -Sy"
  alias upgrade='yay -Syu'
fi

if (( $+commands[rua] )); then
  alias ruin='rua install'
  alias ruse='rua search'
  alias ruup='rua upgrade'
  alias rush='rua shellcheck'
  alias rutar='rua tarcheck'
  alias rube='rua builddir'
  alias rubeoff='rua builddir --offline'
fi
