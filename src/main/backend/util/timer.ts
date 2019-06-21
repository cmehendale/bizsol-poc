const t    = require('exectimer')

export class Timer {

    name  : string
    timer : any

    static timers:any = {}

    constructor(name:string) {
        this.name = name;
        this.timer = new t.Tick(name)
    }

    static start(name:string):Timer {
        //const timer = this.timers[name] || (this.timers[name] = new Timer(name))
        return new Timer(name).start()
    }

    start():Timer {
        if (this.timer) this.timer.start()
        return this
    }

    stop():Timer {
        if (this.timer) this.timer.stop()
        return this
    }

    formatNs(num:number):string {
        if (num < 1e3) {
            return num + ' ns';
        } else if (num >= 1e3 && num < 1e6) {
            return Math.round(100 * num / 1e3)/100 + ' us';
        } else if (num >= 1e6 && num < 1e9) {
            return Math.round(100 * num / 1e6)/100 + ' ms';
        } else { //} if (num >= 1e9) {
            return Math.round(100 * num / 1e9)/100 + ' s';
        }
    }

    result():any {
        const results = t.timers[this.name]        
        return {
            name : this.name,
            count: results.count(),
            duration: this.formatNs(results.duration()),
            min: this.formatNs(results.min()),
            max: this.formatNs(results.max()),
            mean: this.formatNs(results.mean()),
            median: this.formatNs(results.median())
        }
        // // console.log(this.name, 
        // //     results.count(),
        // //     this.formatNs(results.duration())
        // // )
        // return this
    }



}