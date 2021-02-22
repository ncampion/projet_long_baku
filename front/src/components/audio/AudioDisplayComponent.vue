<style lang="scss" scoped>
@import "@/styles/audioDisplay.scss";
</style>


<template>
  <div
    class="audioDisplay-root-div"
    dropzone=true
    @dragover="allowDrop($event);"
    @drop="handleDrop($event);"
  >

    <div class="toolbar">
      
    <!--TODO -->

    </div>
    
    

    <div class="horizontal-align">
      <div class="padding-button">
        <i class="button is-primary" @click="backward10">Reculer de 10 frames</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="backward1">Reculer de 1 frame</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="forward1">Avancer de 1 frame</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="forward10">Avancer de 10 frames</i>
      </div>

      <div class="padding-button">
        <i class="button is-primary" @click="deleteAudioSegment">Supprimer un son</i>
      </div>

      <div class="padding-button">
          Mode : {{ mode }}
      </div>
    </div>

    <div ref="movieContainer" class="movie-container">
    
    </div>
    
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Movie } from '@/utils/movie.service';
import TimelinesChart from 'timelines-chart';
import { Shot } from '@/utils/movie.service';


const ProjectNS = namespace('project');

@Component
export default class AudioDisplayComponent extends Vue {


    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected movie!: Movie;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    @ProjectNS.Getter
    protected getSoundTimeline!: any;

    private chart: any = TimelinesChart();

    private chartData!: any;

    public allShots: Array<any> = [];

    private goForward10 : boolean = true;
    private goForward1 : boolean = false;
    private goBackward1 : boolean = false;
    private goBackward10 : boolean = false;
    private deleteSound : boolean = false;
    private mode : string = "Avancer de 10 frames";
    private nbTotalFrames : number = 0;



    mounted() {
      this.chartData = this.getChart();

      console.log(this.mode);
      
      
      this.chart.data(this.chartData)
            .xTickFormat((n: number): number => +n)
            .timeFormat('%Q')
            .maxHeight(330)
            .onSegmentClick(this.segmentClick)
            .maxLineHeight(70)
            .zQualitative(true)
            .dateMarker(1)
            .enableAnimations(false)
            .segmentTooltipContent(this.segmentTooltip);

      this.chart(this.$refs.movieContainer);
    }
    
    
    getChart(){
      return [
          {
            group: "SONS",
            data: [
              {
                label: "Piste 1",
                data: [
                  {
                    timeRange: [1, 5],
                    val: "Son 1"
                  },
                  {
                    timeRange: [10, 15],
                    val: "Son 2"
                  },
                ]
              },
              {
                label: "Piste 2",
                data: [
                  {
                    timeRange: [2, 8],
                    val: "Son 3"
                  },
                  {
                    timeRange: [8, 18],
                    val: "Son 4"
                  },
                ],
              },
            ],
          },
          {
            group: "PLANS",
            data: [
              {
                label: " ",
                data: this.getChartFromShots()
              },
            ],
          },
        ];
    }

    public actualizeDateMarker(newFrame: number){
      this.chart.dateMarker(newFrame);
    }

    public setAllShots(shots: Shot[]){
      this.allShots = shots;
      for (var shot of this.allShots) {
        this.nbTotalFrames = this.nbTotalFrames + shot.images.length;
      }
      this.chart.data(this.getChart());
    }

    getChartFromShots(){
      if(this.allShots){
        const nSegments = this.allShots.length
        let runLength = 1;

        return [...Array(nSegments).keys()].map(i => {
          const start = runLength,
            end = runLength + this.allShots[i].images.length;

          runLength = end;

          return {
            timeRange: [start, end],
            val: `Plan ${i+1}`
          };
        });
      } else {
        return [];
      }

    }


    segmentTooltip(d : any) {
      return d.labelVal+'<br>'
            + "From : " + (Math.round(d.data.timeRange[0])) + '<br>'
            + "To : "  + (Math.round(d.data.timeRange[1]));
    }

    public async segmentClick(segment : any) {
      if (this.goBackward1 || this.goBackward10 || this.goForward1 || this.goForward10) {
        var updatedStartEnd = this.moveSound(segment);
        var soundTimelineId = segment.target.__data__.data.soundTimelineId;
        await this.$store.dispatch('project/updateSoundTimelineStart', { soundTimelineId, start : updatedStartEnd[0], end : updatedStartEnd[1] });
      }

      if (this.deleteSound) {
        this.removeSoundTimeline(segment);
      }

      //segment.target.__data__.data.val = "Son 1";
      //segment.target.__data__.labelVal = "Son 2";
      //segment.target.__data__.val = "Son 2";

      this.chart.data(this.chart.data());
      this.chartData = this.chart.data();
      this.chart.refresh();
      return segment;
    }

