<index>
	<div class="hero">
	<div class="hero-body">
		<div class="container">
		<h1 class="title is-1 has-text-centered"> Scheme Management </h1>
		<h2 class="subtitle is-3 has-text-centered"> Novateur </h2>
		<hr/>

		<div class="hero is-light">

		<div class="hero-body">

			<div class="columns is-mobile">
				<div class="column">
					<button onclick={showItemListModal} class="button is-info"> Show Item List </button>
				</div>
				<div class="column">
					<button onclick={showCustomerListModal} class="button is-info"> Show Customer List </button>
				</div>
			</div>

			<form class="form">

			<table class="table is-striped is-fullwidth">
				<tr>
					<td width="50%" colspan="2"> 
						<select class="select float-left" onchange={onCustomer} >
							<option each={dd in customerList} value={dd.DECANB}> {dd.ALCLTX} </option>
						<select> 
					</td>
					<td width="50%" colspan="4">
						<table class="has-text-right table is-striped is-fullwidth">
							<tr>
								<td width="34%" class="has-text-right">
									<span class="is-size-7 has-text-grey">Poles</span><br/>
 									<span class="is-size-5">{customer.poles.toLocaleString('en-IN')}</span> 
								</td>
								<td width="33%" class="has-text-right">
									<span class="is-size-7 has-text-grey">Sale</span><br/>
 									<span class="is-size-5"> {customer.sale.toLocaleString('en-IN')} </span>
								</td>
								<td width="33%" class="has-text-right">
									<span class="is-size-7 has-text-grey">Discount</span><br/>
 									<span class="is-size-5">{customer.discount.toLocaleString('en-IN')} </span>
								</td>
							</tr>
						</table>
					</td>
				</tr>


				<tr>
					<th colspan="2"> Item Type </th>
					<th class="has-text-right"> Qty </th>
					<th class="has-text-right"> Rate </th>
					<th class="has-text-right"> Amount </th>
					<th/>
				</tr>
				<tr each={orderList}>
					<td colspan="2"> {ITDSC} </td>
					<td class="has-text-right"> {ORDQTY} </th>
					<td class="has-text-right"> {LP} </th>
					<td class="has-text-right"> {amount.toLocaleString('en-IN')} </th>
					<td class="has-text-right"> <span class="button is-danger" onclick={onDelOrderItem} > Del </span> </td>			
				</tr>
				<tr>
					<td colspan="2"> 
						<select onchange={onItem} class="select" ref='type'> 
							<option each={item in itemList} value={item.ITNBR}> ({item.JBADR0}) {item.ITDSC} </option>
						</select> 
					</td>
					<td class="has-text-right"> <input class="input" align="right" ref='qty' value={orderItem.value} /> </td>
					<td class="has-text-right"> <input class="input" align="right" ref='rate' value='' /> </td>
					<td class="has-text-right"> {(refs.qty.value * refs.rate.value).toLocaleString('en-IN')} </td>
					<td class="has-text-right"> <span class="button is-primary" onclick={onAddOrderItem}> Add </span> </td>
				</tr>
				<tr> 
					<td colspan="6"/>
				</tr>
				<tr>
					<td colspan="2"> 
						<span class="is-size-4"> Total </span>
					</td>
					<td class="has-text-right">  </td>
					<td class="has-text-right"> </td>
					<td class="has-text-right"> <span class="is-size-4 has-text-info"> {getInvoiceTotal().toLocaleString('en-IN')} </span> </td>
					<td> </td>
				</tr>

			</table>

			<p class="button is-info" onclick={onCalculateDiscount}> Calculate Discount </p>
			<hr/>
			</form>
				<div if="{schemes}" class="hero is-light">
				<div class="hero-body">
					<div if="{schemes.length <= 0}">
						No current schemes applicable
					</div>
					<div if="{schemes.length > 0}">
					<h1 class="title"> Benefit calculation </h1>
					<table class="table is-striped is-fullwidth">
						<tr>
							<th>
								Scheme Applicable
							</th>
							<th colspan="3" class="has-text-centered is-size-5">
								Benefit
							</th>
						</tr>
						<tr>
							<th>
							</th>
							<th>
								Free Items
							</th>
							<th class="has-text-right">
								Discount Value
							</th>
							<th class="has-text-right">
								Discount Percent
							</th>
						</tr>
						<tr each="{scheme in schemes}">
							<td>
								{scheme.name}
							</td>
							<td>
								<ul if="{scheme.outcome.items}">
									<li each="{key in Object.keys(scheme.outcome.items)}">
										({scheme.outcome.items[key].code}) { scheme.outcome.items[key].description } <br/>
										<span class="is-italic"> {scheme.outcome.items[key].qty} pcs (@ INR { scheme.outcome.items[key].rate }) </span>
									</li>
								</ul>
							</td>
							<td class="has-text-right">
								{scheme.outcome.discount.value.toLocaleString('en-IN')}
							</td>
							<th class="has-text-right">
								{scheme.outcome.discount.percent.toLocaleString('en-IN')}%
							</th>
						</tr>
						<tr>
							<td colspan="4"></td>
						</tr>
						<tr if="{outcome}" class="is-text-info">
							<th colspan="2">
								<span class="is-size-5 has-text-info">Total Benefit</span>
							</th>
							<th class="has-text-right">
								<span class="is-size-5 has-text-info">{outcome.discount.value.toLocaleString('en-IN')}</span>
							</th>
							<th class="has-text-right">
								<span class="is-size-5 has-text-info">{outcome.discount.percent.toLocaleString('en-IN')}%</span> 
							</th>
						</tr>
					</table>
					</div>
				</div>
				</div>
			</div>
			</div>
		</div>
	</div>
	</div>

