<template>
  <v-card>
    <v-card-title>
      <v-toolbar-title>Continuous Integration Manager</v-toolbar-title>
    </v-card-title>
    <v-data-table :items="continuousIntegrations" :headers="continuousIntegrationsHeaders" :loading="continuousIntegrationsLoading" hide-actions>
      <template slot="items" slot-scope="props">
        <td>
            <v-btn icon    slot="activator" >
              <v-icon large color="red lighten-1" v-if="props.item.ciId=='not created'">remove_circle</v-icon>
              <v-icon large color="green darken-2" v-else>check_circle</v-icon>
            </v-btn>
        </td>
        <td>{{ props.item.ciId }}</td>
        <td>{{ props.item.host }}</td>
        <td>
            <v-btn icon @click.native.stop="continuousIntegrationDisplay()" v-if="props.item.ciId=='not created'">
              <v-icon large>build</v-icon>
            </v-btn>
            <a :href="`${props.item.host}`" target="_blank" class="btn btn--flat btn--router indigo--text" v-if="props.item.ciId!='not created'">
              <v-icon large>open_in_new</v-icon>
            </a>
            <v-btn icon  @click.native="openRemoveContinuousIntegrationDialog(props.index)" v-if="props.item.ciId!='not created'">
              <v-icon large>delete</v-icon>
            </v-btn>
        </td>
      </template>
    </v-data-table>

    <!-- continuous integration dialogs -->
    <v-dialog v-model="createContinuousIntegrationDisplay" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Add Continuous Integration</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-form v-model="valid" ref="createSourceControlForm" >
            <v-layout row wrap><v-flex xs12>
              <v-text-field prepend-icon="" v-model="newContinuousIntegration.scmURL" placeholder="Source Control URL" :rules="rules.scmURL"></v-text-field>
            </v-flex></v-layout>
            <v-layout row wrap><v-flex xs12>
              <v-select :items="continuousIntegrationItems" label="Continuous Integration" v-model="newContinuousIntegration.ci" item-text="name" single-line bottom :rules="rules.continuousIntegration"></v-select>
            </v-flex></v-layout>
            <v-layout row wrap><v-flex xs12>
              <v-select :items="continuousIntegrationImageItems" label="Image" v-model="newContinuousIntegration.image" item-text="name" single-line bottom :rules="rules.image"></v-select>
            </v-flex></v-layout>
          </v-form>
          <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createContinuousIntegrationAlert.opened" dismissible=""> {{ createContinuousIntegrationAlert.message }}</v-alert>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="closeCreateContinuousIntegration()">Cancel</v-btn>
          <v-btn color="primary" @click="addContinuousIntegration">Save</v-btn>
        </v-card-actions>
        
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeContinuousIntegrationDisplay" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Remove Continuous Integration</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap><v-flex xs12>
              <h1 class="title">Are you sure you want to remove the continuous integration?</h1>
          </v-flex></v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="removeContinuousIntegrationDisplay=false">Cancel</v-btn>
          <v-btn flat @click="removeContinuousIntegration()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeContinuousIntegrationAlert.opened" > {{ removeContinuousIntegrationAlert.message }}</v-alert>
      </v-card>
    </v-dialog>
    <!-- end continuous integration dialogs -->
  </v-card>


  
</template>

<script>

