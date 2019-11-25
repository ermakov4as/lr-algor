<template>
  <b-col cols="5">
    <b-button v-if="!user.isReg" v-b-modal.modal-1 variant="outline-primary">Войти</b-button>
    <b-row v-else>
      <b-col cols="8">
        <b-form-select v-model="algor.selectedAlg" :options="algor.algTypes" @change="pole.changeAlgor()"></b-form-select>
      </b-col>
      <b-col cols="4">
        <b-row>
          <b-col cols="4">
            <img src="../assets/sm7-31m.jpg" class="ava" alt="" />
          </b-col>
          <b-col cols="8">
            <b-dropdown class="mx-1" right :text="user.name">
              <b-dropdown-item @click="user.logout()">Выход</b-dropdown-item>
              <b-dropdown-item v-b-modal.modal-2>Об авторах</b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-col>
</template>