  moveSound(segment : any) {
    var nbFrames = 0;
    if (this.goForward1 || this.goForward10) {
      if (this.goForward1) {
        nbFrames = 1;
      } else {
        nbFrames = 10;
      }

      if (segment.target.__data__.data.timeRange[0] + nbFrames >= this.nbTotalFrames) {
          segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - segment.target.__data__.data.timeRange[0] + this.nbTotalFrames + 1;
          segment.target.__data__.data.timeRange[0] = this.nbTotalFrames + 1;
      } else {
          segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] + nbFrames;
          segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] + nbFrames;
      }
    } else {
      if (this.goBackward1) {
        nbFrames = 1;
      } else if (this.goBackward10) {
        nbFrames = 10;
      }
      if (segment.target.__data__.timeRange[0] - nbFrames <= 0) {
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - segment.target.__data__.timeRange[0] + 1;
        segment.target.__data__.data.timeRange[0] = 1;
      } else {
        segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] - nbFrames;
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - nbFrames;
      }
    }

    return [segment.target.__data__.data.timeRange[0], segment.target.__data__.data.timeRange[1]];
  }

  public async removeSoundTimeline(segment : any) {
    var soundTimelineId = segment.target.__data__.data.soundTimelineId;
    await this.$store.dispatch('project/removeSoundTimeline', soundTimelineId);
    var updatedData = this.chart.data();
    var pisteNumber = segment.target.__data__.label.split(" ")[1] - 1;
    var soundTimelineId = segment.target.__data__.data.soundTimelineId;
    const index = updatedData[0].data[pisteNumber].data.findIndex((p) => p.soundTimelineId === soundTimelineId);

    updatedData[0].data[pisteNumber].data.splice(index,1);
    this.chart.data(updatedData);
    
  }

/*
    genRandomData() {
      const NLINES = 3,
        MAXSEGMENTS = 4,
        MIN_X = 0,
        MAX_X = 100;

      return [{
        group: '',
        data: [...Array(NLINES).keys()].map(i => ({
          label: `line${i+1}`,
          data: getSegmentsData()
        }))
      }];

      //

      function getSegmentsData() {
        const nSegments = Math.ceil(Math.random()*MAXSEGMENTS),
          segMaxLength = Math.round((MAX_X-MIN_X)/nSegments);
        let runLength = MIN_X;

        return [...Array(nSegments).keys()].map(i => {
          const tDivide = [Math.random(), Math.random()].sort(),
            start = runLength + tDivide[0]*segMaxLength,
            end = runLength + tDivide[1]*segMaxLength;

          runLength = runLength + segMaxLength;

          return {
            timeRange: [start, end],
            val: Math.random()
          };
        });
      }
    }

*/

    backward10() {
      this.setFalse();
      this.goBackward10 = true;
      this.mode = "Reculer de 10 frames";
    }

    backward1() {
      this.setFalse();
      this.goBackward1 = true;
      this.mode = "Reculer de 1 frame";
    }

    forward1() {
      this.setFalse();
      this.goForward1 = true;
      this.mode = "Avancer de 1 frame";
    }

    forward10() {
      this.setFalse();
      this.goForward10 = true;
      this.mode = "Avancer de 10 frames";
    }

    deleteAudioSegment() {
      this.setFalse();
      this.deleteSound = true;
      this.mode = "Supprimer un son";
    }

    setFalse() {
      this.goBackward1 = false;
      this.goBackward10 = false;
      this.goForward1 = false;
      this.goForward10 = false;
      this.deleteSound = false;
    }



    // Drop from the Record sounds list

    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      event.preventDefault();
      
      var idAndTitle = event.dataTransfer.getData("text").split("@");
      var audioId = idAndTitle[0];
      var title = idAndTitle[1];
      var start = this.chart.dateMarker();
      var end = start + 5;
      const soundTimelineId = await this.$store.dispatch('project/createSoundTimeline', {audioId, start, end});

      this.addAudio(audioId, title, soundTimelineId);
      this.chart.data(this.chartData);
      this.chart.refresh();
      await this.$store.dispatch('project/createAudioTimeline', this.chartData);
      this.$emit('close');
      console.log(this.getSoundTimeline);
      event.dataTransfer.clearData();
    }

    addAudio(audioId : string, title : string, soundTimelineId : string) {
      var numPiste = this.chartData[0].data.length + 1;
      var start = this.chart.dateMarker();
      var end = start + 5;
      var timeRange = [start, end];
      var data = [
        {
          timeRange : timeRange,
          val : title,
          audioId : audioId,
          soundTimelineId : soundTimelineId,
        }
      ];
      this.chartData[0].data.push({
        label : "Piste " + numPiste,
        data : data,
      });
    }

}
</script>