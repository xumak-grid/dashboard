<template>
    <v-dialog v-model="open" width="800px">

      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Instances
          <v-spacer></v-spacer>
          <v-btn icon  @click.native="fetch()">
            <v-icon medium>refresh</v-icon>
          </v-btn>
          <!--<v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>-->
        </v-card-title>
       <v-data-table :items="instances" :headers="headers" :search="search" v-model="selected" selected-key="name" :rows-per-page-items="rows" :loading="loading">
              <template slot="items" slot-scope="props">
                <td>
                   <v-btn icon    slot="activator" >
                      <v-icon large color="green darken-2" v-if="props.item.running&&props.item.ready">check_circle</v-icon>
                      <v-icon large color="red lighten-1" v-else>remove_circle</v-icon>
                    </v-btn>
                </td>
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.runmode }}</td>
                <td>{{ props.item.running }}</td>
                <td>{{ props.item.ready }}</td>
                <td>
                  <v-btn icon  @click.native="openInstancePassowrdDialog(props.item.name, props.item.password)" v-if="props.item.password!=''">
                      <v-icon large>lock_open</v-icon>
                  </v-btn>
                </td>
                <td>
                  <v-btn icon  :href="`https://${props.item.name}-${accountLink}`" target="_blank">
                      <v-icon large>open_in_new</v-icon>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="$router.go(-1)">Close</v-btn>
        </v-card-actions>
      </v-card>

      <v-dialog v-model="instancePasswordDialog" width="400px">
        <v-card>
          <v-card-title class="grey lighten-4 py-4 title" >
            Instance Password
          </v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <h1 class="title">{{ instancePasswordMessage }}</h1>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="instancePasswordDialog=false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-dialog>
</template>

<script>
import InstancesService from '../services/Instances';
export default {
  name: 'Instances',
  data() {
    return {
      loading: false,
      open: true,
      instancePasswordDialog: false,
      instancePasswordMessage: '',
      editOpened: false,
      selectedAccount: {},
      search: '',
      instances: [],
      selected: [],
      headers: [
        { value: 'ready', text: 'Ready', align: 'left', sortable: false },
        { value: 'name', text: 'Name', align: 'left', sortable: true },
        { value: 'runmode', text: 'Runmode', align: 'left', sortable: true },
        { value: 'running', text: 'Running', align: 'left', sortable: true },
        { value: 'ready', text: 'Ready', align: 'left', sortable: true },
        { value: 'actions', text: '', align: 'left', sortable: false },
      ],
      rows: [10, 20, 50, { text: 'All', value: -1 }],
      addDialog: {
        text: '',
      },
    };
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
    accountLink: function accountLink() {
      return `${this.$route.params.account}.test.grid.xumak.io`;
    },
  },
  created() {
    this.fetch();
  },
  methods: {
    fetch() {
      this.loading = true;
      return InstancesService.all(this.$route.params.account, this.$route.params.environment).then(result => {
        if (result.code) {
          this.creationAlertMessage = result.msg;
          this.creationAlertOpened = true;
        } else {
          this.instances = result;
          this.selected = [];
          this.loading = false;
        }
      });
    },

    openInstancePassowrdDialog(instance, password) {
      this.instancePasswordDialog = true;
      this.instancePasswordMessage = instance + 'instance password is: ' + password;
    },
  },
};
</script>

<style scoped>
</style>
