#!/bin/bash

echo "Entering Tests"

# éléments à changer à la main ->>>
# main/server/workspaceComponentInitialize/CLASS.js
    # titre et description du composant, logo et tags
# main/client/static/tag/editorComponents/transformation/CLASS-editor.tag
    # Créer le composant, quels champs sont à remplir + code js/riot avec
# engine/workspaceComponentExecutor/CLASS.js
    # Faire le code du composant ici   

className="split"
editorName="split-editor"
classRegex="---CLASSNAME---"
editorRegex="---EDITORNAME---"
fileRegex="\/\/ ---ENDOFPART---"

# on supprime tout ce qui est dans fileModifications avant
rm ./filemodifications/*

# création de fichiers ->>>>
# engine/workspaceComponentExecutor/CLASS.js tagfile
cp ./squeletton/engineClass.txt ./filemodifications/engineClass.txt
mv ./filemodifications/engineClass.txt ./filemodifications/engine$className.js
# nom de la classe qui change ---CLASS---
# /!\ nom du fichier à changer ---CLASS---.js

# lecture du fichier ./filemodifications/engine$className.js + regex
# on remplace les ---CLASS--- par le nom de la classe
sed -i "s/$classRegex/$className/" filemodifications/engine$className.js

# main/client/static/tag/editorComponents/transformation/CLASS-editor.tag
# balises de tag qui changent ---EDITORNAME---
# nom du fichier wiki qui change ---CLASS---
# nom du fichier qui changent ---EDITORNAME---
cp ./squeletton/mainTag.txt ./filemodifications/mainTag.txt
mv ./filemodifications/mainTag.txt ./filemodifications/$editorName.tag

sed -i "s/$classRegex/$className/" ./filemodifications/$editorName.tag
sed -i "s/$editorRegex/$editorName/" ./filemodifications/$editorName.tag

# main/server/workspaceComponentInitialize/jsEvaluation.js
cp ./squeletton/mainClass.txt ./filemodifications/mainClass.txt
mv ./filemodifications/mainClass.txt ./filemodifications/$className.js
# nom de la classe à changer ---CLASS---
# nom du titre du composant à changer ---CLASS---
# nom de l'éditeur à changer ---EDITORNAME---

sed -i "s/$classRegex/$className/" ./filemodifications/$className.js
sed -i "s/$editorRegex/$editorName/" ./filemodifications/$className.js

# ajout des lignes dans les fichiers ->>>>
# main/server/services/technicalComponentDirectory.js
mainTechComponentText=" $className: require('../workspaceComponentInitialize/$className.js'),"
echo "main technicalcomponentdirectory text : $mainTechComponentText"

# ouvrir fichier
# selectionner ligne ---ENDOFPART--- 
# aller ligne au dessus
# ajouter le texte
sed -i "/$fileRegex/i\ $mainTechComponentText" ../main/server/services/technicalComponentDirectory.js

# après regex ?
# engine/services/technicalComponentDirectory.js
engineTechComponentText="   $className: require('../workspaceComponentExecutor/$className.js'),"
echo "engine technicalcomponentdirectory text : $engineTechComponentText"

sed -i "/$fileRegex/i\ $engineTechComponentText" ../engine/services/technicalComponentDirectory.js

# ajout après regex price 20
# main/configuration.js
configText="\"$className\":{\"price\":40}"
echo "main config text : $configText"

# timer/configuration.js
echo "timer config text : $configText"

# engine/configuration.js
echo "engine config text : $configText"

echo "End"