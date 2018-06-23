const RuleEngine = require('json-rules-engine')

export default ()=> {
	return new RuleEngine.Engine();
}
