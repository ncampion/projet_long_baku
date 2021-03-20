# Document technique projet long Baku 
## Front-end 

### Page principale de gestion de l'audio

Cette page est intégrée dans le site web via [App.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/App.vue) et se nomme [Audio.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/views/AudioView.vue). Cette page se présente de la même manière que les pages consacrées à la capture et à l'affichage des plans.

Elle comprend quatre parties principales : 
* [AudioListComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/audio/AudioListComponent.vue) : Un composant affichant les sons enregistrés sous forme de liste.
* Une partie au centre de la page permettant d'afficher le film en entier.
* [HistoryComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/capture/HistoryComponent.vue) : L'historique des actions de l'utilisateur.
* [AudioDisplayComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/audio/AudioDisplayComponent.vue) : Ce composant contient la timeline affichant les pistes de sons ainsi que les plans, ceci permettant de synchroniser les sons avec les plans. On y voit également une échelle de frames.

La partie au centre de la page a été créée en réutilisant le composant vidéo de la page de capture. Cette page de capture n'affichant qu'un seul plan à la fois, il a fallu cependant l'adapter. 

Nous avons donc récupéré tout les plans du projet, puis toutes les images de chaque plan pour les mettre dans un grand tableau d'images, afin d'afficher le film avec tout les plans à la suite.

```
for(let shot of this.getAllShots){
    allImagesLocal = allImagesLocal.concat(shot.images);
    for(let image of shot.images){
        this.allImages.push({image});
    }
}
```
La variable allImagesLocal est un tableau local au mounted contenant toutes les images, qui servira pour charger les images dans le cache, et this.allImages est un tableau global contenant toutes les images.

Il a fallu également charger toutes ces images dans le cache, en utilisant la méthode suivante : 
```      
ImageCacheService.startPreloading(
    allImagesLocal,
    this.activeFrame,
    this.onImagePreloaded,
);
```


La vidéo présente également des previews sur les cotés des frames précédentes et suivantes, afin de pouvoir bien caler le son sur la frame souhaitée.


### Pop-up d'enregistrement et Pop-up d'édition du son
Ces deux pop-ups ([RecordPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/RecordPopup.vue) et [EditSoundPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/EditSoundPopup.vue)) sont appellées sont dans [AudioListComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/audio/AudioListComponent.vue).
* [RecordPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/RecordPopup.vue) permet d'enregistrer un son. Pour cela on demande l'autorisation d'utiliser le micro via le navigateur, on enregistre le son grâce à la Web API [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), et on affiche sa waveform grâce à [WaveSurfer.js](https://wavesurfer-js.org/).
```
this.stream = await navigator.mediaDevices.getUserMedia({audio: {deviceId: this.selectedDeviceId}});
this.mediaRecorder = new MediaRecorder(this.stream);
```
On peut ensuite démarrer l'enregistrement, start() peut prendre en paramètre un timeslice en millisecondes (1 ms ici)
```
this.mediaRecorder.start(1);
```
On enregistre ensuite les chunks lorsqu'il sont disponibles avec un EventListener. 
```
this.mediaRecorder.addEventListener("dataavailable", (event: any) => {
    this.audioChunks.push(event.data)
});
```

* [EditSoundPopup.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/EditSoundPopup.vue) permet de modifier le titre du son, d'effectuer un crop sur le son et de modifier son volume. 

