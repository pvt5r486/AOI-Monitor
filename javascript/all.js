// API 來源
// https://opendata.epa.gov.tw/Data/Contents/AQI/

// 心得雷點：
// 1.　v-for不能用在Vue的ROOT
Vue.component('card-component', {
    props: {
        locationData: {
            type: Array,
            default: [],
        },
        isStar: {
            type: Boolean,
            default: false,
        },
    },
    template: '#card',
    methods: {
        starAdd(item) {
            this.$emit('addmark', item);
        },
        starRemove(item) {
            this.$emit('removemark', item);
        },
        switchClassName(status) {
            //console.log(this);
            //console.log(status);
            return app.statusColor(status);
        }
    }
});

var app = new Vue({
    el: '#app',
    data: {
        data: [],
        location: [],
        stared: [],
        filter: '',
    },
    methods: {
        getData() {
            const vm = this;
            const api = 'http://opendata2.epa.gov.tw/AQI.json';
            $.get(api).then(function (response) {
                vm.data = response;
                //console.log(response)
                vm.getLocalstoageData();
            });
        },
        getLocalstoageData() {
            if (JSON.parse(localStorage.getItem("staredArray"))) {
                let vm = this;
                let oldLocalStorageArray = JSON.parse(localStorage.getItem("staredArray"));
                let updateArray = [];
                for (let i = 0; i < oldLocalStorageArray.length; i++) {
                    for (let j = 0; j < vm.data.length; j++) {
                        if (vm.data[j].SiteName === oldLocalStorageArray[i].SiteName) {
                            updateArray[i] = vm.data[j];
                        }
                    }
                }
                //console.log(vm.data);
                this.stared = updateArray;
            }
        },
        statusColor(status) {
            let className = '';
            switch (status) {
                case '普通':
                    return className = 'status-aqi2'
                    break;
                case '對敏感族群不健康':
                    return className = 'status-aqi3'
                    break;
                case '對所有族群不健康':
                    return className = 'status-aqi4'
                    break;
                case '非常不健康':
                    return className = 'status-aqi5'
                    break;
                case '危害':
                    return className = 'status-aqi6'
                    break;
                default:
                    return className
                    break;
            }
        },
        addMark(data) {
            //console.log(item);
            const vm = this;
            //取得索引,如沒重複則回傳-1
            let index = vm.stared.findIndex(function (item, key) {
                return item.SiteName === data.SiteName;
            });
            if (index == -1) {
                if (confirm('將' + data.County + '-' + data.SiteName + '放入重點觀測區？')) {
                    vm.stared.push(data);
                    //將stared放入localstorage
                    localStorage.setItem("staredArray", JSON.stringify(vm.stared));
                }
            }
        },
        cancelMark(data) {
            const vm = this;
            let index = vm.stared.findIndex(function (item, key) {
                return item.SiteName === data.SiteName;
            });

            if (confirm('確定要移除' + data.County + '-' + data.SiteName + '嗎？')) {
                vm.stared.splice(index, 1);
                //將stared放入localstorage
                localStorage.setItem("staredArray", JSON.stringify(vm.stared));
            }
        }
    },
    computed: {
        selectOptionFilter() {
            const vm = this;
            let countyArray = [];
            for (let i = 0; i < vm.data.length; i++) {
                countyArray[i] = vm.data[i].County;
            }
            return countyArray.filter((element, index, arr) => {
                return arr.indexOf(element) === index;
            });
        },
        locationFilter() {
            const vm = this;
            vm.location = vm.data.filter((item, index) => {
                return vm.data[index].County == vm.filter
            });
            return vm.location;
        }
    },
    mounted() {
        this.getData();
    },
});
