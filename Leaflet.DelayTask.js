L.DelayTask = L.Class.extend({
	
	options: {
		delayTask: 500,
		target: null
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this.map = null;
		this.executed = false;
		this.timer = null;

		this.setTarget(this.options.target);
	},

	setTarget: function (nextTarget) {
		var currTarget = this._target;

		if (currTarget) {
			if (this.hasMap(currTarget)) {
				this.unbindTarget(currTarget);
			}

			currTarget.off('add', this.onAddLayer, this);
			currTarget.off('remove', this.onRemoveLayer, this);

			currTarget._taskRunner = null;
		}

		if (nextTarget) {
			if (this.hasMap(nextTarget)) {
				this.bindTarget(nextTarget);
			}

			nextTarget.on('add', this.onAddLayer, this);
			nextTarget.on('remove', this.onRemoveLayer, this);

			nextTarget._taskRunner = this;
		}

		this._target = nextTarget;
	},

	// bind

	hasMap: function(target) {
		return target._map && target._map.hasLayer(target);
	},

	onAddLayer: function() {
		this.bindTarget(this._target);
	},

	onRemoveLayer: function() {
		this.unbindTarget(this._target);
	},

	bindTarget: function (target) {
		this.map = target._map;

		L.DomEvent.on(target, 'mouseout', this.onMouseOut, this);
		L.DomEvent.on(target, 'mousemove', this.onMouseMove, this);

		this.map.on('click', this.onMouseOut, this);
		this.map.on('move', this.onMouseOut, this);
		this.map.on('viewreset', this.onMouseOut, this);
	},

	unbindTarget: function (target) {
		L.DomEvent.off(target, 'mouseout', this.onMouseOut, this);    
		L.DomEvent.off(target, 'mousemove', this.onMouseMove, this);

		this.map.off('click', this.onMouseOut, this);
		this.map.off('move', this.onMouseOut, this);
		this.map.off('viewreset', this.onMouseOut, this);

		this.map = null;
	},

	// call events

	onMouseMove: function(e) {
		if (this.executed) {
			this.updatePosition(e);
		} else {
			this.cleanTimer();
			this.startTimer(e);
		}
	},

	onMouseOut: function(e) {
		this.executed = false;

		this.cleanTimer();
		this.cancelTask(e);
	},

	startTimer: function(e) {
		me = this;

		this.timer = setTimeout(function() {
			me.timer = null;
			me.executed = true;

			me.runTask(e);
			
		}, this.options.delayTask);
	},

	cleanTimer: function() {
		if (this.timer !== null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	},

	// ------------------------------

	// @override
	runTask: function(e) {
		// !!!
	},

	// @override
	updatePosition: function(e) {
		// !!!
	},

	// @override
	cancelTask: function(e) {
		// !!!
	}
});

L.delayTask = function (options) {
    return new L.DelayTask(options);
};
