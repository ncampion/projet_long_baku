<template>
  <div style="padding: 5px;" v-if="isWebRTCSupported">
    <p></p>
    <h1 v-if="isConnected">
      Synchronisation en
      <span class="has-text-success">OK</span>
    </h1>
    <h1 v-else>Synchronisation en cours...</h1>
    <b-progress :value="progressStatus" type="is-success"></b-progress>
    <h1 class="dependsOnOrientationOk">
      Orientation
      <span class="has-text-success">OK</span>
    </h1>
    <ul class="dependsOnOrientation">
      <li>Pensez à placer votre téléphone en mode paysage (activer la rotation automatique)</li>
    </ul>
    <img class="dependsOnOrientation" src="@/assets/rotate_phone.gif" />
    <video id="localVideo" style="opacity:0" autoplay playsinline width="1920" height="1080"></video>
  </div>
  <div v-else>Synchronisation non supportée par votre navigateur</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import store from '@/store';
import { SocketStatus } from '@/store/store.types';
import { Device } from '@/utils/device.class';
import { WSSocket, WSMessage } from '@/utils/socket.class';


const WebrtcNS = namespace('webrtc');
const SocketNS = namespace('socket');

@Component({
  components: {},
  store,
})
export default class SmartphoneView extends Vue {
  @WebrtcNS.State
  public isConnected!: boolean;

  @SocketNS.State
  private socketStatus!: SocketStatus;

  public socketId!: string;

  @SocketNS.State('socket')
  private socket!: WSSocket;

  public localVideo: any;

  public peerConnection!: RTCPeerConnection;

  private device = new Device('smartphone', 'Smartphone');

  public isWebRTCSupported = true;

  public progressStatus: number = 0;

  public created() {
    const { socketId } = this.$route.params;
    this.socketId = socketId;
  }

  public mounted() {
    this.isWebRTCSupported = (!!navigator.mediaDevices.getUserMedia && !!window.RTCPeerConnection);

    if (!this.isWebRTCSupported) {
      return;
    }

    this.$store.dispatch('socket/addEventListener', {
      message: 'message',
      callback: (event: any) => {
        const message: WSMessage = JSON.parse(event.data);
        switch (message.action) {
          case 'rtcOffer':
            this.progressStatus = 50;
            this.startStream(message.value);
            break;
          case 'icecandidate':
            if (message.value) {
              this.peerConnection.addIceCandidate(message.value);
            }
            break;
          default:
            console.log('default', message);
          // this.startStream(message.value);
        }
      },
    });
    if (this.socketStatus === 'opened') {
      this.progressStatus = 25;
      this.socket.sendWSMessage({ action: 'link', value: this.socketId });
    }
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    this.peerConnection.addEventListener(
      'icecandidate',
      this.onIceCandidate.bind(this),
    );

    this.peerConnection.oniceconnectionstatechange = (_event) => {
      if (this.peerConnection.iceConnectionState === 'connected') {
        this.progressStatus = 100;
        // CONNECTION OK
        this.$store.commit('webrtc/setupConnection');
      }
      if (this.peerConnection.iceConnectionState === 'disconnected') {
        delete this.peerConnection;
        this.localVideo.srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            track.stop();
          });
        window.close();
      }
    };
  }

  @Watch('socketStatus')
  public onSocketStatusChanged() {
    if (this.socketStatus === 'opened') {
      this.progressStatus = 25;
      this.socket.sendWSMessage({ action: 'link', value: this.socketId });
    }
    if (this.socketStatus === 'error') {
      this.progressStatus = 25;
    }
  }

  private async startStream(remoteOffer: any) {
    this.localVideo = document.getElementById('localVideo');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 },
          facingMode: {
            exact: 'environment',
          },
        },
      });
    } catch (e) {
      this.isWebRTCSupported = false;
      return;
    }

    this.localVideo.srcObject = stream;

    this.peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      this.setChannelEvents(dataChannel);
    };

    stream.getVideoTracks().forEach((track) => {
      try {
        this.peerConnection.addTrack(track, stream);
      } catch (e) {
        this.isWebRTCSupported = false;
      }
    });

    try {
      await this.peerConnection.setRemoteDescription(remoteOffer);
    } catch (e) {
      console.error('Failed to set remote description', e);
    }

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.progressStatus = 75;
      this.socket.sendWSMessage({ action: 'rtcAnswer', value: answer });
    } catch (e) {
      console.error('Failed sending answer', e);
    }
  }

  private setChannelEvents(channel: RTCDataChannel) {
    // eslint-disable-next-line no-param-reassign
    channel.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'cmd') {
        this.device.capture(
          'localVideo',
          { scaleX: data.scaleX, scaleY: data.scaleY },
          data.projectId,
          (id) => {
            channel.send(
              JSON.stringify({
                type: 'capture',
                message: id,
              }),
            );
          },
          (id) => channel.send(
            JSON.stringify({
              type: 'upload',
              message: id,
            }),
          ),
          (e) => console.error('Unable to capture', e),
        );
      }
    };

    // eslint-disable-next-line no-param-reassign
    channel.onerror = (e) => {
      console.error('channel.onerror', JSON.stringify(e, null, '\t'));
    };

    // eslint-disable-next-line no-param-reassign
    channel.onclose = (e) => {
      console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
    };
  }

  private onIceCandidate(event: any) {
    this.socket.sendWSMessage({
      action: 'icecandidate',
      value: event.candidate,
    });
  }
}

// function getOsSupport() : boolean {
//   const ua = navigator.userAgent.toLowerCase();
//   const isAndroid = ua.indexOf('android') > -1; // && ua.indexOf("mobile");
//   const match = ua.match(/android\s([0-9\.]*)/i);
//   const androidNumber = match ? parseInt(match[1], 10) : undefined;
//   if (isAndroid && androidNumber && androidNumber < 8) {
//     return false;
//   }
//   return true;
// }
</script>

<style lang="scss" scoped>
h1 {
  font-display: 18px;
}

@media screen and (orientation: portrait) {
  .dependsOnOrientation {
    display: block;
  }
  .dependsOnOrientationOk {
    display: none;
  }
}
@media screen and (orientation: landscape) {
  .dependsOnOrientation {
    display: none;
  }
  .dependsOnOrientationOk {
    display: block;
  }
}
</style>
