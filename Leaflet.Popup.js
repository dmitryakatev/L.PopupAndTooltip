L.MarkerPopup = L.DelayTask.extend({
	
	// @override
	runTask: function(e) {
		var popup = this._target.getPopup();

		if (!popup) {
			popup = new L.Popup({ offset: [0, -10], closeButton: false }, this);
			this._target.bindPopup(popup);

			popup.on('add', this.onAddPopup, this);
			popup.on('remove', this.onRemovePopup, this);
		}

		if (this.options.update) {
			this.options.update(popup);
		} else {
			popup.setContent(this.options.html);
		}

		this._target.openPopup();
	},

	// @override
	updatePosition: function(e) {
		this.stopDelayHidePopup();
	},

	// @override
	cancelTask: function() {
		var popup = this._target ? this._target.getPopup() : null;

		if (popup && popup.isOpen()) {
			this.executed = true;

			this.startDelayHidePopup();
		}
	},

	// on add \ remove popup

	onAddPopup: function(e) {
		var el = e.target.getElement();

		L.DomEvent.on(el, 'mouseenter', this.onMousePopupEnter, this);
		L.DomEvent.on(el, 'mouseleave', this.onMousePopupLeave, this);
	},

	onRemovePopup: function(e) {
		var el = e.target.getElement();

		L.DomEvent.off(el, 'mouseenter', this.onMousePopupEnter, this);
		L.DomEvent.off(el, 'mouseleave', this.onMousePopupLeave, this);

		this.executed = false;
	},

	// on enter \ leave popup

	onMousePopupEnter: function() {
		this.stopDelayHidePopup();
	},

	onMousePopupLeave: function() {
		this.startDelayHidePopup();
	},

	// start \ stop timer

	startDelayHidePopup: function() {
		me = this;

		this.stopDelayHidePopup();

		this.timerPopup = setTimeout(function() {
			me.timerPopup = null;
			me.executed = false;
			
			me._target.closePopup();
		}, 200);
	},

	stopDelayHidePopup: function() {
		if (this.timerPopup !== null) {
			clearTimeout(this.timerPopup);
			this.timerPopup = null;
		}
	}
});

L.markerPopup = function (options) {
    return new L.MarkerPopup(options);
};
