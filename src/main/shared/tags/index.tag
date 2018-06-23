<index>
	<div class="hero">
	<div class="hero-body">
		<div class="container">
		<h1 class="title is-1 has-text-centered"> Scheme Management </h1>
		<h2 class="subtitle is-3 has-text-centered"> Novateur </h2>
		<hr/>

		<div class="hero is-light">
		<div class="hero-body">
			<form class="form">

			<table class="table is-striped is-fullwidth">
				<tr>
					<th colspan="3"> 
						<label class="has-text-grey"> Select Distributor </label>
						<br/>
						<select class="select" onchange={onDistributor} >
							<option each={dd in distributorList} value={dd.DECANB}> {dd.ALCLTX} </option>
						<select>
					</th>
					<th colspan="2" class="has-text-right"> 
						<label class="has-text-grey"> Total Sale Value </label> 
						<h2 class="is-size-3 has-text-primary"> {distributor.sale.toLocaleString()} </h2>
					</th>
				</tr>


				<tr>
					<th> Item Type </th>
					<th class="has-text-right"> Qty </th>
					<th class="has-text-right"> Rate </th>
					<th class="has-text-right"> Amount </th>
					<th/>
				</tr>
				<tr each={orderList}>
					<td> {ITDSC} </td>
					<td class="has-text-right"> {COQTY} </th>
					<td class="has-text-right"> {LP} </th>
					<td class="has-text-right"> {amount.toLocaleString()} </th>
					<td class="has-text-right"> <span class="button is-danger" onclick={onDelOrderItem} > Del </span> </td>			
				</tr>
				<tr>
					<td> 
						<select onchange={onItem} class="select" ref='type'> 
							<option each={item in itemList} value={item.ITNBR}> {item.ITDSC} </option>
						</select> 
					</td>
					<td class="has-text-right"> <input class="input" align="right" ref='qty' value={orderItem.value} /> </td>
					<td class="has-text-right"> <input class="input" align="right" ref='rate' value='' /> </td>
					<td> </td>
					<td class="has-text-right"> <span class="button is-primary" onclick={onAddOrderItem}> Add </span> </td>
				</tr>
				<tr> 
					<td colspan="5"/>
				</tr>
				<tr>
					<td> 
						<span class="is-size-4"> Total </span>
					</td>
					<td class="has-text-right">  </td>
					<td class="has-text-right"> </td>
					<td class="has-text-right"> <span class="is-size-4 has-text-info"> {getInvoiceTotal().toLocaleString()} </span> </td>
					<td> </td>
				</tr>

			</table>

			<p class="button is-info" onclick={onCalculateDiscount}> Calculate Discount </p>
			<hr/>
			</form>
				<div if="{schemes}" class="hero is-light">
				<div class="hero-body">
					<h1 class="title"> Benefit calculation </h1>
					<table class="table is-striped is-fullwidth">
						<tr>
							<th>
								Scheme Applicable
							</th>
							<th colspan="3">
								Benefit
							</th>
						</tr>
						<tr>
							<th>
							</th>
							<th>
								Free Items
							</th>
							<th>
								Discount Value
							</th>
							<th>
								Discount Percent
							</th>
						</tr>
						<tr each="{scheme in schemes}">
							<td>
								{scheme.meta.name}
							</td>
							<td>
								<ul if="{scheme.outcome.items}">
									<li each="{key in Object.keys(scheme.outcome.items)}">
										({scheme.outcome.items[key].code}) { scheme.outcome.items[key].description } <br/>
										<span class="is-italic"> {scheme.outcome.items[key].qty} pcs (@ INR { scheme.outcome.items[key].rate }) </span>
									</li>
								</ul>
							</td>
							<td>
								{scheme.outcome.discount.value.toLocaleString()}
							</td>
							<th>
								{scheme.outcome.discount.percent.toLocaleString()}%
							</th>
						</tr>
						<tr>
							<td colspan="4"></td>
						</tr>
						<tr class="is-text-info">
							<th colspan="2">
								<span class="is-size-5 has-text-info">Total Order</span>
							</th>
							<th>
								<span class="is-size-5 has-text-info">{outcome.discount.value.toLocaleString()}</span>
							</th>
							<th>
								<span class="is-size-5 has-text-info">{outcome.discount.percent.toLocaleString()}%</span> 
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

<script>

	this.distributor = {}
	this.distributorList = []
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

		this.app = opts.app
		console.log("has Moment" - this.app.moment())
		this.fetchDistributorList()
		this.fetchItemList()
	}

	onDistributor(e) {
		this.distributor = this.distributorList.find((d) => { return d.DECANB == e.target.value })
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
			COQTY: this.refs.qty.value,
			LP: this.refs.rate.value,
			TAX_SUF: this.app.moment().format('DD/MM/YY'),
			Family: item.JBADR0,
			amount: this.refs.qty.value * this.refs.rate.value
		})
		this.refs.qty.value = ''
		this.update()
	}

	fetchDistributorList() {
		this.app.data('distributor:list').then((list) => { 
			console.log("DIST LIST = ", list);
			this.distributorList = list 
			this.distributor = list[0]
			this.update(); 
		})
	}

	fetchItemList() {
		this.app.data('item:list').then((list) => { 
			console.log("ITEM LIST = ", list);
			this.itemList = list; 
			this.item = this.itemList[0]
			this.refs.rate.value = this.item.PLIBP 
			this.update(); 
		})
	}

	onCalculateDiscount() {
		this.app.data("calculate:discount", {distributor: this.distributor, orderList: this.orderList})
			.then((data)=> {
				//console.log("RESPONSE", data)
				this.schemes = Object.keys(data)
									 .filter((k)=> { return ['conditions', 'outcome'].indexOf(k) < 0 })
									 .map((k)=> { return data[k] })
				this.outcome = data.outcome
				console.log("this.schemes", this.schemes)
				this.update()
			})
	}

	this.on('mount', this.onMount.bind(this)) 

</script>

</index>