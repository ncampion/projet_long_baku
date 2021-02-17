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
    <div 
        ref="soundContainer" class="sound-container"
    >

      <div
            v-for="audioTimeline in soundsBar"
            draggable=true
            @dragstart="handleDragStart($event,audioTimeline.idAudioTimeline);"
            @dragover="allowDropTimeline($event);"
            @drop="handleDropTimeline($event);"
            class="sounds"
      >
          {{ audioTimeline.title }}
      </div>
    
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
          Le mode de déplacement actuel est : {{ mode }}
      </div>
    </div>

    <div ref="movieContainer" class="movie-container">
    
    </div>
    
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Movie } from '@/utils/movie.service';
import TimelinesChart from 'timelines-chart';


const ProjectNS = namespace('project');

@Component
export default class AudioDisplayComponent extends Vue {

    @Prop()
    public allShots: Array<any> = [];

    @ProjectNS.State
    public id!: string;

    @ProjectNS.Getter
    protected movie!: Movie;

    @ProjectNS.Getter
    protected getAudioRecord!: any;

    @ProjectNS.Getter
    protected getAudioTimeline!: any;

    private chart: any = TimelinesChart();

    private chartData!: any;
    

    private goForward10 : boolean = true;
    private goForward1 : boolean = false;
    private goBackward1 : boolean = false;
    private goBackward10 : boolean = false;
    private mode : string = "Avancer de 10 frames";



    mounted() {
      this.chartData =
      [
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

      console.log(this.mode);
      
      
      this.chart.data(this.chartData)
            .xTickFormat((n: number): number => +n)
            .timeFormat('%Q')
            .maxHeight(330)
            .onSegmentClick(this.segmentClick)
            .maxLineHeight(70)
            .zQualitative(true)
            .dateMarker(20)
            .enableAnimations(false)
            .segmentTooltipContent(this.segmentTooltip);

      this.chart(this.$refs.movieContainer);
      console.log("Allshots");
      console.log(this.allShots);
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

    segmentClick(segment : any) {
      var nbFrames = 0;
      if (this.goForward1 || this.goForward10) {
        if (this.goForward1) {
          nbFrames = 1;
        } else {
          nbFrames = 10;
        }
        segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] + nbFrames;
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] + nbFrames;
      } 
      
      else {
        if (this.goBackward1) {
          nbFrames = 1;
        } else if (this.goBackward10) {
          nbFrames = 10;
        }
        segment.target.__data__.data.timeRange[0] = segment.target.__data__.data.timeRange[0] - nbFrames;
        segment.target.__data__.data.timeRange[1] = segment.target.__data__.data.timeRange[1] - nbFrames;
      }

      //segment.target.__data__.data.val = "Son 1";
      //segment.target.__data__.labelVal = "Son 2";
      //segment.target.__data__.val = "Son 2";

      this.chart.data(this.chart.data());
      this.chartData = this.chart.data();
      this.chart.refresh();
      return segment;
    }

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


    get soundsBar() {
        const audiosTimeline = this.getAudioTimeline;
        const audiosRecord = this.getAudioRecord;
        const titles = [];

        if (audiosTimeline == null) {
          return null;
        } else {
          for (let audioT in audiosTimeline) {
            for (let audioR in audiosRecord) {
              if (audiosTimeline[audioT].id == audiosRecord[audioR].id) {
                titles.push({
                  id : audiosTimeline[audioT].id,
                  idAudioTimeline : audiosTimeline[audioT].idTimeline,
                  title : audiosRecord[audioR].title,
                });
              }
            }
          }
        }
        return titles;
    }



    backward10() {
      this.goBackward1 = false;
      this.goBackward10 = true;
      this.goForward1 = false;
      this.goForward10 = false;
      this.mode = "Reculer de 10 frames";
    }

    backward1() {
      this.goBackward1 = true;
      this.goBackward10 = false;
      this.goForward1 = false;
      this.goForward10 = false;
      this.mode = "Reculer de 1 frame";
    }

    forward1() {
      this.goBackward1 = false;
      this.goBackward10 = false;
      this.goForward1 = true;
      this.goForward10 = false;
      this.mode = "Avancer de 1 frame";
    }

    forward10() {
      this.goBackward1 = false;
      this.goBackward10 = false;
      this.goForward1 = false;
      this.goForward10 = true;
      this.mode = "Avancer de 10 frames";
    }


    // Drag and drop Timeline

    handleDragStart(event: any, id: string) {
      event.dataTransfer.setData("text", id );
    }

    allowDropTimeline(event: any) {
      event.preventDefault();
    }

    public async handleDropTimeline(event: any) {
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");
      
      await this.$store.dispatch('project/createAudioTimeline', data);

      this.$emit('close');
      event.dataTransfer.clearData();

    }





    // Drop from the Record sounds list

    allowDrop(event: any) {
      event.preventDefault();
    }

    public async handleDrop(event: any) {
      event.preventDefault();
      
      var data = event.dataTransfer.getData("text");
      
      await this.$store.dispatch('project/createAudioTimeline', data);

      this.$emit('close');
      event.dataTransfer.clearData();
    }

}
</script>