<items itemlist = {itemList} app={opts.app}></items>
<customers customerList = {customerList} app={opts.app}></customers>
<script>

	this.customer = {}
	this.customerList = []
	this.itemList = []
	this.orderList = []
	this.orderItem = {}
	this.discount = 0

	getInvoiceTotal() {
		return this.orderList.reduce((sum, o)=> {
			return sum + o.amount
		}, 0)
	}
	
	getDiscountLabel(discount) {
		return discount ? discount.meta.map((m)=> { return m.name }): ''
	}

	onMount() {
		if (!opts.app) return
		console.log("IN MOUNT")
		this.app = opts.app
		this.fetchCustomerList()
		this.fetchItemList()
	}

	showItemListModal() {
		this.app.trigger('itemList:modal')
	}

	showCustomerListModal() {
		this.app.trigger('customerList:modal')
	}

	onCustomer(e) {
		this.customer = this.customerList.find((d) => { return d.DECANB == e.target.value })
	}

	onItem(e) {
		this.item = this.itemList.find((ii) => { return ii.ITNBR == e.target.value })
		this.refs.rate.value = this.item.PLIBP
		this.update() 
	}

	onDelOrderItem(e) {
		this.orderList.splice(e.item.idx, 1)
		this.update()
	}

	onAddOrderItem(e) {
		const item = this.itemList.find((ii) => { return ii.ITNBR == this.refs.type.value })
		if (!item) return
		this.orderList.push({
			idx: this.orderList.length,
			ITDSC: item.ITDSC,
			ITEM: item.ITNBR,
			ORDQTY: this.refs.qty.value,
			LP: this.refs.rate.value,
			TAX_SUF: this.app.moment().format('DD/MM/YY'),
			ORDPOL: this.refs.qty.value * (item.NUMPOL || 0),
			JBADR0: item.JBADR0,
			amount: this.refs.qty.value * this.refs.rate.value,
			ORDLP : this.refs.qty.value * this.refs.rate.value
		})
		this.refs.qty.value = ''
		this.update()
	}

	fetchCustomerList() {
		this.app.data('customer:list').then((list) => { 
			console.log("DIST LIST = ", list);
			this.customerList = list 
			this.customer = list[0]
			this.update(); 
		})
	}

	fetchItemList() {
		this.app.data('item:list').then((list) => { 
			console.log("ITEM LIST = ", list);
			this.itemList = list; 
			this.item = this.itemList[0]
			if (this.refs.rate)
				this.refs.rate.value = this.item.PLIBP 
			this.update(); 
		})
	}

	onCalculateDiscount() {
		this.app.data("calculate:discount", {customer: this.customer, orderList: this.orderList})
			.then((data)=> {
				this.schemes = data.filter((s) => s.outcome )
				this.outcome = {
					discount: this.schemes.reduce((o, s) => {
											o.value   += s.outcome.discount.value
											o.percent += s.outcome.discount.percent
											return o
										}, { value:0, percent:0})
				}

				console.log("this.schemes", this.schemes, this.outcome)
				this.update()
			})
	}

	this.on('mount', this.onMount.bind(this)) 

</script>

</index>