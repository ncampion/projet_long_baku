<template>
  <div class="modal-card" style="width: 700px; height: 500px;">
    <header class="modal-card-head">
      <p class="modal-card-title">Modifier un son</p>
    </header>
    <section class="modal-card-body">
      <input type="text" ref="nameSound" :value="nameSound"/>
      <button class="button" id="PlayAction" type="button" @click="playAction()">Play</button>
      <div id="waveform"></div>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Annuler</button>
      <button class="button is-primary" @click="storeEditedSound();$parent.close()">Valider</button>
    </footer>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import WaveSurfer from "wavesurfer.js";

const ProjectNS = namespace('project');

@Component
export default class SmartphoneSynchroPopupComponent extends Vue {
  @ProjectNS.Getter
  protected getAudioRecord!: any;

  @Prop()
  private id: string;

  public nameSound: string = "";

  private audioBlob: any;
  private waveSurfer: any;

  public async mounted(){
    const audio = this.getAudioRecord.find(audio => audio.id === this.id);
    this.nameSound = audio.title;
    this.audioBlob = audio.sound;
    console.log(this.audioBlob);
    this.waveSurfer = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        waveColor: '#D9DCFF',
        progressColor: '#4353FF',
        cursorColor: '#4353FF',
        barWidth: 3,
        barRadius: 3,
        cursorWidth: 1,
        height: 200,
        barGap: 3
    });
    this.waveSurfer.loadBlob(this.audioBlob);
  }

  public playAction() {
    this.waveSurfer.play();
  }

  public async storeEditedSound(){
    var title: string = (this.$refs.nameSound as any).value;
    if(title == ""){
      title = this.nameSound;
    }
    await this.$store.dispatch('project/changeAudioTitle', { audioId: this.id, title });
    await this.$store.dispatch('project/changeAudioSound', { audioId: this.id, sound: this.audioBlob });
  }
}
</script>
