<template>
  <v-app id="inspire">
    <v-navigation-drawer fixed clipped app v-model="drawer">

      <v-list dense>
        <template v-for="(item, i) in items">
          <v-subheader v-if="item.header" :key="i" v-text="item.header"></v-subheader>
          <v-divider :key="i" v-else-if="item.divider" v-bind:inset="item.inset"></v-divider>
          <v-list-tile v-else  :key="i" @click="$router.push(item.link)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>

      <v-subheader>Account</v-subheader>
      <v-subheader><v-select :items="accounts" v-model="selectedAccount" label="Account" item-text="clientId" single-line bottom @input="seleccion()"></v-select></v-subheader>

      <v-list dense>
        <template v-for="(item, i) in accountItems">
          <v-subheader v-if="item.header" :key="i" v-text="item.header"></v-subheader>
          <v-divider :key="i" v-else-if="item.divider" v-bind:inset="item.inset"></v-divider>
          <v-list-tile v-else  :key="i" @click="$router.push(item.link)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
        <v-list-tile @click="logout">
            <v-list-tile-action>
              <v-icon>fa-sign-out</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
      </v-list>


    </v-navigation-drawer>
    <v-toolbar color="blue darken-3" dark app clipped-left fixed>
      <v-toolbar-title :style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-xs-only">Grid - Bedrock</span>
      </v-toolbar-title>
      <v-text-field light solo prepend-icon="search" placeholder="Search" style="max-width: 500px; min-width: 128px"></v-text-field>
      <div class="d-flex align-center" style="margin-left: auto">
        <v-btn icon>
          <v-icon>apps</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>notifications</v-icon>
        </v-btn>
        <v-btn icon large>
          <v-avatar size="32px" tile>
            <img src="static/grid_logo.png" alt="Grid">
          </v-avatar>
        </v-btn>
      </div>
    </v-toolbar>

    <v-content>
      <v-container  style="padding:0px;min-height: 100% !important ;background: #fff">
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-dialog v-model="dialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Create contact</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap>
            <v-flex xs12 align-center justify-space-between>
              <v-layout align-center>
                <v-avatar size="40px" class="mr-3">
                  <img src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png" alt="">
                </v-avatar>
                <v-text-field placeholder="Name"></v-text-field>
              </v-layout>
            </v-flex>
            <v-flex xs6>
              <v-text-field prepend-icon="business" placeholder="Company"></v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field placeholder="Job title" ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field prepend-icon="mail" placeholder="Email"></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field type="tel" prepend-icon="phone" placeholder="(000) 000 - 0000" mask="phone"></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field prepend-icon="notes" placeholder="Notes"></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-btn flat color="primary">More</v-btn>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
          <v-btn flat @click="dialog = false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import NamespacesService from './services/Namespaces';
export default {
  data() {
    return {
      dialog: false,
      drawer: null,
      items: [{ header: 'Bedrock' }, { icon: 'business', text: 'Accounts', link: '/accounts' }],
      account: '',
      selectedAccount: {},
      accounts: [],
    };
  },
  computed: {
    accountItems: function() {
      return [
        { icon: 'launch', text: 'Deployments', link: `/deployments/${this.account}` },
        { icon: 'list', text: 'Services', link: `/services/${this.account}` },
        { icon: 'assignment', text: 'Dispatcher Configuration', link: `/dispatcherconfig/${this.account}`  },
        { icon: 'more', text: 'Toolbelt', link: `/toolbelt/${this.account}` },
        { icon: 'backup', text: 'Backups' },
        { divider: true, inset: false },
        { icon: 'settings', text: 'Settings' },
        { icon: 'chat_bubble', text: 'Send feedback' },
        { icon: 'help', text: 'Help' },
      ];
    },
  },
  created() {
    this.accountsFetch();
  },
  methods: {
    seleccion() {
      this.account = this.selectedAccount.clientId;
      if (this.$route.name == 'Deployments') {
        this.$router.push(`/deployments/${this.account}`);
      } else if (this.$route.name == 'Services') {
        this.$router.push(`/services/${this.account}`);
      }
    },
    logout() {
      location.href = '/oauth2/sign_out';
    },
    accountsFetch() {
      return NamespacesService.all().then(accounts => {
        this.accounts = accounts;
        // get selectedAccount
        this.accounts.forEach(account => {
          if (account.clientId == this.$route.params.account) {
            this.selectedAccount = account;
            this.account = this.selectedAccount.clientId;
          }
        });
      });
    },
  },
  props: {
    source: String,
  },
};
</script>