import ContinuousIntegrationsService from '../services/ContinuousIntegrations';
import SourceControlsService from '../services/SourceControls';
import VendorsService from '../services/Vendors';
const initContinuousIntegration = {
  ci: {},
  scmURL: ''
};
const initAlert = {
  message: '',
  opened: false
}
export default {
  name: 'ContinuousIntegrationManager',
  data() {
    return {
      valid: true,

      // Continuous integrations
      createContinuousIntegrationDisplay: false,
      removeContinuousIntegrationDisplay: false,
      createContinuousIntegrationAlert: Object.assign({}, initAlert),
      removeContinuousIntegrationAlert: Object.assign({}, initAlert),

      continuousIntegrationItems: [],
      newContinuousIntegration: Object.assign({}, initContinuousIntegration),
      continuousIntegrations: [],
      continuousIntegrationsLoading: false,
      continuousIntegrationsHeaders: [
        { value: 'configured', text: 'Configured', align: 'left', sortable: false },
        { value: 'continuousIntegrationId', text: 'Vendor', align: 'left', sortable: false },
        { value: 'host', text: 'Host', align: 'left', sortable: false },
      ],

      rows: [10, 20, 50, { text: 'All', value: -1 }],

      // Rules
      rules: {
        scmURL: [
          (value) => !!value || 'URL required',
          (value) => /^(http[s]?:\/\/){1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(value) || !value || 'URL must be valid',
        ],
        continuousIntegration: [
          (value) => (value != null && !!value.name) || 'Continuous integration is required',
        ],
        image: [
          (value) => !!value || 'Image is required'
        ]
      },
    };
  },
  computed: {
    continuousIntegrationImageItems: function () {
      if (this.newContinuousIntegration.ci) {
        return this.newContinuousIntegration.ci.images;
      } else {
        return [];
      }
    }
  },

  created() {
    this.fetch();
  },

  methods: {
    // continuous integration functions
    fetch() {
      this.continuousIntegrationsFetch();
      this.continuousIntegrationItemsFetch();
    },
    continuousIntegrationsFetch() {
      this.continuousIntegrationsLoading = true;
      return ContinuousIntegrationsService.all(this.$route.params.account).then(result => {
        if (result.code) {
          this.continuousIntegrations = [];
          const emptyContinuousIntegration = { ciId: 'not created', scmURL: ''};
          this.continuousIntegrations.push(emptyContinuousIntegration);
        } else {
          this.continuousIntegrations = [];
          this.continuousIntegrations.push(result);
        }
        this.continuousIntegrationsLoading = false;
      });
    },
    continuousIntegrationItemsFetch() {
      return VendorsService.allConstinuousIntegrations()
        .then(result => {
          if (result.code) {
          } else {
            this.continuousIntegrationItems = result;
          }
      });
    },
    sourceControlFetch() {
      return SourceControlsService.all(this.$route.params.account).then(result => {
        if (result.code) {
          this.newContinuousIntegration.scmURL = "";
        } else {
          this.newContinuousIntegration.scmURL = result.host;
        }
      });
    },

    continuousIntegrationDisplay() {
      this.createContinuousIntegrationDisplay = true;
      this.sourceControlFetch();
    },

    addContinuousIntegration() {
      // Validations
      if (!this.$refs.createSourceControlForm.validate()) {
        return;
      }  

      const requestBody = {
        ciId: this.newContinuousIntegration.ci.name,
        image: this.newContinuousIntegration.image.name,
        secondImage: this.newContinuousIntegration.image.secondary,
        scmURL: this.newContinuousIntegration.scmURL,
      };
      ContinuousIntegrationsService.add(this.$route.params.account, requestBody).then(result => {
        if (result.code) {
          this.createContinuousIntegrationAlert.message = result.msg;
          this.createContinuousIntegrationAlert.opened = true;
        } else {
          this.cleanCreateContinuousIntegrationAlert();
          this.createContinuousIntegrationDisplay = false;
          this.continuousIntegrationsFetch();
        }
      });
    },
    closeCreateContinuousIntegration() {
      this.cleanCreateContinuousIntegrationAlert();
      this.createContinuousIntegrationDisplay = false;
    },
    cleanCreateContinuousIntegrationAlert() {
      // Clean alerts
      this.createContinuousIntegrationAlert = Object.assign({}, initAlert);
      // clean continuous integration data
      this.newContinuousIntegration = Object.assign({}, JSON.parse(JSON.stringify(initContinuousIntegration)));
      // clean subforms
      this.$refs.createSourceControlForm.reset();
    },

    openRemoveContinuousIntegrationDialog(continuousIntegrationIndex) {
      this.selectedContinuousIntegration = this.continuousIntegrations[continuousIntegrationIndex];
      this.removeContinuousIntegrationDisplay = true;
    },
    removeContinuousIntegration() {
      ContinuousIntegrationsService.remove(this.$route.params.account, this.selectedContinuousIntegration.ciId).then(result => {
        if (result.code) {
          this.removeContinuousIntegrationAlert.message = result.msg;
          this.removeContinuousIntegrationAlert.opened = true;
        } else {
          this.closeRemoveContinuousIntegration();
          this.continuousIntegrationsFetch();
        }
      });
    },
    closeRemoveContinuousIntegration() {
      this.clearRemoveContinuousIntegrationAlert();
      this.removeContinuousIntegrationDisplay = false;
    },
    clearRemoveContinuousIntegrationAlert() {
      this.removeContinuousIntegrationAlert = Object.assign({}, initAlert);
    },
  
  },
};
</script>

<style scoped>

</style>
