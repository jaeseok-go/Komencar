<template>
  <div>
    <div>
      <div class="camera-button-div" @click="onClickImageUpload">
        <input
          ref="imageInput"
          type="file"
          hidden
          @change="onChangeImages"
          :v-model="carImagePic"
          accept="image/jpeg,image/jpg"
        />
        <CarImageBtn
          text="Camera"
          ref="imgUpload"
          @progress="moveProgress"
          @progress-finished="endProgress"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import CarImageBtn from "@/components/carSearch/CarImageBtn.vue";
import { searchModelImg, findModelId } from "@/api/index";
import bus from "@/utils/bus";

export default Vue.extend({
  components: {
    CarImageBtn
  },

  data() {
    return {
      imageUrl: null,
      carImagePic: String,
      modelId: Number,
      modelDetailId: Number,
      modelName: String,
      modelDetailName: String,
      imagefile: null,
      endLoading: false
    };
  },
  methods: {
    onClickImageUpload() {
      this.$refs.imageInput.click();
    },
    onChangeImages(e) {
      const file = e.target.files[0];

      this.imagefile = file;
      this.imageUrl = URL.createObjectURL(file);
      this.sendImages();
    },
    sendImages() {
      if (this.imagefile) {
        this.$emit("unactive");
        this.$refs.imgUpload.progressClickEvent();
        const imagePic = new FormData();
        imagePic.append("file", this.imagefile, String(".jpg"));
        searchModelImg(imagePic)
          .then(res => {
            if (res.data.trim() == "unknown") {
              this.endLoading = true;
              this.$swal({
                text:
                  "죄송합니다. 학습되지 않은 데이터입니다. 더 학습하고 돌아오겠습니다.",
                customClass: {
                  container: "swal2-container"
                },
                icon: "warning",
                timer: 1300,
                showConfirmButton: false
              }).then(() => {
                window.location.reload();
              });
            } else if (res.data.trim() == "not front") {
              this.endLoading = true;
              this.$swal({
                text: "앞모습이 아닙니다. 다시 촬영 부탁드립니다.",
                customClass: {
                  container: "swal2-container"
                },
                icon: "warning",
                timer: 1300,
                showConfirmButton: false
              }).then(() => {
                window.location.reload();
              });
            } else {
              findModelId(res.data)
                .then(response => {
                  this.endLoading = true;

                  this.$store.commit("MODEL_INFO", response.data);
                  this.$store.commit("MODEL_NAME", response.data.name);
                  this.$store.dispatch("FETCH_LATEST", response.data.id);
                  this.$store.dispatch(
                    "SIMILAR_PRICE",
                    response.data.modelDetailList[0].id
                  );
                  this.$store.dispatch(
                    "SAME_SEGMENT",
                    response.data.modelDetailList[0].id
                  );
                  setTimeout(() => {
                    bus.$emit("on:progress");
                    this.$router.push({
                      name: "Main",
                      params: { modelInfo: response.data }
                    });
                  }, 3000);
                })
                .catch(() => {
                  this.endLoading = true;
                  this.$swal({
                    text: "사진을 업로드 하던 중 오류가 발생했습니다.",
                    customClass: {
                      container: "swal2-container"
                    },
                    icon: "warning",
                    timer: 1300,
                    showConfirmButton: false
                  }).then(() => {
                    window.location.reload();
                  });
                });
            }
          })
          .catch(() => {
            this.endLoading = true;
            this.$swal({
              text: "사진을 업로드 하던 중 오류가 발생했습니다.",
              customClass: {
                container: "swal2-container"
              },
              icon: "warning",
              timer: 1300,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          });
      }
    },
    moveProgress(progress = 0) {
      const progressTimeout = setTimeout(() => {
        clearTimeout(progressTimeout);

        if (!this.endLoading) {
          const newProgress = progress + 1;
          this.$refs.imgUpload.moveProgress(newProgress);
          this.moveProgress(newProgress);
        } else {
          this.$refs.imgUpload.moveProgress("finish");
        }
      }, 150);
    },
    endProgress() {
      const endProgressTimeout = setTimeout(() => {
        clearTimeout(endProgressTimeout);

        this.$refs.imgUpload.resetProgress();
      }, 500);
      // this.$router.push({
      //   name: "Main",
      //   params: {
      //     m_id: this.modelId,
      //     md_id: this.modelDetailId,
      //     m_name: this.modelName,
      //     md_name: this.modelDetailName
      //   }
      // });
    }
  }
});
</script>
