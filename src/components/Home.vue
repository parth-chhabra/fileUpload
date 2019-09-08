<template>
    <div>
        <div class="upload-box">
            <md-card>
                <md-card-header>
                    <div class="md-title">FILE UPLOAD</div>
                    <md-button class="md-raised" @click="loginUser">
                        {{ login ? 'Logout' : 'Login' }}
                    </md-button>
                </md-card-header>

                <md-card-content>
                    <md-field>
                        <label>upload file here</label>
                        <md-file v-model="file" @md-change="upload" />
                    </md-field>
                </md-card-content>
            </md-card>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
      return {
          file: null,
          login: false,
      };
  },
  methods: {
      upload(fileList) {
          const formData = new FormData();
          formData.append('image', fileList[0]);
          let headers = {};
          if (this.login) {
              headers = {user: this.login};
          }
          axios.post('/upload', formData, {headers}).then((res) => {
              console.log(res);
          });
      },
      loginUser() {
          this.login = !this.login;
      },
  },
}
</script>

<style scoped>
    .upload-box {
        width: 900px;
        margin: auto;
        padding-top: 50px;
    }
</style>