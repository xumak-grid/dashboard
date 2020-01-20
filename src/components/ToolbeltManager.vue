<template>
  <v-card>
    <v-card-title>
      <v-toolbar-title>Toolbelt Manager</v-toolbar-title>
    </v-card-title>
    <v-data-table :items="toolbelts" :headers="toolbeltsHeaders" :loading="toolbeltsLoading" hide-actions>
      <template slot="items" slot-scope="props">
        <td class="justify-center layout px-0">
          <v-btn icon    slot="activator" >
              <v-icon large color="red lighten-1" v-if="props.item.toolbeltId=='not created'">remove_circle</v-icon>
              <v-icon large color="green darken-2" v-else>check_circle</v-icon>
          </v-btn>
        </td>
        <td>{{ props.item.url }}</td>
        <td class="justify-center layout px-0" style="vertial-align:middle">
          <v-btn icon @click.native.stop="addToolbelt()" v-if="props.item.toolbeltId=='not created'">
            <v-icon large>build</v-icon>
          </v-btn>
          <a :href="`${props.item.url}`" target="_blank" class="btn btn--flat btn--router indigo--text" v-if="props.item.toolbeltId!='not created'">
            <v-icon large>open_in_new</v-icon>
          </a>
          <v-btn icon  @click.native="openRemoveToolbeltDialog(props.index)" v-if="props.item.toolbeltId!='not created'">
            <v-icon large>delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-alert type="info" v-model="toolbeltInfoDisplay" > {{ selectedToolbelt.message }}</v-alert>
    <v-alert id="creationAlertVA" color="error" icon="warning" v-model="createToolbeltAlert.opened" > {{ createToolbeltAlert.message }}</v-alert>

    <!-- toolbelt dialogs -->
    <v-dialog v-model="addToolbeltDisplay" width="600px" persistent>
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Add Toolbelt</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="closeCreateToolbelt()">Cancel</v-btn>
          <v-btn flat @click="addToolbelt">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeToolbeltDisplay" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title" >Remove Toolbelt</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap><v-flex xs12>
              <h1 class="title">Are you sure you want to remove the toolbelt?</h1>
          </v-flex></v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="removeToolbeltDisplay=false">Cancel</v-btn>
          <v-btn flat @click="removeToolbelt()">Remove</v-btn>
        </v-card-actions>
        <v-alert color="error" icon="warning" v-model="removeToolbeltAlert.opened" > {{ removeToolbeltAlert.message }}</v-alert>
      </v-card>
    </v-dialog>
    <!-- end toolbelt dialogs -->

  </v-card>
  
</template>


<script>

import ToolbeltsService from '../services/Toolbelts';
const initToolbelt = {
  
};
const initAlert = {
  message: '',
  opened: false
}

export default {
  name: 'ToolbeltManager',
  data() {
    return {
      valid: true,
      account: this.$route.params.account,

      // toolbelts
      selectedToolbelt: {},
      addToolbeltDisplay: false,
      toolbeltInfoDisplay: false,
      createToolbeltAlert: Object.assign({}, JSON.parse(JSON.stringify(initAlert))),
      toolbeltItems: [],
      
      newToolbelt: Object.assign({}, JSON.parse(JSON.stringify(initToolbelt))),
      removeToolbeltDisplay: false,
      removeToolbeltAlert: Object.assign({}, JSON.parse(JSON.stringify(initAlert))),
      toolbelts: [],
      toolbeltsLoading: false,
      toolbeltsHeaders: [
        { value: 'configured', text: 'Configured', align: 'left', sortable: false },
        { value: 'host', text: 'Host', align: 'left', sortable: false },
        { value: '', text: '', align: 'left', sortable: false, width:'500px' },
      ],

      rows: [10, 20, 50, { text: 'All', value: -1 }],
    };
  },
  beforeRouteUpdate (to, from, next) {
    this.account = to.params.account;
    next();
    this.toolbeltsFetch();
  },

  created() {
    this.fetch();
  },
  
  methods: {
    // Toolbelt functions
    fetch() {
      this.account = this.$route.params.account;
      this.toolbeltsFetch();
    },
    toolbeltsFetch() {
      this.toolbeltsLoading = true;
      return ToolbeltsService.all(this.account).then(result => {
        if (result.code) {
          this.toolbelts = [];
          const emptyToolbelt = { toolbeltId: 'not created'};
          this.toolbelts.push(emptyToolbelt);
        } else {
          this.toolbelts = [];
          this.toolbelts.push(result);
          // Displaoy toolbelt info
          this.selectedToolbelt = result;
          this.toolbeltInfoDisplay = true;
        }
        this.toolbeltsLoading = false;
      });
    },

    addToolbelt() {
      ToolbeltsService.add(this.account).then(result => {
        if (result.code) {
          this.createToolbeltAlert.message = result.msg;
          this.createToolbeltAlert.opened = true;
        } else {
          this.cleanCreateToolbeltDialog();
          this.addToolbeltDisplay = false;
          this.toolbeltsFetch();
        }
      });
    },
    closeCreateToolbelt() {
      this.cleanCreateToolbeltDialog();
      this.addToolbeltDisplay = false;
    },
    cleanCreateToolbeltDialog() {
      // Clean alerts
      this.createToolbeltyAlert = Object.assign({}, JSON.parse(JSON.stringify(initAlert)));
      // Clean toolbelt data
      this.newToolbelt = Object.assign({}, JSON.parse(JSON.stringify(initToolbelt)));
    },
    openRemoveToolbeltDialog(toolbeltIndex) {
      this.selectedToolbelt = this.toolbelts[toolbeltIndex];
      this.removeToolbeltDisplay = true;
    },
    removeToolbelt() {
      ToolbeltsService.remove(this.account).then(result => {
        if (result.code) {
          this.removeToolbeltAlert.message = result.msg;
          this.removeToolbeltAlert.opened = true;
        } else {
          this.closeRemoveToolbelt();
          this.toolbeltsFetch();
        }
      });
    },
    closeRemoveToolbelt() {
      this.clearRemoveToolbeltAlert();
      this.removeToolbeltDisplay = false;

      this.selectedToolbelt = {};
      this.toolbeltInfoDisplay = false;
    },
    clearRemoveToolbeltAlert() {
      this.removeToolbeltAlert = Object.assign({}, JSON.parse(JSON.stringify(initToolbelt)));
    },
  
  },
};
</script>

<style scoped>

</style>
