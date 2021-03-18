# Document technique projet long Baku 
## Front-end 
### Pop-up d'enregistrement et Pop-up d'édition du son
Ces deux pop-ups ([RecordPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/RecordPopup.vue) et [EditSoundPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/EditSoundPopup.vue)) sont appellées sont dans [AudioListComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/audio/AudioListComponent.vue).
* [RecordPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/RecordPopup.vue) permet d'enregistrer un son. Pour cela on demande l'autorisation d'utiliser le micro via le navigateur, on enregistre le son grâce à la Web API [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), et on affiche sa waveform grâce à [WaveSurfer.js](https://wavesurfer-js.org/).
* [EditSoundPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/EditSoundPopup.vue) permet de modifier le titre du son, d'effectuer un crop sur le son et de modifier son volume. 

Les sons sont enregistrés sous forme d'AudioBlob et convertis au format WAV (toujours sous forme d'AudioBlob) grâce [à la fonction de conversion suivante.](https://github.com/ncampion/projet_long_baku/blob/main/front/src/utils/convert.ts)



### Ajouts dans le store

Un film (movie) a deux nouveaux attributs pour l'ajout du son :

Une interface Audio :
* id : string
* title : string
* sound : Blob
* waveform : Blob
* volume : number
* duration : number


Une interface SoundTimeline :
* id : string
* audioId : string
* pisteNumber : number
* start : number
* end : number
* title : string

Ces attributs peuvent être modifiés par l'action de l'utilisateur. Lorsqu'il clique sur enregistrer un son et qu'il valide son enregistrement, on dispatche dans le store l'évènement "createAudio". Celui-ci a pour paramètres le titre, l'audio en blob, sa durée ainsi que l'id du projet. Ainsi, un nouvel Audio est ajouté dans le store, de même que l'évènement ajout d'un son dans l'historique du back.

La suppression d'un élément des interfaces ci-dessus et la modification de chacun de leurs attributs se fait de la même manière, un code similaire est appliqué.

L'utilisateur peut donc ajouter un son, modifier son titre, sa durée (le crop) et son volume. Il peut le jouer pour réécouter le son enregistré (via un player [Howler.js](https://howlerjs.com/)), ainsi que le supprimer. La suppression depuis la liste des sons le supprime aussi de la timeline.

Il peut alors ajouter un son de cette liste sur la timeline avec un glisser-déposer.



### Timeline

La timeline suivante a été réutilisée et adaptée pour l'ajout et la lecture du son :
https://github.com/vasturiano/timelines-chart


#### Ajout d'un son dans la timeline

Lorsqu'un son est ajouté dans la timeline, il est automatiquement placé à la frame affichée dans le lecteur et sur la poste sélectionnée. Cela ajoute aussi dans le store un nouvel objet SoundTimeline qui est utilisé par la suite pour reconstruire la timeline lors d'un F5, mais aussi pour la lecture des sons avec le player.
La data de la timeline est aussi mise à jour afin d'afficher correctement le rect représentant le son, ainsi que tout les attributs nécessaires lorsque l'on survole ou clique sur le rect.
Un son ne peut être ajouté que s'il ne superpose pas à un autre son sur la même piste.


#### Ajout d'une piste dans la timeline

Il est possible d'avoir plus d'une piste dans la timeline, ceci en cliquant sur le bouton "ajouter une piste". Ainsi, une piste sera ajoutée tout à la fin de la liste des pistes. La piste sélectionnée pour ajouter un son sera alors la nouvelle piste créée. On peut aussi supprimer la piste sélectionnée via le bouton "supprimer la piste", ou  la changer via un menu déroulant où toutes les pistes existantes se trouvent.


#### Modification d'un son dans la timeline

Il existe plusieurs modes pour modifier un son dans la timeline. Les premiers permettent de modifier sa place, et un autre permet de supprimer le son. Une action n'est effectuée que lors d'un clic sur un rectangle et modifie la data de la timeline ainsi que la liste de SoundTimeline.
Ainsi, dans la fonction segmentClic, si le mode "supprimer un son" est sélectionné, le son sera supprimé. Si il reste plus d'une piste et ce son était le dernier de la piste, celle-ci sera automatiquement supprimée.
Les autres modes sont avancer de 1 et 10 frames, et reculer de 1 et 10 frames. Le son que l'on souhaite déplacer ne l'est réellement que si sa nouvelle position n'est pas superposée à un autre son.




#### Lecture des sons dans la timeline
La lecture des sons dans la timeline se fait depuis la vue [AudioView.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/views/AudioView.vue). On utile pour ça la librairie [Howler.js](https://howlerjs.com/), qui nous permet d'instancier les players audios pour lire les différents sons présents dans la timeline.
Pour avoir accès à tous ces sons on récupère le contenu de SoundTimeline dans le store. 
Un appui sur le bouton "play" appelle la méthode initSounds() (via différents appels de fonctions) qui instancie tous les players Howler.js pour chaque son présent dans la timeline (si un même son y est présent plusieurs fois, il y aura un player par son). Dans le cas de départ de lecture au milieu d'un son on initialise un player de manière normal mais on définit le début de lecture de ce son via un calcul de ratio.
Ces players sont ensuite mis dans soundsPlayers[] avec pour index leur frame de départ. 
Lors du display d'une frame, on regarde si on a pas un (ou plusieurs) son à lire dans le tableau soundsPlayers[], si c'est le cas, on le play.




## Back-end

### Envoi des sons sur le serveurs

D'une manière analogue aux transferts d'images, on envoie les sons enregistrés sur le serveur. Pour cela on utilise une fonction [uploadSound]( https://github.com/ncampion/projet_long_baku/blob/7041ae239bacdd7642e09362253bd31598b4ea57/front/src/api/index.ts#L42) dans l'API qui permet d'envoyer l'AudioBlob vers le serveur.
Côté serveur, on dispose d'un [SoundController](https://github.com/ncampion/projet_long_baku/blob/7041ae239bacdd7642e09362253bd31598b4ea57/back/src/main/java/com/bakuanimation/rest/SoundController.java) qui récupère l'audioblob (en récupérant le contenu de la requête POST (`@Post(value = "/api/{projectId}/uploadSound", consumes = MediaType.MULTIPART_FORM_DATA)`) et le sauvegarde (via l'écriture du flux de données dans un fichier) sur le serveur grâce aux méthodes de [SoundServiceImpl.java](https://github.com/ncampion/projet_long_baku/blob/7041ae239bacdd7642e09362253bd31598b4ea57/back/src/main/java/com/bakuanimation/service/SoundServiceImpl.java) dans un dossier "sounds" du projet avec comme nom l'ID du son.

### Récupération des sons 
Cela se déroule de la même manière que pour la récupération des images, mais en plus simple car il n'y a actuellement qu'une seule qualité de son.
Coté back on a une fonction qui permet de récupérer les fichiers audios stockées sur le serveur à partir d'une requête GET (et de ses paramètres).
`@Get("/api/{projectId}/sounds/{audioId}")`
Coté front, on recrée le blob à partir du fichier renvoyé par le back
`let blob = await fetch(path).then(res => res.blob()).then(data => new Blob([data], {type: 'audio/wav'}));`
Le bon path est construit à partir de l'API : 
`let path : string = api.getSoundUrl(this.projectId, audio.id);`



## Améliorations
### Feature : Importer fichiers audio depuis PC
Créer une pop-up "Importer un fichier" avec drag & drop pour pouvoir ajouter un son ou une musique (en .wav ou .mp3).

### Afficher les waveforms sur la timeline
L'idée est de remplacer les éléments <rect></rect> colorés par la waveform correspondante générée à l'aide de [Wavesurfer.js](https://wavesurfer-js.org/)
La waveform peut être stockée dans le back sous forme de Blob et chargée sous forme de data URI.
Ce remplacement a été tenté en typescript après l'affichage de la timeline avec [timelines-chart](https://github.com/vasturiano/timelines-chart) mais n'a pas donné de résultats probants.


### Afficher un aperçu des shots sur la timeline
Même principe que pour les waveform, mais avec l'image d'aperçu du shot, afin de pouvoir rapidement différencier chaque plan.

### Drag and drop des élements dans la timeline
Le drag and drop des éléments audio fonctionne uniquement à l'ajout, à la position courante du curseur. Un feature intéressant serait de pouvoir déplacer les éléments audio sur la timeline en drag and drop, et ainsi remplacer les boutons "Avancer de 10 frames", "Reculer de 1 frame"...


### Export FFMPEG
https://www.ffmpeg.org/documentation.html
A partir des audios enregistrés .wav sur le serveur.
Exporter l'audio en une piste mono depuis le back-end Java à l'aide de FFMPEG.
Les étapes d'export sont : 
* Appliquer le volume sur chaque piste 
`ffmpeg -i input.wav -filter:a "volume=0.5" output.wav`
* Mixer toutes les pistes vers une piste mono. Placer chaque élément audio au bon timecode. [Exemples de mixage](https://trac.ffmpeg.org/wiki/AudioChannelManipulation)
* [Optionnel] Appliquer une normalisation du mix final
`ffmpeg -i input.wav -filter:a loudnorm output.wav`
* Ajouter l'audio à la vidéo finale 
`ffmpeg -i input_video.mp4 -i input_audio.wav -c:v copy -map 0:v:0 -map 1:a:0 output_video_with_audio.mp4`
