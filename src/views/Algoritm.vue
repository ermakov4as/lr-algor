<template>
  <div>
    <ModalAuth></ModalAuth>
    <Authors></Authors>
    <b-container>

      <b-row align-h="end">
        <HeaderLine></HeaderLine>
      </b-row>

      <b-row>
        <Alert></Alert> 

        <b-col sm="*">
          <Pole></Pole>
        </b-col>

        <b-col style="min-width: 500px;">
          <Controls></Controls>
        </b-col>
        
      </b-row>

    </b-container>
  </div>
</template>

<script>
import './Algoritm.css'
import Pole from '../components/Pole'
import Controls from '../components/Controls'
import Authors from '../components/Authors'
import Alert from '../components/Alert'
import ModalAuth from '../components/ModalAuth'
import HeaderLine from '../components/HeaderLine'

export default {
  name: 'Algoritm',
  components: {
    Pole,
    Controls,
    Authors,
    Alert,
    ModalAuth,
    HeaderLine
  },
  created() {
    this.pole.clearAll()
    this.algor.selectedAlg = this.algor.algTypes[0].value
    this.user.initUser()
  }
}
</script>