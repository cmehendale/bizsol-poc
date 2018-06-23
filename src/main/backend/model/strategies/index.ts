import * as _ from 'lodash'
const selectn = require('selectn')

export const strategies:any = {

	combine: (data:any[], path:string):any => {
		return { meta: data, value: _.sumBy(data, (d)=> { return selectn(path, d)}) }
	},

	max: (data:any[], path:string):any => {
		const mx = _.maxBy(data, (d)=> { return selectn(path, d)})
		return { meta: [mx], value: selectn(path, mx) }
	}
	
}