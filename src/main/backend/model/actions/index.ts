import * as _ from 'lodash'
const selectn = require('selectn')

export const actions:any = {

	discount: async (data:any, params:any):Promise<any> => {
		return  selectn(params.prop, data) * params.value / 100 //data.value * data.factor / 100
	},

	flat: async(data:any, params:any):Promise<any> => {
		return params.value
	}
	
}