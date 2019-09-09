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
                   <md-progress-bar md-mode="determinate" :md-value="uploadPercentage">
                   </md-progress-bar>
                   <h3>{{ `${uploadPercentage} %` }}</h3>
                </md-card-content>
            </md-card>
            <md-snackbar
                md-position="center"
                :md-active.sync="authFail"
                md-persistent>
                <span>Please Login First</span>
            </md-snackbar>
            <md-snackbar
                md-position="center"
                :md-active.sync="present"
                md-persistent>
                <span>File already uploaded</span>
            </md-snackbar>
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
            login: true,
            uploadPercentage: 0,
            alreadyPresent: 0,
            authFail: false,
            present: false,
        };
    },
    methods: {
        upload(fileList) {
            const file = fileList[0];

            const name = file.name;
            const size = file.size.toString();
            const fileId = `${file.name}-${file.lastModified}`;

            const formData = new FormData();
            formData.append('image', fileList[0]);
            let headers = {};

            if (this.login) {
                headers = {
                    user: this.login,
                    size,
                    name,
                    fileId,
                };
            }
            axios({url: '/status', headers}).then((res) => {
                if (res.data.type && res.data.type == 'Authentication failure') {
                    this.authFail = true;
                    return;
                }
                this.alreadyPresent = Math.round(100 * res.data.uploaded / size);
                this.uploadPercentage = this.alreadyPresent;
                if (res.data.uploaded == size) {
                    this.present = true;
                }
                else {
                    headers.startfrom = res.data.uploaded;
                    axios.post('/upload', file.slice(res.data.uploaded, size + 1), {
                        headers,
                        onUploadProgress: (e) => {
                            const percentage = Math.round((e.loaded * 100) / size);
                            this.uploadPercentage = this.alreadyPresent + percentage;
                        },
                    }).then((res) => {
                        this.alreadyPresent = 0;
                    })
                }
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