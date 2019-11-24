<template>
  <div>

    <b-modal id="modal-1" title="Авторизация" :hide-footer="true">
      <p class="my-4">Пароль - номер аудитории, где у нас пара (без "м")</p>
      <b-input-group prepend="Ваше имя: " class="mt-3">
        <b-form-input v-model="name"></b-form-input>
      </b-input-group>
      <b-input-group prepend="Пароль: " class="mt-3">
        <b-form-input v-model="password" type="password"></b-form-input>
        <b-input-group-append>
          <b-button variant="outline-info" @click="auth()">Вход</b-button>
        </b-input-group-append>
      </b-input-group>
      <p v-if="isWrongPassword" class="my-4" style="color: red; font-weight: bolder;">Неверный пароль.</p>
      <p v-if="isNotName" class="my-4" style="color: red; font-weight: bolder;">Введите имя.</p>
    </b-modal>

    <b-modal id="modal-2" title="Об авторах" :ok-only="true">
      <h4>CM7-31М</h4>
      <ul>
        <li>Ермаков А.С.</li>
        <li>Смирнова Ю.Л.</li>
        <li>Трояновский Я.В.</li>
      </ul>
      <h4>CM7-32М</h4>
      <ul>
        <li>Дегтяренко Н.В.</li>
      </ul>
    </b-modal>

    <b-container>
  
      <b-row align-h="end">
        <b-col cols="5">
          <b-button v-if="!isReg" v-b-modal.modal-1 variant="outline-primary">Войти</b-button>
          <b-row v-else>
            <b-col cols="8">
              <b-form-select v-model="selectedAlg" :options="algTypes"></b-form-select>
            </b-col>
            <b-col cols="4">
              <b-row>
                <b-col cols="4">
                  <img src="../assets/sm7-31m.jpg" class="ava" alt="" />
                </b-col>
                <b-col cols="8">
                  <b-dropdown class="mx-1" right :text="name">
                    <b-dropdown-item @click="logout()">Выход</b-dropdown-item>
                    <b-dropdown-item v-b-modal.modal-2>Об авторах</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-col>
      </b-row>

      <b-row>
        <b-alert 
          :show="dismissCountDown" 
          dismissible 
          variant="danger"
          @dismissed="dismissCountDown=0"
          @dismiss-count-down="countDownChanged"
        >
          {{ alertText }}
        </b-alert>      

        <b-col sm="*">
          <table v-if="readyFlag">
            <body>
              <tr v-for="(line, index) in pole" :key="index" class="table">
                <td
                  v-for="(elem, i) in line"
                  :key="i" class="kletka"
                  @click="isReg && fixPoint(index, i)"
                  :class="{ 
                    green: elem.color==='green', 
                    red: elem.color==='red', 
                    blue: elem.color==='blue',
                    black: elem.color==='black',
                    orangeBorders: elem.color==='orange-borders',
                    darkOrangeBorders: elem.color==='dark-orange-borders',
                    darkBlueBorders: elem.color==='dark-blue-borders',
                    pointer: isReg && (startMode || finishMode || prepMode)
                  }"
                  :style="!elem.prep && elem.color!=='green' && elem.color!=='red' &&
                    ((selectedAlg==='poten' &&
                      ((!elem.resPrep && `background: rgba(0,0,168,${elem.finPrep / maxFinPrep});`) ||   
                      (elem.resPrep && `background: rgba(255,255,0,${elem.resPrep / maxPotPrep});`)))
                    || (selectedAlg==='deik' && (elem.d!==(10*dimX*dimY) && `background: rgba(255,255,0,${elem.d / maxDeikWeight});`)))"
                  >
                  {{ (elem.d!==-1&&selectedAlg!=='deik') ? (elem.d) : ((elem.d!==(10*dimX*dimY)&&elem.d!==-1) ? elem.d : '') }}
                </td>
              </tr>
            </body>
          </table>
        </b-col>

        <b-col style="min-width: 500px;">
          <h3 v-if="!isReg">Запуск алгоритма доступен по паролю.</h3>
          <template v-else>
            <b-row>
              <b-col cols="3">
                <b-input-group prepend='X: ' class="mt-3">
                  <b-form-input v-model="dimY" type="number"></b-form-input>
                </b-input-group>
                {{ dimY }}
              </b-col>
              <b-col cols="3">
                <b-input-group prepend='Y: ' class="mt-3">
                  <b-form-input v-model="dimX" type="number"></b-form-input>
                </b-input-group>
                {{ dimX }}
              </b-col>
              <b-col cols="2.5" style="margin-top: 16px;">
                <b-button variant="outline-info" @click="clearAll()" :disabled="dimX<=0 || dimY<=0">Изменить</b-button>
              </b-col>
              <b-col cols="2" style="margin-top: 16px;">
                <b-button variant="outline-info" @click="resetDims()">Вернуть</b-button>
              </b-col>
            </b-row>
            <br>
            <b-button v-if="!startMode" variant="outline-success" @click="setMode('start', true)">Задать начальную точку</b-button>
            <b-button v-else variant="success" @click="setMode('start', false)">Задать начальную точку (стоп)</b-button>
            <br><br>
            <b-button v-if="!finishMode" variant="outline-danger" @click="setMode('finish', true)">Задать конечную точку</b-button>
            <b-button v-else variant="danger" @click="setMode('finish', false)">Задать конечную точку (стоп)</b-button>
            <br><br>
            <b-button v-if="!prepMode" variant="outline-warning" @click="setMode('prep', true)">Задать препятствия</b-button>
            <b-button v-else variant="warning" @click="setMode('prep', false)">Задать препятствия (стоп)</b-button>
            <br><br>
            <b-button v-if="!calculateReady" variant="outline-primary" @click="calculate()">Рассчитать</b-button>
            <b-button v-else variant="dark" @click="clearPoints()">Сбросить старт/финиш</b-button>
            <br><br><br>
            <b-button variant="outline-dark" @click="clearAll()">Очистить карту</b-button>
          </template>
        </b-col>

      </b-row>

    </b-container>

  </div>
