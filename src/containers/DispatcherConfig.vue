<template>
  <div style="background:#fff">
    <v-toolbar card class="white" prominent>
      <v-icon light large>assignment</v-icon>
      <v-toolbar-title>Dispatcher Configuration</v-toolbar-title>
    </v-toolbar>

    <v-divider />

    <v-container fluid>

      <v-layout row wrap>
        <v-flex xs4><v-select :items="deploymentItems"  v-model="deployment" item-text="environmentId" item-value="environmentId" label="Select a deployment"></v-select></v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-alert color="error" icon="warning" v-model="configMapAlert.opened" dismissible=""> {{ configMapAlert.message }}</v-alert>
      </v-layout>

      <p><b>Deployment: </b>{{ this.newConfigMaps.environmentId }}</p>
      
      <div >
        <v-layout row wrap><v-flex xs4>
          <v-select :items="configMapFileItems"  v-model="configurationFileSelected" item-text="name" item-value="name" label="Select a file"></v-select>
        </v-flex></v-layout>
        <v-layout row wrap>
          <editor v-model="configurationFile" lang="html" theme="chrome" width="100%" height="700" disabled></editor>
        </v-layout>

        <v-alert :type="saveConfigMapAlert.type" v-model="saveConfigMapAlert.opened" dismissible=""> {{ saveConfigMapAlert.message }}</v-alert>
        <v-layout row wrap>
          <v-flex xs6><v-btn color="primary" @click.native="saveConfigMap()">Save</v-btn></v-flex>
        </v-layout>
      </div>

    </v-container>

  </div>

</template>

<script>

  import EnvironmentsService from '../services/Environments';
  import ConfigMaptsService from '../services/ConfigMaps';
  import Editor from 'vue2-ace-editor'

  const initConfigMap = {
    clientId: '',
    environmentId: '',
    name: '',
    data: {}
  }

  const initAlert = {
    message: '',
    opened: false,
    type: 'error'
  }

  export default {
    name: 'Environments',
    data() {
      return {

          configMapAlert: Object.assign({}, initAlert),
          saveConfigMapAlert: Object.assign({}, initAlert),

          configMapFileItems: [
            {name: "bedrock.conf"},
            {name: "publish_dispatcher.any"}
          ],
          configurationFileSelected: "",
          //configurationFile: "",

          deploymentItems: [],
          deployment: "",
          account: "",
          newConfigMaps: Object.assign({}, JSON.parse(JSON.stringify(initConfigMap))),
      }
    },

    computed: {
      bedrockConf: {
        get: function () {
          //console.log("get1");
          if (this.newConfigMaps.data && this.newConfigMaps.data["bedrock.conf"]) {
            return this.newConfigMaps.data["bedrock.conf"];
          } else {
            return "";
          }
        },
        set: function(newValue) {
          //console.log("set1");
          this.newConfigMaps.data["bedrock.conf"] = newValue;
        }
      },
      publishDispatcherAny: {
        get: function () {
          if (this.newConfigMaps.data && this.newConfigMaps.data["publish_dispatcher.any"]) {
            return this.newConfigMaps.data["publish_dispatcher.any"];
          } else {
            return "";
          }
        },
        set: function(newValue) {
          this.newConfigMaps.data["publish_dispatcher.any"] = newValue;
        }
      },
      configurationFile: {
        get: function() {
          if (this.newConfigMaps.data && this.newConfigMaps.data[this.configurationFileSelected]) {
            return this.newConfigMaps.data[this.configurationFileSelected];
          } else {
            return "";
          }
        },
        set: function(newValue) {
          this.newConfigMaps.data[this.configurationFileSelected] = newValue;
        }
      }
    },

    watch: {
      deployment: function(newDeployment, oldDeployment) {
        this.loadConfigMap();
      }
    },
    
    created() {
      this.fetch();
    },
    

    components: {
        editor: Editor,
    },

    methods: {
        fetch() {
          this.fetchDeployments();
        },
        fetchDeployments() {
          this.account = this.$route.params.account;
          return EnvironmentsService.all(this.account).then(result => {
            if (result.code) {
            } else {
              this.deploymentItems = result;
            }
          });
        },

        loadConfigMap() {
          return ConfigMaptsService.allDispatcherConfig(this.$route.params.account, this.deployment).then(result => {
            if (result.code) {
              this.configMapAlert.message = result.msg;
              this.configMapAlert.opened = true;
              this.configMapAlert.type = "error";
            } else {
              this.newConfigMaps = result;
            }
          });
        },

        saveConfigMap: function () {
          if (!this.newConfigMaps.environmentId) {
            this.saveConfigMapAlert.message = "Deployment not selected";
            this.saveConfigMapAlert.opened = true;
            this.saveConfigMapAlert.type = "error";
            return;
          }

          var auxData = {};
          auxData["bedrock.conf"] = this.bedrockConf;
          auxData["publish_dispatcher.any"] = this.publishDispatcherAny;

          const requestBody = {
            clientId: this.newConfigMaps.clientId,
            environmentId: this.newConfigMaps.environmentId,
            name: this.newConfigMaps.name,
            data: auxData,
          }
          ConfigMaptsService.updateDispatcherConfig(this.$route.params.account, this.deployment, requestBody).then(result => {
            if (result.code) {
              this.saveConfigMapAlert.message = result.msg;
              this.saveConfigMapAlert.opened = true;
              this.saveConfigMapAlert.type = "error";
            } else {
              this.saveConfigMapAlert.message = "Dispatcher configuration saved";
              this.saveConfigMapAlert.opened = true;
              this.saveConfigMapAlert.type = "success";
            }
          });
        }
    }
  }
    


</script>

<style scoped>

</style>
