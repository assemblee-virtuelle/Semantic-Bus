#!/usr/bin/env bash
# Script : choix.sh
PS3="Quel configuration voulez vous utiliser ?"
select choix in \
   "Mac"  \
   "Linux" \
   "Other"
do
   case $REPLY in
      1)  export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-mac.json" && docker-compose -f docker-compose.yaml up -d --force-recreate
          break;;
      2)  export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-linux.json" && docker-compose -f docker-compose.yaml up -d --force-recreate
          break;;
      3)  if [[ -n "$CONFIG_URL" ]]; then  echo "Nous utilisons la configurations :" $CONFIG_URL && export CONFIG_URL=$CONFIG_URL && docker-compose -f docker-compose.dev.yaml up -d --force-recreate;
          else echo "Entrez l'url de votre configuration ( Vous pouvez ajouter votre configuration dans votre .bashrc elle sera set par default au demarrage): "
            read CONFIG_URL_SET
            echo '-- Happy coding --'
            export CONFIG_URL=$CONFIG_URL_SET && docker-compose -f docker-compose.dev.yaml up -d ; fi
            break;;
      *) echo "Entrez 1 2 ou 3 ..."  ;;
   esac
done
