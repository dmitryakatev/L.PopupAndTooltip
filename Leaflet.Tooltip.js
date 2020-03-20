L.MarkerTooltip = L.DelayTask.extend({
	
	options: {
		width: 'auto',
		minWidth: '',
		maxWidth: '',
		padding: '0px 0px',
		// showDelay: 100,
		// hideDelay: 100,
		mouseOffset: L.point(0, 24),
		fadeAnimation: true,
		trackMouse: false
	},
	
	isVisible: function () {
		return this._showing;
	},

	setHtml: function (html) {
		if (L.MarkerTooltip.activeTip === this) {
			this._setHtml(html);
		} else {
			this.options.html = html;
		}
	},

	
	// @override
	runTask: function(e) {
		var point = null;
		
		if (e.originalEvent) {
			point = L.point(e.containerPoint.x, e.containerPoint.y);
		} else {
			point = this._target._map.mouseEventToContainerPoint(e);
		}

		this.show(point);
	},

	// @override
	updatePosition: function(e) {
		this._updatePosition(e);
	},

	// @override
	cancelTask: function() {
		this._hide();
	},

	// show / hide

	show: function (point, html) {
		if (!this.hasMap(this._target)) {
			return;
		}

	    if (L.MarkerTooltip.activeTip && L.MarkerTooltip.activeTip != this) {
			L.MarkerTooltip.activeTip._hide();
		}

		L.MarkerTooltip.activeTip = this;

		// --------------------------------------------------------

		var map = this._target._map;
		var container = map._tooltipContainer;
		var content = container.children[0];

		content.style.width = this._isNumeric(this.options.width) ? this.options.width + 'px' : this.options.width;
		content.style.minWidth = this._isNumeric(this.options.minWidth) ? this.options.minWidth + 'px' : this.options.minWidth;
		content.style.maxWidth = this._isNumeric(this.options.maxWidth) ? this.options.maxWidth + 'px' : this.options.maxWidth;
		content.style.padding = this._isNumeric(this.options.padding) ? this.options.padding + 'px' : this.options.padding;

		// --------------------------------------------------------
		
		if (this.options.update) {
			this.options.update(this, this._target);
		} else {
			if (html) {
				this.options.html = html;
			}

			this._setHtml(this.options.html);
		}
		
		this.setPosition(point);
		
		if (this.options.showDelay) {
			this._delay(this._show, this, this.options.showDelay);
		} else {
			this._show();
		}
	},

	_show: function () {
		if (!this.hasMap(this._target)) {
			return;
		}

		var container = this._target._map._tooltipContainer;
		var content = container.children[0];
		
		if (!this._showing) {
			this._showing = true;

			L.DomUtil.addClass(content, 'leaflet-tooltip-fade');

			// Necessary to force re-calculation of the opacity value so transition will run correctly
			if (window.getComputedStyle) {
				window.getComputedStyle(content).opacity;
			}
		}
	},

	hide: function () {
		if (this.options.hideDelay) {
			this._delay(this._hide, this, this.options.hideDelay);
		} else {
			this._hide();
		}		
	},

	_hide: function () {	
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
		
		if (this._showing) {
			this._showing = false;

			var container = this._target._map._tooltipContainer;
			var content = container.children[0];

		    content.style.display = 'none';
			L.DomUtil.removeClass(content, 'leaflet-tooltip-fade');

			if (L.MarkerTooltip.activeTip === this) {
				delete L.MarkerTooltip.activeTip;
			}
		}
	},

	// additions

	_setHtml: function(html) {
		if (this.hasMap(this._target)) {
			var container = this._target._map._tooltipContainer;
			var content = container.children[0];

			if (typeof html === 'string') {
				content.innerHTML = html;
			}

			this._sizeChanged = true;
		} else {
			this.options.html = html;
		}
	},

	_delay: function (func, scope, delay) {
		var me = this;

		if (this._timeout) {
			clearTimeout(this._timeout);
		}

		this._timeout = setTimeout(function () {
			delete me._timeout;
			func.call(scope);
		}, delay);
	},

	_isNumeric: function (val) {
		return !isNaN(parseFloat(val)) && isFinite(val);
	},

	_getElementSize: function (el) {		
		var size = this._size;

		if (!size || this._sizeChanged) {
			size = {};

			el.style.left = '-999999px';
			el.style.right = 'auto';
			el.style.display = 'inline-block';
			
			size.x = el.offsetWidth;
			size.y = el.offsetHeight;
			
			el.style.left = 'auto';
			
			this._sizeChanged = false;
		}
		return size;
	},
	
	setPosition: function (point) {
		if (!this.hasMap(this._target)) {
			return;
		}

		var map = this._target._map;
		var mapSize = map.getSize();
		var container = map._tooltipContainer;
		var content = container.children[0];

		var contentSize = this._getElementSize(content);
		point = point.add(this.options.mouseOffset);
		
		if (point.x + contentSize.x > mapSize.x) {
			content.style.left = 'auto';
			content.style.right = (mapSize.x - point.x) + 'px';
		} else {
			content.style.left = point.x + 'px';
			content.style.right = 'auto';
		}
		
		if (point.y + contentSize.y > mapSize.y) {
			content.style.top = 'auto';
			content.style.bottom = (mapSize.y - point.y) + 'px';
		} else {
			content.style.top = point.y + 'px';
			content.style.bottom = 'auto';
		}
	},

	_updatePosition: function (e) {
		L.DomEvent.stopPropagation(e);

		if (this.options.trackMouse) {
			var point = this._map.mouseEventToContainerPoint(e);		
			this.setPosition(point);
		}
	},

    _onMapChange: function (e) {
        this.hide();
    }
});

L.Map.addInitHook(function () {
	this._tooltipContainer = L.DomUtil.create('div', 'leaflet-tooltip-container', this._container);
	var div = L.DomUtil.create('div', 'leaflet-tooltip');

	div.style.position = 'absolute';

	this._tooltipContainer.appendChild(div);
});

L.markerTooltip = function (options) {
    return new L.MarkerTooltip(options);
};
