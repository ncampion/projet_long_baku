<template>
  <div class="modal-card" style="width: 700px; height: 500px;">
    <header class="modal-card-head">
      <p class="modal-card-title">Capturer un son</p>
    </header>
    <section class="modal-card-body">
      <b-field v-if="selectedDeviceId">
        <b-select
          :loading="!devices.length"
          v-model="selectedDeviceId"
          placeholder="Sélectionner un microphone"
        >
        <option v-for="device in devices" :key="device.id" :value="device.id">{{device.label}}</option>
        </b-select>
      </b-field>
      <p v-else style="color:red;font-size:14px;">Veuillez autoriser l'accès à votre microphone.</p>
      <button class="button" id="StartRecordAction" type="button" @click="startRecordAction()">Record</button>
      <button class="button" id="StopRecordAction" style="display:none;" type="button" @click="stopRecordAction()">Stop</button>
      <br><button class="button" id="PlayAction" style="display:none;" type="button" @click="playAction()">Play</button>
      <div id="waveform"></div>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="closeMedia();$parent.close()">Annuler</button>
      <button class="button is-primary" @click="closeMedia();recordSound()">Valider</button>
    </footer>
  </div>
</template>


<script lang="ts">
import {
  Component, Vue,
} from 'vue-property-decorator';
import WaveSurfer from "wavesurfer.js";


export class AudioDevice{
  public id: string;
  public label: string;

  constructor(input: MediaDeviceInfo) {
    this.id = input.deviceId;
    this.label = input.label;
  }
}


@Component
export default class RecordPopup extends Vue {

  public devices: AudioDevice[] = [];

  public selectedDeviceId: string = "";
  
  private isRecording: boolean = false;

  private stream: any;

  private mediaRecorder: any;

  
  audioChunks = Array();

  private waveSurfer: any;

  public async mounted() {

    this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const devices = (await navigator.mediaDevices.enumerateDevices()) || [];

    const audioDevices = devices
      .filter(
        (input: MediaDeviceInfo) => input.kind === 'audioinput' && input.deviceId !== '',
      );
    this.devices = audioDevices.map((input: MediaDeviceInfo) => new AudioDevice(input));
    
    this.selectedDeviceId = this.devices[0].id ?? undefined;
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
    
  }

  public async startRecordAction() {
    let el: HTMLElement | null = document.getElementById("StartRecordAction");
    if(el){
      el.style.display = 'none';
    }
    el = document.getElementById("StopRecordAction");
    if(el){
      el.style.display = 'inline';
    }
    el = document.getElementById("PlayAction");
    if(el){
      el.style.display = 'none';
    }
    this.isRecording = true;
    this.audioChunks = Array();

    this.stream = await navigator.mediaDevices.getUserMedia({audio: {deviceId: this.selectedDeviceId}});
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start(); // pass optionnal timeslice in ms as parameter
    this.mediaRecorder.addEventListener("dataavailable", (event: any) => {
    this.audioChunks.push(event.data);
    });
  }

  public async stopRecordAction() {
    let el: HTMLElement | null = document.getElementById("StartRecordAction");
    if(el){
      el.style.display = 'inline';
    }
    el = document.getElementById("StopRecordAction");
    if(el){
      el.style.display = 'none';
    }
    el = document.getElementById("PlayAction");
    if(el){
      el.style.display = 'inline';
    }
    this.isRecording = false;

    this.mediaRecorder.stop();
    this.stream.getTracks().forEach(function(track: MediaStreamTrack) {
      track.stop();
    });
    this.mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(this.audioChunks);
      //const audioUrl = URL.createObjectURL(audioBlob);
      //const audio = new Audio(audioUrl);
      this.waveSurfer.loadBlob(audioBlob);
    });
  }
  
  public playAction() {
    if(!this.isRecording){
      this.waveSurfer.play();
    }
  }

  public closeMedia(){
    if(this.isRecording){
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(function(track: MediaStreamTrack) {
        track.stop();
      });
    }
    if(this.waveSurfer.isPlaying()){
      this.waveSurfer.stop();
    }
  }
}
</script>