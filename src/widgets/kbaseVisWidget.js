/*

*/

define('kbaseVisWidget',
    [
        'jquery',
        'd3',
        'kbwidget',
        'RGBColor',
        'geometry_rectangle',
        'geometry_point',
        'geometry_size'
    ], function( $ ) {

    $.KBWidget({

	    name: "kbaseVisWidget",

        version: "1.0.0",
        options: {
            xGutter     : 20,
            xPadding    : 30,
            yGutter     : 20,
            yPadding    : 30,

            width       : 300,
            height      : 300,

            xScaleType      : 'linear',
            yScaleType      : 'linear',

            useIDMapping    : false,
            bgColor : 'white',
            scaleXAxis : false,
            scaleYAxis : false,
            scaleAxes  : false,

            useUniqueID : false,

            transitionTime : 1750,
            ulIcon         : 'img/labs_icon.png',

            ticker : 0,

            radialGradients : {},
            radialGradientStopColor : 'black',
        },

        shouldScaleAxis : function (axis) {
            if (this.options.scaleAxes) {
                return true;
            }
            else if (axis == 'x' && this.options.scaleXAxis) {
                return true;
            }
            else if (axis == 'y' && this.options.scaleYAxis) {
                return true;
            }
            else {
                return false;
            }
        },

        _accessors : [
            'xGutter',
            'xPadding',
            'yGutter',
            'yPadding',
            'width',
            'height',
            {name : 'dataset', setter : 'setDataset'},
            {name : 'input',   setter : 'setInput'},
            {name : 'xLabel', setter : 'setXLabel'},
            {name : 'yLabel', setter : 'setYLabel'},
            {name : 'xScale', setter : 'setXScale'},
            {name : 'yScale', setter : 'setYScale'},
            'xScaleType',
            'yScaleType',
            'yHeightScaleType',
            'xIDMap',
            'yIDMap',
            'radialGradients',
        ],

        input : function() {
            return this.dataset();
        },

        setInput : function(newInput) {

            if ($.isPlainObject(newInput) && newInput.dataset != undefined) {
                return this.setValuesForKeys(newInput);
            }
            else {
                return this.setDataset(newInput);
            }

        },

        setXLabel : function (newXLabel) {
            this.setValueForKey('xLabel',newXLabel);
            this.render('xLabel');
        },

        setYLabel : function (newYLabel) {
            this.setValueForKey('yLabel',newYLabel);
            this.render('yLabel');
        },

        setXScale : function (newXScale) {
            this.setValueForKey('xScale', newXScale);
            this.render('xAxis');
        },

        setYScale : function (newYScale) {
            this.setValueForKey('yScale', newYScale);
            this.render('yAxis');
        },

        createIDMapForDomain : function (domain) {
            var map = {};
            $.each(
                domain,
                function (idx, val) {
                    map[idx] = val;
                }
            );
            return map;
        },

        setXScaleDomain : function(domain, scaleType) {
            var xScale = this.xScale();

            if (xScale == undefined) {
                if (scaleType == undefined) {
                    scaleType = this.xScaleType() || this.options.xScaleType;
                }

                xScale = d3.scale[scaleType]();

                this.setXScaleRange([0, this.chartBounds().size.width], xScale);
                this.setValueForKey('xScale', xScale);
            }

            xScale.domain(domain);

            if (this.options.useIDMapping && this.xIDMap() == undefined) {
                this.xIDMap(this.createIDMapForDomain(domain));
            }

            this.render('xAxis');

            return xScale;
        },

        setXScaleRange : function(range, xScale) {
            if (xScale == undefined) {
                xScale = this.xScale();
            }
            xScale.range(range);

            return xScale;
        },

        setYScaleDomain : function(domain, scaleType) {
            var yScale = this.yScale();

            if (yScale == undefined) {
                if (scaleType == undefined) {
                    scaleType = this.yScaleType() || this.options.yScaleType;
                }
                yScale = d3.scale[scaleType]();

                this.setYScaleRange([0,this.chartBounds().size.height], yScale);
                this.setValueForKey('yScale', yScale);
            }

            yScale.domain(domain);

            if (this.options.useIDMapping && this.yIDMap() == undefined) {
                this.yIDMap(this.createIDMapForDomain(domain));
            }

            this.render('yAxis');

            return yScale;
        },

        setYScaleRange : function(range, yScale) {
            if (yScale == undefined) {
                yScale = this.yScale();
            }
            yScale.range(range);

            return yScale;
        },


        init: function(options) {

            this._super(options);

            if (this.options.chartID == undefined) {
                this.options.chartID = this.uuid();
            }

            this.ticker = function() {
                return ++this.options.ticker;
            }

            this.uniqueID = $.proxy( function(d) {
                return d.id || (d.id = this.ticker() );
            }, this);


            this.width(this.$elem.width());
            this.height(this.$elem.height());

            this.appendUI(this.$elem);

            if (this.xScale()) {
                this.setXScaleRange([0, this.chartBounds().size.width], this.xScale());
            }
            if (this.yScale()) {
                this.setYScaleRange([0, this.chartBounds().size.height], this.yScale());
            }

            this.callAfterInit(
                $.proxy(function() {
                    this.render();
                }, this)
            );

            return this;

        },

        render : function(field) {

            if (! this._init) {
                return;
            }

            if (field == undefined || field == 'chart') {
                this.renderChart();
            }

            if (field == undefined || field == 'xAxis') {
                this.renderXAxis();
            }

            if (field == undefined || field == 'yAxis') {
                this.renderYAxis();
            }

            if (field == undefined || field == 'xLabel') {
                this.renderXLabel();
            }

            if (field == undefined || field == 'yLabel') {
                this.renderYLabel();
            }

            if (field == undefined || field == 'ulCorner') {
                this.renderULCorner();
            }

        },

        renderULCorner : function() {

            var ulBounds = this.ULBounds();

            var imgSize = new Size(
                ulBounds.size.width,
                ulBounds.size.height
            );

            var inset = 5;

            imgSize.width  -= inset;
            imgSize.height -= inset;

            if (imgSize.width > imgSize.height) {
                imgSize.width = imgSize.height;
            }
            else if (imgSize.height > imgSize.width) {
                imgSize.height = imgSize.width;
            }

            if (imgSize.width < 25) {
                return;
            }

            var ulDataset = [this.options.ulIcon];

            if (this.options.ulIcon) {
                var ulLabel = this.data('D3svg').select('.UL').selectAll('.ULLabel');

                ulLabel
                    .data(ulDataset)
                    .enter()
                        .append('image')
                            .attr('x', inset / 2)
                            .attr('y', inset / 2)
                            .attr('width', imgSize.width)
                            .attr('height', imgSize.height)
                            .attr('xlink:href', function(d) { return d})
            }
        },

        setDataset : function(newDataset) {

            this.setValueForKey('dataset', newDataset);

            if (this.shouldScaleAxis('x')) {
                this.setXScaleDomain(this.defaultXDomain());
            }

            if (this.shouldScaleAxis('y')) {
                this.setYScaleDomain(this.defaultYDomain());
            }

            this.render('chart');
        },

        defaultXDomain : function() {
            return [0,100];
        },

        defaultYDomain : function() {
            return [0,100];
        },

        renderXLabel : function() {
            var yGutterBounds = this.yGutterBounds();

            var xLabeldataset = [this.xLabel()];

            var xLabel = this.data('D3svg').select('.yGutter').selectAll('.xLabel');
            xLabel
                .data(xLabeldataset)
                    .text( this.xLabel() )
                .enter()
                    .append('text')
                        .attr('class', 'xLabel')
                        .attr('x', yGutterBounds.size.width / 2)
                        .attr('y', yGutterBounds.size.height / 2 + 3)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '11px')
                        .attr('font-family', 'sans-serif')
                        .attr('fill', 'black')
                        .text(this.xLabel());
            ;

        },

        renderYLabel : function() {

            var xGutterBounds = this.xGutterBounds();

            var yLabeldataset = [this.yLabel()];

            var xLabel = this.data('D3svg').select('.xGutter').selectAll('.yLabel');
            xLabel
                .data(yLabeldataset)
                    .text( this.yLabel() )
                .enter()
                    .append('text')
                        .attr('class', 'yLabel')
                        .attr('x', xGutterBounds.size.width / 2)
                        .attr('y', xGutterBounds.size.height / 2 + 3)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '11px')
                        .attr('font-family', 'sans-serif')
                        .attr('fill', 'black')
                        .attr('transform', 'rotate(90,'
                            + (xGutterBounds.size.width / 2 - 7)
                            + ','
                            + xGutterBounds.size.height / 2
                            + ')')
                        .text(this.yLabel());
            ;

        },

        xTickValues : function() {
            return;
        },

        xTickLabel : function(val) {
            return val;
        },

        renderXAxis : function() {

            var $self = this;

            if (this.xScale() == undefined || this.xScale().domain == undefined) {
                return;
            }

            var xAxis =
                d3.svg.axis()
                    .scale(this.xScale())
                    .orient('bottom');

            var ticks = this.xTickValues();

            if (ticks != undefined) {
                xAxis
                    .tickValues(ticks)
                    .tickSubdivide(0)
                    .tickFormat( function(d) { return $self.xTickLabel.call($self, d) } )
                ;
            }

            var gxAxis = this.data('D3svg').select('.yPadding').select('.xAxis');

            if (gxAxis[0][0] == undefined) {
                gxAxis = this.data('D3svg').select('.yPadding')
                    .append('g')
                        .attr('class', 'xAxis axis')
            }

            gxAxis.transition().call(xAxis);

        },

        svg2HTML : function() {
            var $container = $.jqElem('div')
                .append(this.data('$svg'));

            return $container.html();
        },

        renderYAxis : function() {

            if (this.yScale() == undefined) {
                return;
            }

            var yAxis =
                d3.svg.axis()
                    .scale(this.yScale())
                    .orient('left');

            var gyAxis = this.data('D3svg').select('.xPadding').select('.yAxis');

            if (gyAxis[0][0] == undefined) {
                gyAxis = this.data('D3svg').select('.xPadding')
                    .append('g')
                        .attr('class', 'yAxis axis')
                        .attr("transform", "translate(" + this.xPaddingBounds().size.width + ",0)")
            }

            gyAxis.transition().call(yAxis);
        },



        renderChart : function() {

        },

        setGutter : function(newGutter) {
            this.xGutter(newGutter);
            this.yGutter(newGutter);
        },

        setPadding : function(newPadding) {
            this.xPadding(newPadding);
            this.yPadding(newPadding);
        },

/*
        +------------------------+
        | UL|   yGutter      |UR |
        +------------------------+
        | X |   chart        | X |
        | P |                | G |
        +------------------------+
        | LL|   yPadding     |LR |
        +------------------------+
*/

        appendUI : function ($elem) {

            var D3svg;

            if (! this.options.parent) {
                $elem.append(
                    $.jqElem('style')
                        .html('.axis path, .axis line { fill : none; stroke : black; shape-rendering : crispEdges;} .axis text \
                            {font-family : sans-serif; font-size : 11px}')
                );

                D3svg = d3.select($elem.get(0))
                    .append('svg')
                    .attr('style', 'width : 100%; height : 100%')
                    //.attr('width', this.width())
                    //.attr('height', this.height())
                    //.attr('style', this.options.debug ? 'border : 1px solid blue' : undefined);
                    //.attr('style', 'width : 100%; height : 100%')

                var tooltip = d3.select('body').selectAll('.visToolTip')
                    .data([0])
                    .enter()
                        .append('div')
                            .attr('class', 'visToolTip')
                            .style(
                                {
                                    position                : 'absolute',
                                    'max-width'             : '300px',
                                    height                  : 'auto',
                                    padding                 : '10px',
                                    'background-color'      : 'white',
                                    '-webkit-border-radius' : '10px',
                                    '-moz-border-radius'    : '10px',
                                    'border-radius'         : '10px',
                                    '-webkit-box-shadow'    : '4px 4px 10px rgba(0, 0, 0, 0.4)',
                                    '-moz-box-shadow'       : '4px 4px 10px rgba(0, 0, 0, 0.4)',
                                    'box-shadow'            : '4px 4px 10px rgba(0, 0, 0, 0.4)',
                                    'pointer-events'        : 'none',
                                    'display'               : 'none',
                                    'font-family'           : 'sans-serif',
                                    'font-size'             : '12px',
                                    'line-height'           : '20px',
                                    'display'               : 'none',
                                }
                            )
                ;

                this.data('D3svg', D3svg);
            }
            else {
                this.$elem = this.options.parent.$elem;
                this.width(this.$elem.width());
                this.height(this.$elem.height());
                D3svg = this.options.parent.data('D3svg');
                this.data('D3svg', D3svg);
            }


            var regions = [
                'chart', //add the chart first, because we want it to be at the lowest level.
                'UL','UR','LL','LR', //corners are low priority
                'yGutter','xGutter','yPadding','xPadding'   //labels win
            ];

            //used when debug is on.
            var colors = [
                'red',      'green',    'blue',
                'cyan',     'magenta',  'yellow',
                'purple',   'orange',   'gray'
            ];

            D3svg.selectAll('defs').data([null]).enter().append('defs').attr('class', 'definitions');

            var $vis = this;

            var regionG = D3svg.selectAll('g')
                .data(regions)
                .enter()
                    .append('g')
                        .attr('class', function(region) { return region } )
                        .attr('data-x', $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.origin.x }, this) )
                        .attr('data-y', $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.origin.y }, this) )
                        .attr('data-width',  $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.size.width }, this) )
                        .attr('data-height', $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.size.height }, this) )
                        .attr('transform',
                            $.proxy(
                                function(region) {
                                    var bounds = this[region + 'Bounds']();
                                    return 'translate(' + bounds.origin.x + ',' + bounds.origin.y + ')';
                                }, this)
                        );

            regionG
                .append('rect')
                    .attr('x', 0 )
                    .attr('y', 0 )
                    .attr('width',  $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.size.width }, this) )
                    .attr('height', $.proxy(function(region) { var bounds = this[region + 'Bounds'](); return bounds.size.height }, this) )
                    .attr('fill', function(d) {return $vis.options.debug ? colors.shift() : $vis.options.bgColor})
                    .attr('class', 'background');

            $.each(
                regions,
                function (idx, region) {

                    D3svg.selectAll('.' + region).selectAll('g').data([{region : $vis.region(region, true)}], function (d) { return d.region })
                        .enter()
                            .append('g')
                            .attr('class', function(d) { return d.region})
                }
            );

            /*D3svg.selectAll('g').data(regions).selectAll('g')
                .data( regions.map( function(region) { return $vis.region(region, true) } ) )
                .enter()
                .append('g')
                    .attr('class', function(region) { return region } );

            ;*/

        },

        region : function(region, asName) {

            var dot = '';

            if (! asName) {
                dot = '.';
            }

            return dot + region + '-' + this.options.chartID;
        },

        ULBounds : function() {
            return new Rectangle(
                new Point(0, 0),
                new Size(this.xPadding(), this.yGutter())
            );
        },

        URBounds : function() {
            return new Rectangle(
                new Point(this.xPadding() + this.chartBounds().size.width, 0),
                new Size(this.xGutter(), this.yGutter())
            );
        },

        LLBounds : function() {
            return new Rectangle(
                new Point(0, this.yGutter() + this.chartBounds().size.height),
                new Size(this.xPadding(), this.yPadding())
            );
        },

        LRBounds : function() {
            return new Rectangle(
                new Point(this.xPadding() + this.chartBounds().size.width, this.yGutter() + this.chartBounds().size.height),
                new Size(this.xPadding(), this.yPadding())
            );
        },

        xPaddingBounds : function() {
            return new Rectangle(
                new Point(0, this.yGutter()),
                new Size(this.xPadding(), this.chartBounds().size.height)
            );
        },

        xGutterBounds : function() {
            return new Rectangle(
                new Point(this.xPadding() + this.chartBounds().size.width, this.yGutter()),
                new Size(this.xPadding(), this.chartBounds().size.height)
            );
        },

        yGutterBounds : function() {
            return new Rectangle(
                new Point(this.xPadding(), 0),
                new Size(this.chartBounds().size.width, this.yGutter())
            );
        },

        yPaddingBounds : function() {
            return new Rectangle(
                new Point(this.xPadding(), this.yGutter() + this.chartBounds().size.height),
                new Size(this.chartBounds().size.width, this.yPadding())
            );
        },

        chartBounds : function() {

            var widgetWidth  = this.width();
            var widgetHeight = this.height();

            return new Rectangle(
                new Point(this.xPadding(), this.yGutter()),
                new Size(
                    widgetWidth  - this.xPadding() - this.xGutter(),
                    widgetHeight - this.yGutter()  - this.yPadding()
                )
            );
        },

        showToolTip : function(args) {

            if (args.event == undefined) {
                args.event = d3.event;
            }

            d3.selectAll('.visToolTip')
                .style('display','block')
                .html(args.label)
                .style("left", (args.event.pageX+10) + "px")
                .style("top", (args.event.pageY-10) + "px");
        },

        hideToolTip : function(args) {
            d3.selectAll('.visToolTip').style('display', 'none');
        },

        radialGradient : function(grad) {

            grad = $.extend(
                true,
                {
                    cx : 0,
                    cy : 0,
                    stopColor : this.options.radialGradientStopColor,
                    r : this.chartBounds().size.width / 2,
                },
                grad
            );

            var gradKey = [grad.cx, grad.cy, grad.r, grad.startColor, grad.stopColor].join(',');

            /*$.each(
                this.radialGradients(),
                function (key, val) {
                    if (val == grad.id) {
                        return val;
                    }
                }
            );*/

            if (this.radialGradients()[gradKey] != undefined && grad.id == undefined) {
                grad.id = this.radialGradients()[gradKey];
            }

            if (grad.id == undefined) {
                grad.id = this.uuid();
            }


            //I'd prefer to .select('.definitions').selectAll('radialGradient') and then just let
            //d3 figure out the one that appropriately maps to my given grad value...but I couldn't
            //get that to work for some inexplicable reason.
            var gradient = this.data('D3svg').select('.definitions').selectAll('#' + grad.id)
                .data([grad]);

            var newGrad = false;

            gradient
                .enter()
                    .append('radialGradient')
                        .attr('id',
                            //as brilliant as this hack is, it's also godawful. I might as well put a goto here.
                            //this just returns the grad's id, as usual. BUT it also invokes a side effect to set
                            //a global flag (well, enclosing context flag) to say that this is a newly created gradient
                            //so down below we don't use any transition time to set the values. There's gotta be a better
                            //way to do this, but I couldn't figure it out.
                            function(d) {
                                newGrad = true;
                                return d.id
                            }
                        )
                        .attr('gradientUnits', 'userSpaceOnUse')
                        .attr('cx', function (d) {return d.cx})
                        .attr('cy', function (d) {return d.cy})
                        .attr('r', function (d) {return 2.5 * d.r})
                        .attr('spreadMethod', 'pad')
            ;

            var transitionTime = newGrad
                ? 0
                : this.options.transitionTime;

            var stop0 = gradient.selectAll('stop[offset="0%"]').data([grad]);
            stop0.enter()
                .append('stop')
                    .attr('offset', '0%');
            stop0.transition().duration(transitionTime)
                    .attr('stop-color', function (d) { return d.startColor});

            var stop30 = gradient.selectAll('stop[offset="30%"]').data([grad]);
            stop30.enter()
                .append('stop')
                    .attr('offset', '30%')
                    .attr('stop-opacity', 1)
            stop30.transition().duration(transitionTime)
                    .attr('stop-color', function (d) { return d.startColor});

            var stop70 = gradient.selectAll('stop[offset="70%"]').data([grad]);
            stop70.enter()
                .append('stop')
                    .attr('stop-opacity', 1)
                    .attr('offset', '70%');
            stop70.transition().duration(transitionTime)
                    .attr('stop-color', function (d) { return d.stopColor});

            return this.radialGradients()[gradKey] = grad.id;

        },

        wrap : function(text, width, xCoord) {

            if (xCoord == undefined) {
                xCoord = function() { return 0;}
            };


            text.each(function() {
                var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")) || 0,
                        tspan = text
                            .text(null)
                            .append("tspan")
                            .attr("x", xCoord)
                            .attr("y", y)
                            .attr("dy", dy + "em")
                        ;

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", xCoord)
                            .attr("y", y).
                            attr("dy", lineHeight + 'em')//++lineNumber * lineHeight + dy + "em")
                            .text(word)
                        ;
                    }
                }
            });
        },

        absPos : function(obj) {

            var box    = obj.getBBox();
            var matrix = obj.getScreenCTM();

            return { x : box.x + matrix.e, y : box.y + matrix.f};
        },


        endall : function (transition, callback) {
            var n = 0;
            transition
                .each(function() { ++n; })
                .each("end", function() { if (!--n) callback.apply(this, arguments); });
        },

        uniqueness : function(uniqueFunc) {
            if (uniqueFunc == undefined) {
                uniqueFunc = this.uniqueID;
            }

            return this.options.useUniqueID
                ? uniqueFunc
                : undefined;
        },

    });

} );