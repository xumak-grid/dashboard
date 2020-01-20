<template>
  <div style="background:#fff">
    <v-toolbar card class="white" prominent>
      <v-icon light large>fa-rocket</v-icon>
      <v-toolbar-title>Deployments</v-toolbar-title>
      <v-btn flat class="teal--text text--darken-2" left @click.native.stop="add=true">
        <v-icon light class="teal--text text--darken-2" left>add</v-icon>Add
      </v-btn>

    </v-toolbar>
    <v-divider />
    <v-container fluid>
      <v-layout>
        <v-flex xs12 sm12>
          <v-card>
            <v-card-title>
              <v-spacer></v-spacer>
              <v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
            </v-card-title>
            <v-data-table :items="environments" :headers="headers" :search="search" v-model="selected" selected-key="name" :rows-per-page-items="rows" :loading="loading">
              <template slot="items" slot-scope="props">
                <td>{{ props.item.environmentId }}</td>
                <td>{{ props.item.spec.authors.replicas }}</td>
                <td>{{ props.item.spec.publishers.replicas }}</td>
                <td>{{ props.item.spec.dispatchers.replicas }}</td>
                <td>{{ props.item.status || "Pending"}}</td>
                <td>
                  <v-tooltip right>
                    <v-btn icon  large  slot="activator" @click="$router.push(`/deployments/${$route.params.account}/instances/${props.item.environmentId}`)">
                      <v-icon large>details</v-icon>
                    </v-btn>
                    <span>Instances</span>
                  </v-tooltip>
                  <v-btn icon  @click.native="openUpdateDeploymentDialog(props.index)">
                    <v-icon large>build</v-icon>
                  </v-btn>
                  <v-btn icon  @click.native="openRemoveDeploymentDialog(props.index)">
                    <v-icon large>delete</v-icon>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="add" width="600px" persistent>
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >
          Add AEM Deployment
        </v-card-title>
        <v-form v-model="valid" ref="addDeploymentForm" lazy-validation>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap><v-flex xs12>
                <v-text-field prepend-icon="" v-model="newEnvironment.environmentId" placeholder="Environment" label="Environment Name" :rules="rules.environmentName"></v-text-field>
            </v-flex></v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Authors</v-subheader></v-flex>
                <v-flex xs5><v-text-field v-model.number="newEnvironment.spec.authors.replicas" prepend-icon="" placeholder="Authors" label="Number of Instances" :rules="rules.authorInstances" disabled></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="newEnvironment.spec.authors.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Publishers</v-subheader></v-flex>
                <v-flex xs5><v-text-field prepend-icon="" v-model.number="newEnvironment.spec.publishers.replicas" placeholder="Publishers" label="Number of Instances" :rules="rules.instances"></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="newEnvironment.spec.publishers.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Dispatchers</v-subheader></v-flex>
                <v-flex xs5><v-text-field prepend-icon="" v-model.number="newEnvironment.spec.dispatchers.replicas" placeholder="Dispatchers" label="Number of Instances" :rules="rules.instances"></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="newEnvironment.spec.dispatchers.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs6><v-select :items="versionItems" label="AEM instances Version" v-model="newEnvironment.spec.version" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
              <v-flex xs6><v-select :items="dispatcherVersionItems" label="Dispatchers Version" v-model="newEnvironment.spec.dispatcher_version" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-alert id="creationAlertVA" color="error" icon="warning" v-model="creationAlert.opened" > {{ creationAlert.message }}</v-alert>
          </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeCreateAccount()">Cancel</v-btn>
          <v-btn color="primary" @click="addDeployment">Add</v-btn>
        </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="update" width="600px" persistent>
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >
          Scale Deployment
        </v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-form v-model="valid" ref="updateDeploymentForm" v-if="updateEnvironment && updateEnvironment.spec">
            <v-layout row wrap><v-flex xs12>
                <h1 class="title">{{ updateEnvironment.environmentId }}</h1>
            </v-flex></v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Authors</v-subheader></v-flex>
                <v-flex xs5><v-text-field v-model.number="updateEnvironment.spec.authors.replicas" prepend-icon="" placeholder="Authors" label="Number of Instances" :rules="rules.authorInstances" disabled></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="updateEnvironment.spec.authors.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Publishers</v-subheader></v-flex>
                <v-flex xs5><v-text-field prepend-icon="" v-model.number="updateEnvironment.spec.publishers.replicas" placeholder="Publishers" label="Number of Instances" :rules="rules.instances"></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="updateEnvironment.spec.publishers.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs3><v-subheader>Dispatchers</v-subheader></v-flex>
                <v-flex xs5><v-text-field prepend-icon="" v-model.number="updateEnvironment.spec.dispatchers.replicas" placeholder="Dispatchers" label="Number of Instances" :rules="rules.instances"></v-text-field></v-flex>
                <v-flex xs4><v-select :items="instanceTypeItems" label="Type" v-model="updateEnvironment.spec.dispatchers.type" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs6><v-select :items="versionItems" label="AEM instances Version" v-model="updateEnvironment.spec.version" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
              <v-flex xs6><v-select :items="dispatcherVersionItems" label="Dispatchers Version" v-model="updateEnvironment.spec.dispatcher_version" item-text="name" item-value="name" single-line bottom></v-select></v-flex>
            </v-layout>
          </v-form>
          <v-alert id="creationAlertVA" color="error" icon="warning" v-model="updateAlert.opened" > {{ updateAlert.message }}</v-alert>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeUpdateDeployment()">Cancel</v-btn>
          <v-btn color="primary" @click="updateDeployment">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="remove" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >
          Remove Deployment
        </v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap>
            <v-flex xs12>
              <h1 class="title">{{ eliminationEnvironmentMessage }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="remove=false">Cancel</v-btn>
          <v-btn flat @click="removeDeployment()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeAlert.opened" > {{ removeAlert.message }}</v-alert>
      </v-card>
    </v-dialog>

    <router-view></router-view>
  </div>
</template>

<script>
import EnvironmentsService from '../services/Environments';
import VendorsService from '../services/Vendors';

const initEnvironment = {
  environmentId: '',
  spec: {
    authors: {
      type: '',
      replicas: 1
    },
    publishers: {
      type: '',
      replicas: 0
    },
    dispatchers: {
      type: '',
      replicas: 0
    },
    version: '',
    dispatcher_version: ''
  }
};
const initAlert = {
  message: '',
  opened: false
}
export default {
  name: 'Environments',
  data() {
    return {
      account: '',
      creationAlert: Object.assign({}, initAlert),
      updateAlert: Object.assign({}, initAlert),
      removeAlert: Object.assign({}, initAlert),

      eliminationEnvironmentMessage: '',

      update: false,
      valid: true,
      loading: false,
      add: false,
      remove: false,
      editOpened: false,
      newEnvironment: Object.assign({}, JSON.parse(JSON.stringify(initEnvironment))),
      updateEnvironment: Object.assign({}, JSON.parse(JSON.stringify(initEnvironment))),
      selectedDeployment: {},

      search: '',
      environments: [],
      selected: [],
      headers: [
        { value: 'name', text: 'Name', align: 'left', sortable: false },
        { value: 'authors', text: 'Authors', align: 'left', sortable: false },
        { value: 'publishers', text: 'Publishers', align: 'left', sortable: false },
        { value: 'dispatchers', text: 'Dispatchers', align: 'left', sortable: false },
        { value: 'status', text: 'Status', align: 'left', sortable: false },
        { value: 'actions', text: '', align: 'left', sortable: false },
      ],
      rows: [10, 20, 50, { text: 'All', value: -1 }],
      rules: {
        environmentName: [
          (value) => !!value || 'Environment name required',
          (value) => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value) || 'Environment name not valid'
        ],
        authorInstances: [
          (value) => (value == 0) || !!value || 'Number of instances required',
          (value) => (value === parseInt(value, 10)) || 'Invalid number of instances',
          (value) => (value > 0) || 'There must be at least one author instance'
        ],
        instances: [
          (value) => (value == 0) || !!value || 'Number of instances required',
          (value) => (value === parseInt(value, 10)) || 'Invalid number of instances',
          (value) => (value >= 0) || 'Invalid number of instances',
          (value) => (value <= 10) || 'Number of instances must not exceed 10'
        ],
      },
      instanceTypeItems: [],
      versionItems: [],
      dispatcherVersionItems: []
    };
  },
  beforeRouteUpdate (to, from, next) {
    next();
    this.environmentsFetch();
  },
  computed: {
    actions: function actions() {
      if (!this.selected) {
        return false;
      }
      let r = false;
      for (let i = 0; i < this.selected.length; i += 1) {
        r = r || this.selected[i];
      }
      return r;
    },
  },
  created() {
    this.fetch();
  },
  methods: {
    fetch() {
      this.environmentsFetch();
      this.instancesTypesFetch();
      this.aemVersionsFetch();
      this.dispatcherVersionsFetch();
    },
    environmentsFetch() {
      this.account = this.$route.params.account,
      this.loading = true;
      return EnvironmentsService.all(this.account).then(result => {
        if (result.code) {
        } else {
          this.environments = [];
          result.forEach(element => {
            EnvironmentsService.get(this.account, element.environmentId).then(env => {
              this.environments.push(env);
            });
          });
          this.selected = [];
        }
        this.loading = false;
      });
    },
    instancesTypesFetch() {
      return VendorsService.allInstancesTypes()
        .then(result => {
          if (result.code) {
          } else {
            this.instanceTypeItems = result;
          }
      });
    },
    aemVersionsFetch() {
      return VendorsService.allAEMVersions()
        .then(result => {
          if (result.code) {
          } else {
            this.versionItems = result;
          }
      });
    },
    dispatcherVersionsFetch() {
      return VendorsService.allDispatcherVersions()
        .then(result => {
          if (result.code) {
          } else {
            this.dispatcherVersionItems = result;
          }
      });
    },


    openUpdateDeploymentDialog(deploymentIndex) {
      this.updateEnvironment = this.environments[deploymentIndex];
      this.update = true;
    },
    updateDeployment() {
      if (this.$refs.updateDeploymentForm.validate()) {
        // Validate Instances types
        if (this.updateEnvironment.spec.authors.type == "") {
          this.updateAlert.message = "Authors instance type required";
          this.updateAlert.opened = true;
          return;
        } else  if (this.updateEnvironment.spec.publishers.replicas >= 1 && this.updateEnvironment.spec.publishers.type == "") {
          this.updateAlert.message = "Publishers instance type required";
          this.updateAlert.opened = true;
          return;
        } else  if (this.updateEnvironment.spec.dispatchers.replicas >= 1 && this.updateEnvironment.spec.dispatchers.type == "") {
          this.updateAlert.message = "Dispatchers instance type required";
          this.updateAlert.opened = true;
          return;
        }

        const requestBody = {
          clientId: this.account,
          environmentId: this.updateEnvironment.environmentId,
          spec: Object.assign({}, JSON.parse(JSON.stringify(this.updateEnvironment.spec)))
        }

        EnvironmentsService.update(this.account, this.updateEnvironment.environmentId, requestBody).then(result => {
          if (result.code) {
            this.updateAlert.message = result.msg;
            this.updateAlert.opened = true;
          } else {
            this.cleanUpdateEnvironmentDialog();
            this.update = false;
            this.environmentsFetch();
          }
        });
      }
    },
    closeUpdateDeployment() {
      this.cleanUpdateEnvironmentDialog();
      this.update = false;
    },
    cleanUpdateEnvironmentDialog() {
      // Clean alerts
      this.updateAlert = Object.assign({}, initAlert);
    },

    addDeployment() {
      if (this.$refs.addDeploymentForm.validate()) {
        // Validate Instances types
        if (this.newEnvironment.spec.authors.type == "") {
          this.creationAlert.message = "Authors instance type required";
          this.creationAlert.opened = true;
          return;
        } else  if (this.newEnvironment.spec.publishers.replicas >= 1 && this.newEnvironment.spec.publishers.type == "") {
          this.creationAlert.message = "Publishers instance type required";
          this.creationAlert.opened = true;
          return;
        } else  if (this.newEnvironment.spec.dispatchers.replicas >= 1 && this.newEnvironment.spec.dispatchers.type == "") {
          this.creationAlert.message = "Dispatchers instance type required";
          this.creationAlert.opened = true;
          return;
        }

        const requestBody = {
          clientId: this.account,
          environmentId: this.newEnvironment.environmentId,
          spec: Object.assign({}, JSON.parse(JSON.stringify(this.newEnvironment.spec)))
        }
        EnvironmentsService.add(this.account, this.newEnvironment.environmentId, requestBody).then(result => {
          if (result.code) {
            this.creationAlert.message = result.msg;
            this.creationAlert.opened = true;
          } else {
            this.cleanCreateEnvironmentDialog();
            this.add = false;
            this.environmentsFetch();
          }
        });
      }
    },
    closeCreateAccount() {
      this.cleanCreateEnvironmentDialog();
      this.add = false;
    },
    cleanCreateEnvironmentDialog() {
      // Clean alerts
      this.creationAlert = Object.assign({}, initAlert);
      // Cleaning the form
      this.$refs.addDeploymentForm.reset();
      // Loading default data
      this.newEnvironment = Object.assign({}, JSON.parse(JSON.stringify(initEnvironment)));
    },

    openRemoveDeploymentDialog(deploymentIndex) {
      this.selectedEnvironment = this.environments[deploymentIndex];
      this.remove = true;
      this.eliminationEnvironmentMessage =
        'Are you sure you want to remove the ' + this.selectedEnvironment.environmentId + ' deployment?';
    },
    removeDeployment() {
      EnvironmentsService.remove(this.account, this.selectedEnvironment.environmentId).then(result => {
        if (result.code) {
          this.removeAlert.message = result.msg;
          this.removeAlert.opened = true;
        } else {
          this.environmentsFetch();
          this.closeRemoveAccount();
        }
      });
    },
    closeRemoveAccount() {
      this.clearRemoveAlert();
      this.remove = false;
    },
    clearRemoveAlert() {
      this.removeAlert = Object.assign({}, initAlert);
    },
  },
};
</script>

<style scoped>

</style>
