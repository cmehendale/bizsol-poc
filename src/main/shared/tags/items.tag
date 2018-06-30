<items>

<div class="modal {'is-active': show }">
  <div onclick="{close}" class="modal-background"></div>
  <div class="modal-content">
    <div class="hero is-light">
        <div class="hero-body">
            <h3> Item List </h3>
            <div class="columns is-mobile">
                <div class="column">
                    <input class="input is-fullwidth" onkeyup="{onFilter.bind(this)}" placeholder="Type to filter">
                </div>
            </div>
            <table class="table is-striped is-fullwidth" if="{itemList}">
                <tr>
                    <th> Code </th>
                    <th> Family </th>
                    <th> Name </th>
                    <th> Poles </th>
                    <th> Rate </th>
                </tr>
                <tr each="{item in itemList}" if="{passesFilter(item)}">
                    <td> {item.ITNBR} </td>
                    <td> {item.JBADR0} </td>
                    <td> {item.ITDSC} </td>
                    <td> {item.NUMPOL || 'NA'} </td>
                    <td> {(item.PLIBP || '0').toLocaleString('en-IN')} </td>
                </tr>
            </table>
        </div>
    </hero>
    <!-- Any other Bulma elements you want -->
  </div>
  <button onclick="{close}" class="modal-close is-large" aria-label="close"></button>
</div>


<script>
    this.itemList = null
    this.show     = false
    this.timer    = null

    this.clearTimeout = function() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    this.onFilter = function(e) {
        this.clearTimeout()
        this.timer = setTimeout(()=> {
            this.fltr = e.target.value
            this.clearTimeout()
            this.update()
        },200)
    }

    this.passesFilter = function(item) {
        if (!this.fltr || this.fltr.trim().length <= 0) return true

        var ok =  String((item.ITNBR  || '')).toLowerCase().match(this.fltr.toLowerCase()) || 
                  String((item.JBADR0 || '')).toLowerCase().match(this.fltr.toLowerCase()) ||
                  String((item.ITDSC  || '')).toLowerCase().match(this.fltr.toLowerCase()) ||
                  item.NUMPOL >= Number(this.fltr || '0') ||
                  item.PLIBP  >= Number(this.fltr || '0')
        
        return ok
    }

    this.onMount = function() {
        if (!opts.app) return
        this.itemList = opts.itemList
        opts.app.on('itemList:modal', () => { 
            this.show = true
            this.update()
        })
    }

    this.onUpdate = function() {
        console.log("IN ITEMS", opts.itemlist)
        this.itemList = opts.itemlist
    }

    this.close = function() {
        this.show = false
        this.update()
    }

    this.on('mount', this.onMount.bind(this))
    this.on('update', this.onUpdate.bind(this))

</script>
</items>