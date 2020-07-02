L.MarkerTooltip = L.DelayTask.extend({

	options: {
		html: null,
		update: null
	},

	initialize: function (options) {
		L.DelayTask.prototype.initialize.call(this, options);

		this.clientX = 0;
		this.clientY = 0;
	},

	isVisible: function () {
		return this.executed;
	},

	setHtml: function (html) {
		if (!this.options.update) {
			this.options.html = html;
		}

		this._setHtml(html);
	},

	// @override
	runTask: function(e) {
		this.clientX = e.originalEvent.clientX;
		this.clientY = e.originalEvent.clientY;

		this.show();
	},

	// @override
	cancelTask: function() {
		this.hide();
	},

	show: function () {
		if (this.options.update) {
			this.options.update(this, this._target);
		} else {
			this._setHtml(this.options.html);
		}

		var content = this.getContent();
		content.style.display = 'inline-block';
		L.DomUtil.addClass(content, 'leaflet-tooltip-show');

		this.setPosition();
	},

	hide: function () {	
		var content = this.getContent();
		content.style.display = 'none';
		L.DomUtil.removeClass(content, 'leaflet-tooltip-show');
	},

	getContent: function() {
		return this._target._map._tooltipContainer.children[0];
	},

	_setHtml: function(html) {
		if (this.isVisible() && typeof html === 'string') {
			var content = this.getContent();
			content.innerHTML = html;

			this.setPosition();
		}
	},
	
	setPosition: function () {
		var mapNode = this._target._map._container;
		var content = this.getContent();
		var mapRect = mapNode.getBoundingClientRect();
		var contentRect = content.getBoundingClientRect();

		// ширина \ высота карты
		var mapWidth = mapRect.width;
		var mapHeight = mapRect.height;

		// ширина \ высота тултипа
		var tipWidth = contentRect.width;
		var tipHeight = contentRect.height;

		// координаты тултипа внутри карты
		var rawX = this.clientX - mapRect.left;
		var rawY = this.clientY - mapRect.top;

		// позиция x \ y где должен располагаться тултип с учетом сдвига
		var x = rawX + L.MarkerTooltip.SHIFT;
		var y = rawY + L.MarkerTooltip.SHIFT;

		// если тултип выходит за край карты справа \ снизу
		var isOverRight = x + (tipWidth + L.MarkerTooltip.MARGIN) > mapWidth;
		var isOverBottom = y + (tipHeight + L.MarkerTooltip.MARGIN) > mapHeight;

		// если высота тултипа не помещается в допустимую зону по высоте
		// (с учетом отступов), то покажем тултип по центру
		if (tipHeight + 2 * L.MarkerTooltip.MARGIN > mapHeight) {
			// если высота тултипа больше чем размер всей карты
			// то покажем тултип в самом верху карты
			if (tipHeight > mapHeight) {
				y = 0;
			} else {
				y = (mapHeight - tipHeight) / 2;
			}

			// если тултип не помещается справа и помещается слева
			// то будем показывать слева
			if (isOverRight && x - (tipWidth + L.MarkerTooltip.MARGIN) >= 0) {
				x = rawX - (tipWidth + L.MarkerTooltip.MARGIN);
			}
		} else {
			// тултип выходит за край карты снизу
			if (isOverBottom) {
				y = mapHeight - (tipHeight + L.MarkerTooltip.MARGIN);
			} else {
				// если тултип прилипает сверху, то отодвинем
				if (y < L.MarkerTooltip.MARGIN) {
					y = L.MarkerTooltip.MARGIN;
				}
			}

			// тултип выходит за край карты справа
			if (isOverRight) {
				// если тултип выходит одновременно и справа и снизу
				// то поднимем тултип в самый вверх, чтобы не перекрывал иконку
				if (isOverBottom) {
					y = rawY - (L.MarkerTooltip.SHIFT + tipHeight);
				}
				
				x = mapWidth - (tipWidth + L.MarkerTooltip.MARGIN);

				// если после определения координат, где должен находиться
				// тултип мы понимаем что он выходит за рамки карты сверху, то 
				// поместим его вверху, а также справа или слева
				if (y < L.MarkerTooltip.MARGIN) {
					y = L.MarkerTooltip.MARGIN;
					x = rawX + L.MarkerTooltip.SHIFT;

					// если тултип не помещается справа и помещается слева
					// то будем показывать слева
					if (x - (tipWidth + L.MarkerTooltip.MARGIN) >= 0) {
						x = rawX - (tipWidth + L.MarkerTooltip.MARGIN);
					}
				}
			} else {
				// если тултип прилипает слева, то отодвинем
				if (x < L.MarkerTooltip.MARGIN) {
					x = L.MarkerTooltip.MARGIN;
				}
			}
		}

		content.style.left = x + 'px';
		content.style.top = y + 'px';
	}
});

// CONSTS

// сдвиг по оси X и Y
// чтобы тултип показывался не сразу под курсором, а чуть в стороне
L.MarkerTooltip.SHIFT = 15;

// константа. минимальное расстояние между тултипом и краем карты
L.MarkerTooltip.MARGIN = 30;
		

L.Map.addInitHook(function () {
	this._tooltipContainer = L.DomUtil.create('div', 'leaflet-tooltip-container', this._container);
	var div = L.DomUtil.create('div', 'leaflet-tooltip');

	div.style.position = 'absolute';

	this._tooltipContainer.appendChild(div);
});

L.markertooltip = function (options) {
    return new L.MarkerTooltip(options);
};
