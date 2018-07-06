const RuleEngine = require("json-rules-engine");

const comboSum = (compareFn: Function) => {
  return (fact: any, value: any) => {
    const keys = Object.keys(value);
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii];
      const parts = key.split(".");
      if (parts.length > 1) {
        const p_keys = parts[0];
        const p_path = parts[1];
        const p_keys_parts = p_keys.split(",");
        const sum = p_keys_parts.reduce((sum: number, p_key) => {
          sum += (fact[p_key] || {})[p_path] || 0;
          return sum;
        }, 0);
        if (compareFn(sum, value[key])) return true;
      }
    }
    return false;
  };
};

export default () => {
  const engine = new RuleEngine.Engine();
  engine.addOperator(
    new RuleEngine.Operator(
      "comboSumGreaterThanInclusive",
      comboSum((a: number, b: number) => a >= b) 
    )
  );
  engine.addOperator(
    new RuleEngine.Operator(
      "comboSumLessThanInclusive",
      comboSum((a: number, b: number) => a <= b) 
    )
  );
  return engine;
};
