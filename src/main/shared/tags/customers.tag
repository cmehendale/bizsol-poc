<customers>

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
            <table class="table is-striped is-fullwidth" if="{customerList}">
                <tr>
                    <th> Name </th>
                    <th> Reqion </th>
                    <th> Poles </th>
                    <th> Sale </th>
                    <th> Discount </th>
                </tr>
                <tr each="{customer in customerList}" if="{passesFilter(customer)}">
                    <td> {customer.ALCLTX} </td>
                    <td> {customer.DZCTTX} </td>
                    <td> {(customer.poles || 0).toLocaleString('en-IN')} </td>
                    <td> {(customer.sale || 0).toLocaleString('en-IN')} </td>
                    <td> {(customer.discount || 0).toLocaleString('en-IN')} </td>
                </tr>
            </table>
        </div>
    </hero>
    <!-- Any other Bulma elements you want -->
  </div>
  <button onclick="{close}" class="modal-close is-large" aria-label="close"></button>
</div>


<script>
    this.customerList = null
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

    this.passesFilter = function(customer) {
        if (!this.fltr || this.fltr.trim().length <= 0) return true

        var ok =  String((customer.ALCLTX  || '')).toLowerCase().match(this.fltr.toLowerCase()) ||
                  String((customer.DZCTTX  || '')).toLowerCase().match(this.fltr.toLowerCase()) ||
                  customer.poles >= Number(this.fltr || '0')
                  customer.sale >= Number(this.fltr || '0')
        
        return ok
    }

    this.onMount = function() {
        if (!opts.app) return
        this.customerList = opts.customerList
        opts.app.on('customerList:modal', () => { 
            this.show = true
            this.update()
        })
    }

    this.onUpdate = function() {
        console.log("IN ITEMS", opts.customerlist)
        this.customerList = opts.customerlist
    }

    this.close = function() {
        this.show = false
        this.update()
    }

    this.on('mount', this.onMount.bind(this))
    this.on('update', this.onUpdate.bind(this))

</script>
</customers>