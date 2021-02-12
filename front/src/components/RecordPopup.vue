<template>
  <div class="modal-card" style="width: 700px; height: 500px;">
    <header class="modal-card-head">
      <p class="modal-card-title">Capturer un son</p>
    </header>
    <section class="modal-card-body">
      <b-field>
        <b-select
          :loading="!devices.length"
          v-model="selectedDeviceId"
          placeholder="Sélectionner un microphone"
        >
          <option v-for="device in devices" :key="device.id" :value="device.id">{{device.label}}</option>
        </b-select>
      </b-field>
      <button class="button" id="StartRecordAction" type="button" @click="startRecordAction()">Record</button>
      <button class="button" id="StopRecordAction" style="display:none;" type="button" @click="stopRecordAction()">Stop</button>
      <button class="button" id="PlayAction" style="display:none;" type="button" @click="playAction()">Play</button>
      <div id="waveform"></div>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Annuler</button>
      <button class="button is-primary" @click="recordSound()">Valider</button>
    </footer>
  </div>
</template>


<script lang="ts">
import {
  Component, Vue,
} from 'vue-property-decorator';
// import WaveSurfer from "wavesurfer.js";


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

  public selectedDeviceId: string | null = null;
  
  private isRecording: boolean = false;

  private stream: any;

  private mediaRecorder: any;

  private elem_StartRecordAction: any = document.getElementById("StartRecordAction");
  private elem_StopRecordAction: any = document.getElementById("StartRecordAction");
  private elem_PlayAction: any = document.getElementById("PlayAction");
  
  audioChunks = [];

  //private var waveSurfer;

  public async mounted() {
    const devices = (await navigator.mediaDevices.enumerateDevices()) || [];

    const audioDevices = devices
      .filter(
        (input: MediaDeviceInfo) => input.kind === 'audioinput' && input.deviceId !== '',
      );
    this.devices = audioDevices.map((input: MediaDeviceInfo) => new AudioDevice(input));
    
    this.selectedDeviceId = this.devices[0].id ?? undefined;
    // this.wavesurfer = WaveSurfer.create({
    //     container: document.querySelector('#waveform'),
    //     waveColor: '#D9DCFF',
    //     progressColor: '#4353FF',
    //     cursorColor: '#4353FF',
    //     barWidth: 3,
    //     barRadius: 3,
    //     cursorWidth: 1,
    //     height: 200,
    //     barGap: 3
    // });
    
  }

  public async startRecordAction() {
    if(this.elem_StartRecordAction){
      this.elem_StartRecordAction.style.display = 'none';
    }
    if(this.elem_StopRecordAction){
      this.elem_StopRecordAction.style.display = 'inline';
    }
    this.isRecording = true;
    this.audioChunks = [];

    this.stream = await navigator.mediaDevices.getUserMedia({audio: {deviceId: this.selectedDeviceId}});
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start(); // pass optionnal timeslice in ms as parameter
    this.mediaRecorder.addEventListener("dataavailable", (event: any) => {
      this.audioChunks.push(event.data);
    });
  }

  public stopRecordAction() {
    if(this.elem_StartRecordAction){
      this.elem_StartRecordAction.style.display = 'inline';
    }
    if(this.elem_StopRecordAction){
      this.elem_StopRecordAction.style.display = 'none';
    }
    if(this.elem_PlayAction){
      this.elem_PlayAction.style.display = 'inline';
    }
    this.isRecording = false;
    this.mediaRecorder.stop();
    this.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  public playAction() {
    if(!this.isRecording){
      const audioBlob = new Blob(this.audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }
}
</script>