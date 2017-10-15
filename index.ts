/**
 * Expose `Delegator`.
 */

export class Delegator {
	public methods = [];
	public getters = [];
	public setters = [];
	public fluents = [];

	/**
	 * Initialize a delegator.
	 *
	 * @param {Object} proto
	 * @param {String} target
	 * @api public
	 */

	constructor(public proto, public target) {}

	/**
	 * Automatically delegate properties
	 * from a target prototype
	 *
	 * @param {Object} proto
	 * @param {object} targetProto
	 * @param {String} targetProp
	 * @api public
	 */

	static auto(proto, targetProto, targetProp) {
		const delegator = new Delegator(proto, targetProp);
		const properties = Object.getOwnPropertyNames(targetProto);
		for (let i = 0; i < properties.length; i++) {
			const property = properties[i];
			const descriptor = Object.getOwnPropertyDescriptor(targetProto, property);
			if (descriptor.get) {
				delegator.getter(property);
			}
			if (descriptor.set) {
				delegator.setter(property);
			}
			if (descriptor.hasOwnProperty('value')) {
				const value = descriptor.value;
				if (value instanceof Function) {
					delegator.method(property);
				} else {
					delegator.getter(property);
				}
				if (descriptor.writable) {
					delegator.setter(property)
				}
			}
		}
	}

	/**
	 * Delegate method `name`.
	 *
	 * @param {String} name
	 * @return {Delegator} self
	 * @api public
	 */

	method(name) {
		const proto = this.proto;
		const target = this.target;
		this.methods.push(name);

		proto[name] = function() {
			return this[target][name].apply(this[target], arguments)
		}

		return this
	};

	/**
	 * Delegator accessor `name`.
	 *
	 * @param {String} name
	 * @return {Delegator} self
	 * @api public
	 */

	access(name) {
		return this.getter(name).setter(name)
	};

	/**
	 * Delegator getter `name`.
	 *
	 * @param {String} name
	 * @return {Delegator} self
	 * @api public
	 */

	getter(name) {
		const proto = this.proto;
		const target = this.target;
		this.getters.push(name);

		proto.__defineGetter__(name, function() {
			return this[target][name]
		})

		return this;
	};

	/**
	 * Delegator setter `name`.
	 *
	 * @param {String} name
	 * @return {Delegator} self
	 * @api public
	 */

	setter(name) {
		const proto = this.proto;
		const target = this.target;
		this.setters.push(name);

		proto.__defineSetter__(name, function(val) {
			return this[target][name] = val;
		})

		return this;
	};

	/**
	 * Delegator fluent accessor
	 *
	 * @param {String} name
	 * @return {Delegator} self
	 * @api public
	 */

	fluent(name) {
		const proto = this.proto;
		const target = this.target;
		this.fluents.push(name);

		proto[name] = function (val) {
			if ('undefined' != typeof val) {
				this[target][name] = val;
				return this;
			} else {
				return this[target][name];
			}
		};

		return this;
	}
	
	

}

/**
 * Expose `delegate`.
 */

interface DelegateInterface {
	(proto: Object, target: string): Delegator;
	auto: Function;
}

const delegate = <DelegateInterface>function(proto: Object, target: string) : Delegator {
	return new Delegator(proto, target);
}
 
delegate.auto = Delegator.auto

export { delegate }