Pour effectuer la découpe du son on utilise la méthode [crop](https://github.com/ncampion/projet_long_baku/blob/09da5673a4956e33947a93b8f12a0d6d2bc821f3/front/src/components/EditSoundPopup.vue#L132). On récupère l'AudioBuffer correspondant à l'AudioBlob via WaveSurfer et on procède à la découpe sur l'AudioBuffer à partir du début et de la fin de la région de WaveSurfer. 

Les sons sont enregistrés sous forme d'AudioBlob et convertis au format WAV (toujours sous forme d'AudioBlob) grâce [à la fonction de conversion suivante.](https://github.com/ncampion/projet_long_baku/blob/main/front/src/utils/convert.ts)





### Ajouts dans le store

Un film (movie) a deux nouveaux attributs pour l'ajout du son :

Une interface Audio :
* id : string
* title : string
* sound : Blob (Audioblob qui contient le son)
* waveform : Blob (image de la waveform du son)
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

La data est de la forme suivante :

```
 [
  {
    group: "SONS",
    data: [
      {
        label: "Piste 1",
        data: []
      },
    ],
  },
  
  {
    group: "PLANS",
    data: [
      {
        label: "",
        data: this.getChartFromShots(),
      },
    ],
  },
]
```

Elle est utilisée dans le fichier [AudioDisplayComponent.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/components/audio/AudioDisplayComponent.vue).

#### Ajout d'un son dans la timeline

Lorsqu'un son est ajouté dans la timeline, il est automatiquement placé à la frame affichée dans le lecteur et sur la poste sélectionnée. Cela ajoute aussi dans le store un nouvel objet SoundTimeline qui est utilisé par la suite pour reconstruire la timeline lors d'un F5, mais aussi pour la lecture des sons avec le player.
La data de la timeline est aussi mise à jour afin d'afficher correctement le rect représentant le son, ainsi que tout les attributs nécessaires lorsque l'on survole ou clique sur le rect.

On la met à jour dans le handleDrop qui n'a en paramètre que l'audioId. On récupère alors avec cet id les différents paramètres pour la création d'un élément soundTimeline :

```
let audioId = event.dataTransfer.getData("text");
let audios = this.getAudioRecord;
const audio = audios.find((p : any) => p.id === audioId);
let title = audio.title;
let start = this.chart.dateMarker();
let duration = Math.round(audio.duration*this.getMovieFps);
let end = start + duration;
```

Une fois tout les paramètres nécessaires récupérés, on peut alors vérifier que l'ajout est possible, puis l'ajouter car un son ne peut être ajouté que s'il ne superpose pas à un autre son sur la même piste.

```
let addAllowed = this.checkSound(start, end, this.activePiste-1, [-1, -1]);
if (addAllowed && !this.isPlaying) {
  const soundTimelineId = await this.$store.dispatch('project/createSoundTimeline', {audioId, start, end, pisteNumber : this.activePiste, title});
  this.addAudioToPiste(audioId, title, soundTimelineId, this.activePiste, start, end);
}
```

Dans addAudioToPiste, on met en forme la data pour avoir tout les paramètres nécessaires lors d'un clic sur un son de la timeline. On fait une copie du tableau pour éviter les erreurs de mutations.

```
let timeRange = [start, end];
let dataActivePiste = [... this.chartData[0].data[this.activePiste-1].data];
let dataSound = {
    timeRange : timeRange,
    val : title,
    audioId : audioId,
    soundTimelineId : soundTimelineId,
};
dataActivePiste.push(dataSound);
```



#### Ajout d'une piste dans la timeline

Il est possible d'avoir plus d'une piste dans la timeline, ceci en cliquant sur le bouton "ajouter une piste". Ainsi, une piste sera ajoutée tout à la fin de la liste des pistes. La piste sélectionnée pour ajouter un son sera alors la nouvelle piste créée. On peut aussi supprimer la piste sélectionnée via le bouton "supprimer la piste", ou  la changer via un menu déroulant affichant toutes les pistes disponibles. 


#### Modification d'un son dans la timeline

Il existe plusieurs modes pour modifier un son dans la timeline. Les premiers permettent de modifier sa place, et un autre permet de supprimer le son. Une action n'est effectuée que lors d'un clic sur un rectangle et modifie la data de la timeline ainsi que la liste de SoundTimeline.
Ainsi, dans la fonction segmentClic, si le mode "supprimer un son" est sélectionné, le son sera supprimé. Si il reste plus d'une piste et ce son était le dernier de la piste, celle-ci sera automatiquement supprimée.
Les autres modes sont avancer de 1 et 10 frames, et reculer de 1 et 10 frames. Le son que l'on souhaite déplacer ne l'est réellement que si sa nouvelle position n'est pas superposée à un autre son.
```
public async segmentClick(segment : any) {
  if (!this.isPlaying) {
    if (this.goBackward1 || this.goBackward10 || this.goForward1 || this.goForward10) {
      let updatedStartEnd = this.moveSound(segment);
      let soundTimelineId = segment.target.__data__.data.soundTimelineId;
      await this.$store.dispatch('project/updateSoundTimelineStart', { soundTimelineId, start : updatedStartEnd[0], end : updatedStartEnd[1] });
    }
    if (this.deleteSound) {
      let soundTimelineId = segment.target.__data__.data.soundTimelineId;
      let pisteNumber = segment.target.__data__.label.split(" ")[1] - 1;
      this.removeSoundTimeline(soundTimelineId, pisteNumber);
      if (this.chartData[0].data[pisteNumber].data.length == 0 && this.chartData[0].data.length > 1) {
        this.removePiste(pisteNumber+1);
      }
    }
    this.chart.data(this.chart.data());
    this.chartData = this.chart.data();
    this.chart.refresh();
  }
}
```




#### Lecture des sons dans la timeline
La lecture des sons dans la timeline se fait depuis la vue [AudioView.vue](https://github.com/ncampion/projet_long_baku/blob/main/front/src/views/AudioView.vue). On utile pour ça la librairie [Howler.js](https://howlerjs.com/), qui nous permet d'instancier les players audios pour lire les différents sons présents dans la timeline.
Pour avoir accès à tous ces sons on récupère le contenu de SoundTimeline dans le store.

Un appui sur le bouton "play" appelle la méthode initSounds() (via différents appels de fonctions) qui instancie tous les players Howler.js pour chaque son présent dans la timeline (si un même son y est présent plusieurs fois, il y aura un player par son).

```
let url = (window.URL || window.webkitURL ).createObjectURL(this.getAudioRecord.find((audio: any) => audio.id === elm.audioId).sound);
let volume = this.getAudioRecord.find((audio: any) => audio.id === elm.audioId).volume;
let sound : Howl = new Howl({
            src: [url],
            format: ['wav'],
            html5: true,
            volume: parseFloat((volume/100).toFixed(2))
          });
```

Dans le cas de départ de lecture au milieu d'un son on initialise un player de manière normal mais on définit le début de lecture de ce son via un calcul de ratio.


```
let nbFrameTot = elm.end - elm.start;
let nbFrameElapsed = (this.playingFrame+1) - elm.start;
let ratio = nbFrameElapsed/nbFrameTot;
let timeToSeek = ratio * this.getAudioRecord.find((audio: any) => audio.id === elm.audioId).duration;
```


La méthode initSounds() renvoie un tableau de promesses (promiseArray) qui sont résolue si le son a bien fini d'être chargé dans le player.

Lors de l'appel de initSounds() on attends la résolution de toutes les promesses du tableau : 

`await Promise.all(this.initSounds());`

Ces players sont ensuite mis dans soundsPlayers[] avec pour index leur frame de départ.

`this.soundsPlayers[elm.start].push(sound);`

Lors du display d'une frame, on regarde si on a pas un (ou plusieurs) son à lire dans le tableau soundsPlayers[], si c'est le cas, on le play.

```
if (this.isPlaying=='animation' && this.soundsTimeline.length>0){
        if (this.soundsPlayers[this.playingFrame] != undefined){
            this.soundsPlayers[this.playingFrame].forEach(sound => {
              sound.play();
            })
        }
}
```


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