</template>

<script>
import Cookies from 'js-cookie'

export default {
  name: 'Algoritm',
  data() {
    return {
      dimX: 10,
      dimY: 10,
      isReg: false,
      password: '',
      isWrongPassword: false,
      isNotName: false,
      name: '',
      pole: null,
      start_x: null,
      start_y: null,
      finish_x: null,
      finish_y: null,
      startPointReady: false,
      finishPointReady: false,
      readyFlag: false,
      prepMode: true,
      startMode: false,
      finishMode: false,
      calculateReady: false,
      d: 0,
      oldFront: [],
      completedFwd: false,
      completedRev: false,
      localCompletedRev: false,
      dismissSecs: 3,
      dismissCountDown: 0,
      algTypes: [
        {value: 'voln', text: 'Волновой'},
        {value: 'poten', text: 'Потенциальный'},
        {value: 'deik', text: 'Дейкстры'},
        {value: 'astar', text: 'А *', disabled: true}
      ],
      selectedAlg: null,
      poleAdded: null,
      topPrepWeight: null,
      alertText: '',
      _dimX4: null,
      _dimY4: null,
      maxPotPrep: null,
      maxFinPrep: null,
      maxVisited: null,
      visited: null,
      maxDeikWeight: null
    }
  },
  methods: {
    setMode(mode, on) {
      if (!on) [this.startMode, this.finishMode, this.prepMode] = [false, false, false]
      else {
        if (mode === 'start') [this.startMode, this.finishMode, this.prepMode] = [true, false, false]
        else if (mode === 'finish') [this.startMode, this.finishMode, this.prepMode] = [false, true, false]
        else if (mode === 'prep') [this.startMode, this.finishMode, this.prepMode] = [false, false, true]
      }
    },
    fixPoint(x, y) {
      if (this.startMode) {
        this.start_x && this.start_y && (this.pole[this.start_x][this.start_y].color = 'white')
        this.start_x = x
        this.start_y = y
        this.startPointReady = true
        this.d = 0
        this.pole[x][y].color = 'green'
        this.pole[x][y].d = this.d
        console.log('start: ', x, y)
        this.startMode = false
        this.oldFront.push({x, y})
        setTimeout(() => { this.finishMode = true }, 4)
      }
      if (this.finishMode) {
        this.finish_x && this.finish_y && (this.pole[this.finish_x][this.finish_y].color = 'white')
        this.finish_x = x
        this.finish_y = y
        this.finishPointReady = true
        this.pole[x][y].color = 'red'
        console.log('finish: ', x, y)
        this.finishMode = false
      }
      if (this.prepMode) {
        if (this.pole[x][y].color !== 'black') {
          this.pole[x][y].color = 'black'
          this.pole[x][y].prep = true
        } else {
          this.pole[x][y].color = 'white'
          this.pole[x][y].prep = false
        }
      }
    },
    calculate() {
      if (!this.startPointReady || !this.finishPointReady) {
        console.log('Сперва выберите точки начала и конца пути')
        this.showFailAlert('Сперва выберите точки начала и конца пути')
      } else {
        switch (this.selectedAlg) {
          case 'voln':
            this.calculateVoln()
            break
          case 'poten':
            this.calculatePoten()
            break
          case 'astar':
            this.calculateAstar()
            break
          case 'deik':
            this.calculateDeik()
            break
          default:
            break
        }
      }
      this.calculateReady = true
    },
    calculateVoln() {
      let initCurrent = []
      initCurrent.push({x: this.start_x, y: this.start_y})
      this.fwdSearch(initCurrent)
      if (this.completedFwd) {
        let revFront = []
        revFront.push({x: this.finish_x, y: this.finish_y})
        this.revSearch(revFront)
      }
    },
    calculatePoten() {
      this.potenSetPoleAdded()
      this.potenCalculatePreps()
      this.potenCalculateDistWeight()
      this.potenCalculatePole()
    },
    calculateDeik() {
      this.deikInitWeights()
      this.deikGlobalCalculateWeights()
      if (!this.calculateReady) {
        this.deikReturnRoute()
        this.deikVisualCalculatePersentWeight()
      }
    },
    calculateAstar() {
      console.log('TODO:')
    },
    deikVisualCalculatePersentWeight() {
      for (let i in _.range(this.dimX)) {
        for (let j in _.range(this.dimY)) {
          if (!this.pole[i][j].prep && this.pole[i][j].d!==10*this.dimX*this.dimY) {
            if (this.pole[i][j].d > this.maxDeikWeight) this.maxDeikWeight = this.pole[i][j].d
          }
        }
      }
    },
    deikReturnRoute() {
      let x = this.pole[this.finish_x][this.finish_y].deikPrevPoint.x
      let y = this.pole[this.finish_x][this.finish_y].deikPrevPoint.y
      while (!(x===this.start_x && y===this.start_y)) {
        let _prevPoint = this.pole[x][y].deikPrevPoint
        this.pole[x][y].color = 'dark-blue-borders'
        x = _prevPoint.x
        y = _prevPoint.y
      }
      return
    },
    deikInitWeights() {
      this.maxVisited = 0
      this.visited = 0
      this.maxDeikWeight = 0
      let _maxD = 10 * this.dimX * this.dimY
      for (let i in _.range(this.dimX)) {
        for (let j in _.range(this.dimY)) {
          if (!this.pole[i][j].prep) {
            this.maxVisited += 1
            this.pole[i][j].d = _maxD
          }
        }
      }
      this.pole[this.start_x][this.start_y].d = 0
    },
    deikGlobalCalculateWeights() {
      this.deikCalculateWeights(this.start_x, this.start_y)
    },
    deikCalculateWeights(x, y) {
      this.pole[x][y].visited = true
      this.visited += 1
      this.deikSearchNeighbours(x, y)
      if (this.visited === this.maxVisited) {
        console.log('Прямой ход алгоритма Дейкстры завершён.')
        return
      } else this.deikFindMinNotVisitedWeight()
    },
    deikFindMinNotVisitedWeight() {
      let _minWeight = 10 * this.dimX * this.dimY
      let _x, _y
      for (let i in _.range(this.dimX)) {
        for (let j in _.range(this.dimY)) {
          if (!this.pole[i][j].prep && !this.pole[i][j].visited) {
            if (this.pole[i][j].d < _minWeight) {
              _x = i
              _y = j
              _minWeight = this.pole[i][j].d
            }
          }
        }
      }
      if (!_x || !_y) {
        if (this.pole[this.finish_x][this.finish_y].d === 10*this.dimX*this.dimY) {
          console.log('Финиш недостижим')
          this.calculateReady = true
          this.showFailAlert('Невозможно проложить маршрут между заданными точками')
        } else console.log('Есть недоступные точки на карте')
        return
      } else this.deikCalculateWeights(_x, _y)
    },
    deikSearchNeighbours(x, y) {
      let _neighbours = []
      for (let i in _.range(3)) {
        for (let j in _.range(3)) {
          let _x = Number(x)+Number(i)-1
          let _y = Number(y)+Number(j)-1
          if (_x>=0 && _x<this.dimX && _y>=0 && _y<this.dimY && !this.pole[_x][_y].prep) {
            if (!this.pole[_x][_y].visited) {
              let _distMode = Number(Math.abs(_x-x) + Math.abs(_y-y))
              let _addDist
              switch (_distMode) {
                case 1:
                  _addDist = 10
                  break
                case 2:
                  _addDist = 14
                  break
                default:
                  break
              }
              if (this.pole[x][y].d+_addDist < this.pole[_x][_y].d) {
                this.pole[_x][_y].d = this.pole[x][y].d+_addDist
                this.pole[_x][_y].deikPrevPoint = {x, y}
              }
            }
          }
        }
      }
    },
    potenSetPoleAdded() {
      this._dimX4 = Number(Number(this.dimX) + 2)
      this._dimY4 = Number(Number(this.dimY) + 2)
      let _pole = []
      for (let i in _.range(this._dimX4)) {
        let _line = []
        for (let j in _.range(this._dimY4)) {
          if (i<1 || this._dimX4-i<=1 || j<1 || this._dimY4-j<=1) {
            _line.push({
              color: 'black',
              prep: true,
              d: -1,
              potPrep: 0,
              finPrep: 0,
              sumPrep: 0,
              resPrep: 0
            })
          } else {
            _line.push({
              color: this.pole[i-1][j-1].color,
              prep: this.pole[i-1][j-1].prep,
              d: this.pole[i-1][j-1].d,
              potPrep: 0,
              finPrep: 0,
              sumPrep: 0,
              resPrep: 0
            })
          }
        }
        _pole.push(_line)
      }
      this.poleAdded = _pole
    },
    potenCalculatePreps() {
      this.topPrepWeight = 32 * this.dimX * this.dimY
      for (let i in _.range(this._dimX4)) {
        for (let j in _.range(this._dimY4)) {
          if (this.poleAdded[i][j].prep) {
            this.poleAdded[i][j].potPrep = this.topPrepWeight
            this.potenSearchNeighboursForPreps(i, j) // TODO: fix
          }
        }
      }
      this.findMaxPotPrep()
    },
    potenSearchNeighboursForPreps(x, y) {
      for (let i in _.range(5)) {
        for (let j in _.range(5)) {
          let _x = Number(x)+Number(i)-2
          let _y = Number(y)+Number(j)-2
          if (_x>=0 && _x<this._dimX4 && _y>=0 && _y<this._dimY4 && !this.poleAdded[_x][_y].prep) {
            let _potPrepMode = Number(Math.abs(i-2) + Math.abs(j-2))
            if (i!==2 && j!==2) {
              if (_potPrepMode === 1) {
                this.poleAdded[_x][_y].potPrep += 2
                if (x>=1 && x<this._dimX4-1 && y>=1 && y<this._dimY4-1) this.poleAdded[_x][_y].resPrep += 2
              }
              else if (_potPrepMode === 2) {
                this.poleAdded[_x][_y].potPrep += 1
                if (x>=1 && x<this._dimX4-1 && y>=1 && y<this._dimY4-1) this.poleAdded[_x][_y].resPrep += 1
              }
            } else {
              if (_potPrepMode === 2) {
                this.poleAdded[_x][_y].potPrep += 1.4
                if (x>=1 && x<this._dimX4-1 && y>=1 && y<this._dimY4-1) this.poleAdded[_x][_y].resPrep += 1.4
              }
              else if (_potPrepMode === 3) {
                this.poleAdded[_x][_y].potPrep += 0.9
                if (x>=1 && x<this._dimX4-1 && y>=1 && y<this._dimY4-1) this.poleAdded[_x][_y].resPrep += 0.9
              }
              else if (_potPrepMode === 4) {
                this.poleAdded[_x][_y].potPrep += 0.7
                if (x>=1 && x<this._dimX4-1 && y>=1 && y<this._dimY4-1) this.poleAdded[_x][_y].resPrep += 0.7
              }
            }
          }
        }
      }
    },
    findMaxPotPrep() {
      this.maxPotPrep = 0
      for (let i in _.range(this._dimX4)) {
        for (let j in _.range(this._dimY4)) {
          if (!this.poleAdded[i][j].prep && this.poleAdded[i][j].resPrep>this.maxPotPrep) {
            this.maxPotPrep = this.poleAdded[i][j].resPrep
          }
        }
      }
    },
    potenCalculateDistWeight() {
      this.maxFinPrep = 0
      for (let i in _.range(this._dimX4)) {
        for (let j in _.range(this._dimY4)) {
          if (!this.poleAdded[i][j].prep) {
            let _dist32 = Math.round(32 * Math.sqrt(Math.pow(this.finish_x+1-i, 2) + Math.pow(this.finish_y+1-j, 2)))
            this.poleAdded[i][j].finPrep = _dist32
            if (!this.poleAdded[i][j].prep && this.poleAdded[i][j].finPrep>this.maxFinPrep) {
              this.maxFinPrep = this.poleAdded[i][j].finPrep
            }
          }
          this.poleAdded[i][j].sumPrep = this.poleAdded[i][j].potPrep + this.poleAdded[i][j].finPrep
        }
      }
    },
    potenCalculatePole() {
      this.potenReturnPole()
      let _err = false
      let currentPoint = {x: this.start_x, y: this.start_y}
      while (!_err && !this.calculateReady) {
        if (this.pole[currentPoint.x][currentPoint.y].d > 0) {
          this._err = true
          console.log('Финиш недостижим')
          this.calculateReady = true
          this.showFailAlert('Невозможно проложить маршрут между заданными точками\n' + 
            'Метод потенциальных полей не гарантирует построения маршрута')
          break
        }
        this.pole[currentPoint.x][currentPoint.y].d = this.d
        this.d += 1
        if (!(currentPoint.x===this.finish_x && currentPoint.y===this.finish_y) && 
          !(currentPoint.x===this.start_x && currentPoint.y===this.start_y)) {
            this.pole[currentPoint.x][currentPoint.y].color = 'dark-orange-borders'
        } else if (currentPoint.x===this.finish_x && currentPoint.y===this.finish_y) {
          this.calculateReady = true
          console.log('Успех!')
          break
        }
        let _nextPoint = this.potenFindNextPoint(currentPoint.x, currentPoint.y)
        currentPoint = _nextPoint
      }
      this.calculateReady = true
    },
    potenFindNextPoint(x, y) {
      let _minWeight = this.poleAdded[x][y].sumPrep
      let _tekWeight = _minWeight
      let nextPoint = {x, y}
      let _localData = {
        nextPoint,
        _minWeight
      }
      _localData = this.potenIsWeightLower(x-1, y-1, _localData)
      _localData = this.potenIsWeightLower(x, y-1, _localData)
      _localData = this.potenIsWeightLower(x+1, y-1, _localData)
      _localData = this.potenIsWeightLower(x-1, y, _localData)
      _localData = this.potenIsWeightLower(x+1, y, _localData)
      _localData = this.potenIsWeightLower(x-1, y+1, _localData)
      _localData = this.potenIsWeightLower(x, y+1, _localData)
      _localData = this.potenIsWeightLower(x+1, y+1, _localData)
      return _localData.nextPoint
    },
    potenIsWeightLower(x, y, _localData) {
      let { nextPoint, _minWeight } = _localData
      if (x>=0 && x<this._dimX4 && y>=0 && y<this._dimY4) {
        if (this.pole[x][y].sumPrep < _minWeight) {
          _localData = {
            nextPoint: {x, y},
            _minWeight: this.pole[x][y].sumPrep
          }
        }
      }
      return _localData 
    },
    potenReturnPole() {
      for (let i in _.range(this._dimX4)) {
        if (i>=1 && i<this._dimX4-1) {
          for (let j in _.range(this._dimY4)) {
            if (j>=1 && j<this._dimY4-1) {
              this.pole[i-1][j-1] = this.poleAdded[i][j]
            }
          }
        }
      }
    },
    fwdSearch(currentFwd) {
      while (!this.completedFwd) {
        this.d += 1
        let nextFwd = []
        let _success = true
        if (currentFwd.length) {
          for (let point of currentFwd) {
            nextFwd = this.checkNeighbours(point.x, point.y, 'fwd', nextFwd)
          }
          if (!nextFwd.length && !this.completedFwd) {
            console.log('Финиш недостижим')
            this.calculateReady = true
            this.showFailAlert('Невозможно проложить маршрут между заданными точками')
            break
          } 
          currentFwd = nextFwd
        }
      }
    },
    revSearch(revFront) {
      while (!this.completedRev) {
        this.d -= 1
        this.localCompletedRev = false
        let prevPoint = this.checkNeighbours(revFront[0].x, revFront[0].y, 'rev')
        let _revFront = []
        if (!prevPoint || this.d < 0) {
          console.log('Ошибка...')
          break
        } 
        _revFront.push(prevPoint)
        _revFront.push(revFront)
        revFront = _revFront
        if (prevPoint.x===this.start_x && prevPoint.y===this.start_y) {
          this.completedRev = true
          this.pole[prevPoint.x][prevPoint.y].color = 'green'
          console.log('Успех!')
        }
      }

    },
    checkNeighbours(x, y, mode, next=[]) {
      next = this.checkPointSelectMode(x+1, y-1, mode, next)
      next = this.checkPointSelectMode(x+1, y, mode, next)
      next = this.checkPointSelectMode(x+1, y+1, mode, next)
      next = this.checkPointSelectMode(x, y-1, mode, next)
      next = this.checkPointSelectMode(x, y+1, mode, next)
      next = this.checkPointSelectMode(x-1, y-1, mode, next)
      next = this.checkPointSelectMode(x-1, y, mode, next)
      next = this.checkPointSelectMode(x-1, y+1, mode, next)
      return next
    },
    checkPointSelectMode(x, y, mode, next) {
      if (mode === 'fwd') next = this.checkPointFwd(x, y, next)
      else if (mode === 'rev') {
        let _next = this.checkPointRev(x, y)
        if (_next) next = _next
      }
      return next
    },
    checkPointFwd(x, y, nextFwd) {
      if ((!this.completedFwd) && (x >= 0 && x < this.dimX && y >= 0 && y < this.dimY && !this.pole[x][y].prep)) {
        if (this.pole[x][y].d === -1) {
          this.pole[x][y].d = this.d
          this.pole[x][y].color = 'orange-borders'
          nextFwd.push({x, y})
        }
        if (x === this.finish_x && y === this.finish_y) {
          this.pole[x][y].color = 'red'
          console.log('Финиш достигнут!')
          this.completedFwd = true
        }
      }
      return nextFwd
    },
    checkPointRev(x, y) {
      if ((!this.localCompletedRev) && (x >= 0 && x < this.dimX && y >= 0 && y < this.dimY && !this.pole[x][y].prep)) {
        if (this.pole[x][y].d===this.d) {
          this.pole[x][y].color = 'blue'
          this.localCompletedRev = true
          return {x, y}
        }
        return null
      }
      return null
    },
    clearPoints() {
      this.start_x = null
      this.start_y = null
      this.finish_x = null
      this.finish_y = null
      for (let i in _.range(this.dimX)) {
        for (let j in _.range(this.dimY)) {
          this.pole[i][j].d = -1
          this.pole[i][j].potPrep = 0
          this.pole[i][j].finPrep = 0
          this.pole[i][j].sumPrep = 0
          this.pole[i][j].resPrep = 0
          this.pole[i][j].visited = false
          this.pole[i][j].deikPrevPoint = null
          if (!(this.pole[i][j].color==='white' || this.pole[i][j].color==='black')) {
            this.pole[i][j].color = 'white'
          }
        }
      }
      this.startPointReady = false
      this.finishPointReady = false
      this.calculateReady = false
      this.completedFwd = false
      this.completedRev = false
      this.setMode('start', true)
    },
    clearAll() {
      this.readyFlag = false
      let _pole = []
      for (let i in _.range(this.dimX)) {
        let _line = []
        for (let j in _.range(this.dimY)) {
          _line.push({
            color: 'white',
            prep: false,
            d: -1,
            potPrep: 0,
            finPrep: 0,
            sumPrep: 0,
            resPrep: 0,
            visited: false,
            deikPrevPoint: null
          })
        }
        _pole.push(_line)
      }
      this.pole = _pole
      this.clearPoints()
      this.setMode('prep', true)
      this.readyFlag = true
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showFailAlert(text) {
      this.dismissCountDown = this.dismissSecs
      this.alertText = text
    },
    auth() {
      if (this.password === '115' && this.name) {
        this.isReg = true
        this.$bvModal.hide('modal-1')
        this.isWrongPassword = false
        this.isNotName = false
        Cookies.set('name', this.name)
        Cookies.set('password', this.password)
      } else {
        if (!this.name && this.password !== '115') {
          this.isNotName = true
          this.isWrongPassword = true
        } else if (!this.name) {
          this.isNotName = true
          this.isWrongPassword = false
        } else if (this.password !== '115') {
          this.isWrongPassword = true
          this.isNotName = false
        }
      }
    },
    logout() {
      this.name = ''
      this.password = ''
      Cookies.remove('name')
      Cookies.remove('password')
      this.isReg = false
    },
    resetDims() {
      this.dimX = 10
      this.dimY = 10
      this.clearAll()
    }
  },
  created() {
    this.clearAll()
    this.selectedAlg = this.algTypes[0].value
    if (Cookies.get('name')) this.name = Cookies.get('name')
    if (Cookies.get('password')) this.password = Cookies.get('password')
    if (this.password === '115' && this.name) this.isReg = true
  }
}
</script>

<style scoped>
.table {
  border: 1px solid black;
  border-radius: 1px;
}
.kletka {
  border: 1px solid blue;
  width: 50px;
  height: 50px;
}
.green {
  background-color: green;
}
.red {
  background-color: red;
}
.blue {
  background-color: blue;
}
.black {
  background-color: black;
}
.orangeBorders {
  border: 2px solid orange;
}
.darkOrangeBorders {
  border: 4px solid darkorange;
}
.darkBlueBorders {
  border: 4px solid darkmagenta;
  color: blue;
}
.pointer {
  cursor: pointer;
}
.ava {
  height: 38px;
  width: 38px;
  border-radius: 100px; /* Радиус скругления */
  border: 3px solid blueviolet; /* Параметры рамки */
  box-shadow: 0 0 7px #666; /* Параметры тени */
}
</style>
